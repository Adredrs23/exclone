import { useCallback } from 'react';
import {
	Canvas,
	Rect,
	Line,
	Ellipse,
	TPointerEvent,
	TPointerEventInfo,
} from 'fabric';
import { Tool } from '../components/Toolbar/Toolbar.types';

export const useToolHandlers = (
	canvas: Canvas | null,
	tool: Tool,
	brushColor: string,
	brushSize: number
) => {
	let startX = 0;
	let startY = 0;
	let shape: Rect | Line | Ellipse | null = null;

	const handleMouseDown = useCallback(
		(opt: TPointerEventInfo<TPointerEvent>) => {
			if (!canvas) return;
			const pointer = canvas.getPointer(opt.e);
			startX = pointer.x;
			startY = pointer.y;

			switch (tool) {
				case 'rectangle':
					shape = new Rect({
						left: startX,
						top: startY,
						fill: 'transparent',
						stroke: brushColor,
						strokeWidth: brushSize,
						width: 0,
						height: 0,
					});
					break;
				case 'line':
					shape = new Line([startX, startY, startX, startY], {
						stroke: brushColor,
						strokeWidth: brushSize,
					});
					break;
				case 'ellipse':
					shape = new Ellipse({
						left: startX,
						top: startY,
						rx: 0,
						ry: 0,
						fill: 'transparent',
						stroke: brushColor,
						strokeWidth: brushSize,
					});
					break;
			}
		},
		[canvas, tool, brushColor, brushSize]
	);

	const handleMouseMove = useCallback(
		(opt: TPointerEventInfo<TPointerEvent>) => {
			if (!canvas || !shape) return;
			const pointer = canvas.getPointer(opt.e);

			switch (tool) {
				case 'rectangle': {
					const rect = shape as Rect;
					rect.set({
						width: Math.abs(pointer.x - startX),
						height: Math.abs(pointer.y - startY),
						left: Math.min(startX, pointer.x),
						top: Math.min(startY, pointer.y),
					});
					break;
				}
				case 'line': {
					const line = shape as Line;
					line.set({ x2: pointer.x, y2: pointer.y });
					break;
				}
				case 'ellipse': {
					const ellipse = shape as Ellipse;
					ellipse.set({
						rx: Math.abs(pointer.x - startX) / 2,
						ry: Math.abs(pointer.y - startY) / 2,
						left: Math.min(startX, pointer.x),
						top: Math.min(startY, pointer.y),
					});
					break;
				}
			}

			if (shape.canvas) {
				canvas.renderAll();
			} else {
				canvas.add(shape);
			}
		},
		[canvas, tool]
	);

	const handleMouseUp = useCallback(() => {
		if (!canvas || !shape) return;

		switch (tool) {
			case 'rectangle': {
				const rect = shape as Rect;
				if (rect.width !== 0 && rect.height !== 0) {
					if (shape.canvas) {
						canvas.remove(shape);
					}
					canvas.add(shape);
					canvas.renderAll();
				}
				break;
			}
			case 'line': {
				const line = shape as Line;
				if (line.x2 !== startX || line.y2 !== startY) {
					if (shape.canvas) {
						canvas.remove(shape);
					}
					canvas.add(shape);
					canvas.renderAll();
				}
				break;
			}
			case 'ellipse': {
				const ellipse = shape as Ellipse;
				if (ellipse.rx !== 0 && ellipse.ry !== 0) {
					if (shape.canvas) {
						canvas.remove(shape);
					}
					canvas.add(shape);
					canvas.renderAll();
				}
				break;
			}
		}
		shape = null;
	}, [canvas, tool]);

	return { handleMouseDown, handleMouseMove, handleMouseUp };
};
