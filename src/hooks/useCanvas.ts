import { useEffect, useRef } from 'react';
import { Canvas, FabricObject } from 'fabric';

export const useCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
	const fabricCanvasRef = useRef<Canvas | null>(null);
	const isInitializedRef = useRef(false);

	useEffect(() => {
		const init = () => {
			if (isInitializedRef.current) return;

			const canvasEl = canvasRef.current;
			if (!canvasEl) return;

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

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Delete' || e.key === 'Backspace') {
					const active = canvas.getActiveObject();

					if (active) {
						canvas.remove(active);
						canvas.renderAll();
					}
				}
			};

			window.addEventListener('resize', resize);
			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('resize', resize);
				window.removeEventListener('keydown', handleKeyDown);

				if (fabricCanvasRef.current) {
					fabricCanvasRef.current.dispose();
					fabricCanvasRef.current = null;
				}
			};
		};

		const cleanup = init();
		return cleanup;
	}, [canvasRef]);

	return { fabricCanvasRef };
};
