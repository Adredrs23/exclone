'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Canvas,
	Rect,
	Line,
	Ellipse,
	PencilBrush,
	FabricObject,
	util,
	TPointerEvent,
	TPointerEventInfo,
} from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { io, Socket } from 'socket.io-client';
import {
	ExtendedFabricObject,
	SerializedObjectData,
} from '@/types/global.types';
import { WhiteboardState } from './Whiteboard.types';
import { generateId } from './Whiteboard.utils';
import { Tool } from '../Toolbar/Toolbar.types';

export const Whiteboard = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricCanvasRef = useRef<Canvas | null>(null);
	const isInitializedRef = useRef(false);
	const [state, setState] = useState<WhiteboardState>({
		tool: 'select',
		brushColor: '#000000',
		brushSize: 5,
		socketDetails: null,
	});
	const socketRef = useRef<Socket | null>(null);

	const handleToolClick = useCallback(
		(t: Tool) => () => setState((prev) => ({ ...prev, tool: t })),
		[setState]
	);

	const toolOptions = useMemo(
		() => ['select', 'draw', 'rectangle', 'line', 'ellipse', 'clear'] as Tool[],
		[]
	);

	const handleColorChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) =>
			setState((prev) => ({ ...prev, brushColor: e.target.value })),
		[]
	);

	const handleSizeChange = useCallback(
		(val: number[]) => setState((prev) => ({ ...prev, brushSize: val[0] })),
		[]
	);

	// Initialize canvas only once
	useEffect(() => {
		const init = async () => {
			if (isInitializedRef.current) return;

			const canvasEl = canvasRef.current;
			if (!canvasEl) return;

			const socket = await io('http://localhost:8080');
			socketRef.current = socket;

			socket.on('connect', () => {
				setState((prev) => ({
					...prev,
					socketDetails: {
						clientId: socket.id,
					},
				}));
			});

			FabricObject.prototype.toObject = (function (toObject) {
				return function (this: FabricObject, properties: string[] = []) {
					return toObject.call(this, [...properties, 'id']);
				};
			})(FabricObject.prototype.toObject);

			const canvas = new Canvas(canvasEl, {
				backgroundColor: '#fff',
			});

			canvas.setDimensions({
				width: window.innerWidth,
				height: window.innerHeight - 80,
			});
			canvas.renderAll();

			fabricCanvasRef.current = canvas;
			isInitializedRef.current = true;

			const resize = () => {
				canvas.setDimensions({
					width: window.innerWidth,
					height: window.innerHeight - 80,
				});
				canvas.renderAll();
			};

			// Delete key
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Delete' || e.key === 'Backspace') {
					const active = canvas.getActiveObject();

					if (active) {
						canvas.remove(active);
						canvas.renderAll();
					}
				}
			};

			// socket events
			// Emit events to server
			canvas.on('object:added', (e: { target: ExtendedFabricObject }) => {
				if (!e.target) return;
				if (!e.target.id) {
					e.target.id = generateId();
				}

				if (e.target.__skipEmit) return;
				socket.emit('object:added', e.target.toJSON());
			});

			canvas.on('object:modified', (e: { target: ExtendedFabricObject }) => {
				const obj = e.target;
				if (!obj || obj.__skipEmit) return;
				socket.emit('object:modified', obj.toJSON());
			});

			canvas.on('object:removed', (e: { target: ExtendedFabricObject }) => {
				const obj = e.target;
				if (!obj || obj.__skipEmit) return;
				socket.emit('object:removed', obj.toJSON());
			});

			// Listen for events from server
			socket.on('object:added', (objectData: SerializedObjectData) => {
				util
					.enlivenObjects([objectData])
					.then(([obj]) => {
						const extendedObj = obj as ExtendedFabricObject;
						if (
							!canvas
								.getObjects()
								.find((o) => (o as ExtendedFabricObject).id === extendedObj.id)
						) {
							extendedObj.__skipEmit = true;
							canvas.add(extendedObj);
							canvas.renderAll();
						}
					})
					.catch(console.error);
			});

			socket.on('object:modified', (objectData: SerializedObjectData) => {
				const obj = canvas
					.getObjects()
					.find(
						(o) => (o as ExtendedFabricObject).id === objectData.id
					) as ExtendedFabricObject;
				if (obj) {
					obj.__skipEmit = true;
					obj.set({ ...objectData });
					canvas.renderAll();
				}
			});

			socket.on('object:removed', (objectData: SerializedObjectData) => {
				const obj = canvas
					.getObjects()
					.find(
						(o) => (o as ExtendedFabricObject).id === objectData.id
					) as ExtendedFabricObject;
				if (obj) {
					obj.__skipEmit = true;
					canvas.remove(obj);
					canvas.renderAll();
				}
			});

			socket.on('canvas:clear', () => {
				canvas.clear();
			});

			socket.on(
				'object:sync',
				(payload: { objects: SerializedObjectData[] }) => {
					util.enlivenObjects(payload.objects).then((objects) => {
						canvas.clear();
						objects.forEach((obj) => {
							const extendedObj = obj as ExtendedFabricObject;
							extendedObj.__skipEmit = true;
							canvas.add(extendedObj);
						});
						canvas.renderAll();
					});
				}
			);

			window.addEventListener('resize', resize);
			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('resize', resize);
				window.removeEventListener('keydown', handleKeyDown);
				socket.off('object:added');
				socket.off('object:removed');
				socket.off('object:modified');
				socket.off('object:sync');

				if (socketRef.current) {
					socketRef.current.disconnect();
					socketRef.current = null;
				}

				// canvas.dispose();
				// Only dispose the canvas when the component is unmounted
				if (fabricCanvasRef.current) {
					fabricCanvasRef.current.dispose();
					fabricCanvasRef.current = null;
				}
			};
		};

		init();
	}, []);

	// Handle tool changes without reinitializing the canvas
	useEffect(() => {
		const canvas = fabricCanvasRef.current;
		if (!canvas) return;

		// Cleanup function to remove all event listeners
		const cleanup = () => {
			// Only disable drawing mode and selection, don't clear the canvas
			canvas.isDrawingMode = false;
			canvas.selection = false;

			// Remove event listeners
			canvas.off('mouse:down');
			canvas.off('mouse:move');
			canvas.off('mouse:up');

			// Make objects non-selectable for non-select tools
			if (state.tool !== 'select') {
				canvas.forEachObject((obj) => (obj.selectable = false));
			}
		};

		// Clean up previous tool's settings
		cleanup();

		let startX = 0;
		let startY = 0;
		let shape: FabricObject | null = null;

		switch (state.tool) {
			case 'rectangle': {
				const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
					const pointer = canvas.getPointer(opt.e);
					startX = pointer.x;
					startY = pointer.y;

					shape = new Rect({
						left: startX,
						top: startY,
						fill: 'transparent',
						stroke: state.brushColor,
						strokeWidth: state.brushSize,
						width: 0,
						height: 0,
					});
				};

				const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
					if (!shape) return;
					const pointer = canvas.getPointer(opt.e);
					const rect = shape as Rect;
					rect.set({
						width: Math.abs(pointer.x - startX),
						height: Math.abs(pointer.y - startY),
						left: Math.min(startX, pointer.x),
						top: Math.min(startY, pointer.y),
					});
					if (shape.canvas) {
						canvas.renderAll();
					} else {
						canvas.add(shape);
					}
				};

				const handleMouseUp = () => {
					if (shape) {
						if (shape.width !== 0 && shape.height !== 0) {
							if (shape.canvas) {
								canvas.remove(shape);
							}
							canvas.add(shape);
							canvas.renderAll();
						}
					}
					shape = null;
				};

				canvas.on('mouse:down', handleMouseDown);
				canvas.on('mouse:move', handleMouseMove);
				canvas.on('mouse:up', handleMouseUp);
				break;
			}
			case 'line': {
				const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
					const pointer = canvas.getPointer(opt.e);
					startX = pointer.x;
					startY = pointer.y;

					shape = new Line([startX, startY, startX, startY], {
						stroke: state.brushColor,
						strokeWidth: state.brushSize,
					});
				};

				const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
					if (!shape) return;
					const pointer = canvas.getPointer(opt.e);
					const line = shape as Line;
					line.set({ x2: pointer.x, y2: pointer.y });
					if (shape.canvas) {
						canvas.renderAll();
					} else {
						canvas.add(shape);
					}
				};

				const handleMouseUp = () => {
					if (shape) {
						const line = shape as Line;
						if (line.x2 !== startX || line.y2 !== startY) {
							if (shape.canvas) {
								canvas.remove(shape);
							}
							canvas.add(shape);
							canvas.renderAll();
						}
					}
					shape = null;
				};

				canvas.on('mouse:down', handleMouseDown);
				canvas.on('mouse:move', handleMouseMove);
				canvas.on('mouse:up', handleMouseUp);
				break;
			}
			case 'ellipse': {
				const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
					const pointer = canvas.getPointer(opt.e);
					startX = pointer.x;
					startY = pointer.y;

					shape = new Ellipse({
						left: startX,
						top: startY,
						rx: 0,
						ry: 0,
						fill: 'transparent',
						stroke: state.brushColor,
						strokeWidth: state.brushSize,
					});
				};

				const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
					if (!shape) return;
					const pointer = canvas.getPointer(opt.e);
					const ellipse = shape as Ellipse;
					ellipse.set({
						rx: Math.abs(pointer.x - startX) / 2,
						ry: Math.abs(pointer.y - startY) / 2,
						left: Math.min(startX, pointer.x),
						top: Math.min(startY, pointer.y),
					});
					if (shape.canvas) {
						canvas.renderAll();
					} else {
						canvas.add(shape);
					}
				};

				const handleMouseUp = () => {
					if (shape) {
						const ellipse = shape as Ellipse;
						if (ellipse.rx !== 0 && ellipse.ry !== 0) {
							if (shape.canvas) {
								canvas.remove(shape);
							}
							canvas.add(shape);
							canvas.renderAll();
						}
					}
					shape = null;
				};

				canvas.on('mouse:down', handleMouseDown);
				canvas.on('mouse:move', handleMouseMove);
				canvas.on('mouse:up', handleMouseUp);
				break;
			}
			case 'select': {
				canvas.selection = true;
				canvas.forEachObject((obj) => (obj.selectable = true));
				break;
			}
			case 'clear': {
				canvas.clear();
				canvas.backgroundColor = '#fff';
				canvas.renderAll();
				if (socketRef.current) {
					socketRef.current.emit('canvas:clear');
				}
				break;
			}
			default:
			case 'draw': {
				canvas.isDrawingMode = true;
				const brush = new PencilBrush(canvas);
				brush.color = state.brushColor;
				brush.width = state.brushSize;
				canvas.freeDrawingBrush = brush;
				break;
			}
		}

		return cleanup;
	}, [state.tool, state.brushColor, state.brushSize]);

	return (
		<div className='p-2'>
			<div className='flex items-center gap-3 bg-gray-100 px-4 py-2 shadow-md sticky top-0 z-10'>
				{toolOptions.map((t) => (
					<Button
						key={t}
						variant={state.tool === t ? 'default' : 'outline'}
						onClick={handleToolClick(t)}
					>
						{t.charAt(0).toUpperCase() + t.slice(1)}
					</Button>
				))}

				<div className='flex items-center gap-3 ml-6'>
					<label className='text-sm'>Color:</label>
					<Input
						type='color'
						value={state.brushColor}
						onChange={handleColorChange}
						className='w-10 h-10 p-0 border-none'
					/>
					<label className='text-sm'>Size:</label>
					<Slider
						min={1}
						max={20}
						step={1}
						value={[state.brushSize]}
						onValueChange={handleSizeChange}
						className='w-32'
					/>
				</div>
			</div>
			<canvas
				ref={canvasRef}
				className='border border-gray-300 rounded shadow w-full h-[calc(100vh-80px)]'
			/>
			{state.socketDetails?.clientId && (
				<div className='fixed bottom-4 right-4 z-50 p-3 bg-black text-white text-sm rounded-xl shadow-xl opacity-90'>
					🧩 Connected as:{' '}
					<span className='font-mono text-green-300'>
						{state.socketDetails.clientId}
					</span>
				</div>
			)}
		</div>
	);
};
