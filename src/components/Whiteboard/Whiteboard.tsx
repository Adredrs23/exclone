'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Line, Ellipse, PencilBrush, FabricObject } from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export type Tool =
	| 'draw'
	| 'select'
	| 'rectangle'
	| 'line'
	| 'ellipse'
	| 'clear';

export function Whiteboard() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricCanvasRef = useRef<Canvas | null>(null);
	const isInitializedRef = useRef(false);
	const [tool, setTool] = useState<Tool>('draw');
	const [brushColor, setBrushColor] = useState('#000000');
	const [brushSize, setBrushSize] = useState(3);

	const handleToolClick = useCallback((t: Tool) => () => setTool(t), [setTool]);

	// Initialize canvas only once
	useEffect(() => {
		if (isInitializedRef.current) return;

		const canvasEl = canvasRef.current;
		if (!canvasEl) return;

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

		window.addEventListener('resize', resize);

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

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('keydown', handleKeyDown);
			// canvas.dispose();
			// Only dispose the canvas when the component is unmounted
			if (fabricCanvasRef.current) {
				fabricCanvasRef.current.dispose();
				fabricCanvasRef.current = null;
			}
		};
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
			if (tool !== 'select') {
				canvas.forEachObject((obj) => (obj.selectable = false));
			}
		};

		// Clean up previous tool's settings
		cleanup();

		let startX = 0;
		let startY = 0;
		let shape: FabricObject | null = null;

		switch (tool) {
			case 'draw': {
				canvas.isDrawingMode = true;
				const brush = new PencilBrush(canvas);
				brush.color = brushColor;
				brush.width = brushSize;
				canvas.freeDrawingBrush = brush;
				break;
			}
			case 'rectangle': {
				const handleMouseDown = (opt: any) => {
					const pointer = canvas.getPointer(opt.e);
					startX = pointer.x;
					startY = pointer.y;

					shape = new Rect({
						left: startX,
						top: startY,
						fill: 'transparent',
						stroke: brushColor,
						strokeWidth: brushSize,
						width: 0,
						height: 0,
					});
					canvas.add(shape);
				};

				const handleMouseMove = (opt: any) => {
					if (!shape) return;
					const pointer = canvas.getPointer(opt.e);
					const rect = shape as Rect;
					rect.set({
						width: Math.abs(pointer.x - startX),
						height: Math.abs(pointer.y - startY),
						left: Math.min(startX, pointer.x),
						top: Math.min(startY, pointer.y),
					});
					canvas.renderAll();
				};

				const handleMouseUp = () => {
					shape = null;
				};

				canvas.on('mouse:down', handleMouseDown);
				canvas.on('mouse:move', handleMouseMove);
				canvas.on('mouse:up', handleMouseUp);
				break;
			}
			case 'line': {
				const handleMouseDown = (opt: any) => {
					const pointer = canvas.getPointer(opt.e);
					startX = pointer.x;
					startY = pointer.y;

					shape = new Line([startX, startY, startX, startY], {
						stroke: brushColor,
						strokeWidth: brushSize,
					});
					canvas.add(shape);
				};

				const handleMouseMove = (opt: any) => {
					if (!shape) return;
					const pointer = canvas.getPointer(opt.e);
					const line = shape as Line;
					line.set({ x2: pointer.x, y2: pointer.y });
					canvas.renderAll();
				};

				const handleMouseUp = () => {
					shape = null;
				};

				canvas.on('mouse:down', handleMouseDown);
				canvas.on('mouse:move', handleMouseMove);
				canvas.on('mouse:up', handleMouseUp);
				break;
			}
			case 'ellipse': {
				const handleMouseDown = (opt: any) => {
					const pointer = canvas.getPointer(opt.e);
					startX = pointer.x;
					startY = pointer.y;

					shape = new Ellipse({
						left: startX,
						top: startY,
						rx: 0,
						ry: 0,
						fill: 'transparent',
						stroke: brushColor,
						strokeWidth: brushSize,
					});
					canvas.add(shape);
				};

				const handleMouseMove = (opt: any) => {
					if (!shape) return;
					const pointer = canvas.getPointer(opt.e);
					const ellipse = shape as Ellipse;
					ellipse.set({
						rx: Math.abs(pointer.x - startX) / 2,
						ry: Math.abs(pointer.y - startY) / 2,
						left: Math.min(startX, pointer.x),
						top: Math.min(startY, pointer.y),
					});
					canvas.renderAll();
				};

				const handleMouseUp = () => {
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
				break;
			}
		}

		return cleanup;
	}, [tool, brushColor, brushSize]);

	return (
		<div className='p-2'>
			<div className='flex items-center gap-3 bg-gray-100 px-4 py-2 shadow-md sticky top-0 z-10'>
				{(
					['draw', 'select', 'rectangle', 'line', 'ellipse', 'clear'] as Tool[]
				).map((t) => (
					<Button
						key={t}
						variant={tool === t ? 'default' : 'outline'}
						onClick={handleToolClick(t)}
					>
						{t.charAt(0).toUpperCase() + t.slice(1)}
					</Button>
				))}

				{/* {tool === 'draw' && ( */}
				<div className='flex items-center gap-3 ml-6'>
					<label className='text-sm'>Color:</label>
					<Input
						type='color'
						value={brushColor}
						onChange={(e) => setBrushColor(e.target.value)}
						className='w-10 h-10 p-0 border-none'
					/>
					<label className='text-sm'>Size:</label>
					<Slider
						min={1}
						max={20}
						step={1}
						value={[brushSize]}
						onValueChange={(val) => setBrushSize(val[0])}
						className='w-32'
					/>
				</div>
			</div>
			<canvas
				ref={canvasRef}
				className='border border-gray-300 rounded shadow w-full h-[calc(100vh-80px)]'
			/>
		</div>
	);
}
