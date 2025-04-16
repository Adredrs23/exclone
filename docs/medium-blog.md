# Building a Drawing App with Next.js and Fabric.js: A Beginner's Guide

## Introduction

Have you ever wondered how drawing applications like Excalidraw or Figma work? In this tutorial, I'll walk you through building a simple drawing application called ExClone using Next.js and Fabric.js. We'll create a canvas-based drawing tool with multiple drawing options, customizable brushes, and object manipulation capabilities.

## What We'll Build

ExClone is a web-based drawing application with the following features:

- Multiple drawing tools (freehand, rectangle, line, ellipse)
- Selection tool for modifying existing objects
- Customizable brush color and size
- Responsive canvas that adjusts to window size
- Delete objects with Delete/Backspace keys

## Prerequisites

Before we start, make sure you have:

- Basic knowledge of React and JavaScript
- Node.js installed on your computer
- A code editor (VS Code recommended)

## Setting Up the Project

Let's start by creating a new Next.js project:

```bash
npx create-next-app@latest exclone
cd exclone
```

When prompted, select the following options:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: Yes

Next, install the required dependencies:

```bash
npm install fabric
npm install @radix-ui/react-slider @radix-ui/react-slot class-variance-authority clsx lucide-react tailwind-merge
```

## Project Structure

Our project will have the following structure:

```
exclone/
├── src/
│   ├── app/
│   │   └── page.tsx              # Main application page
│   ├── components/
│   │   ├── Whiteboard/
│   │   │   └── Whiteboard.tsx    # Canvas drawing component
│   │   └── ui/                   # UI components from shadcn/ui
├── public/                        # Static assets
```

## Step 1: Creating the Whiteboard Component

The heart of our application is the Whiteboard component. Let's create it:

```typescript
// src/components/Whiteboard/Whiteboard.tsx
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
```

## Step 2: Setting Up the Main Page

Now, let's update the main page to use our Whiteboard component:

```typescript
// src/app/page.tsx
'use client';

import { Whiteboard } from '@/components/Whiteboard/Whiteboard';

export default function HomePage() {
	return (
		<main className='min-h-screen bg-gray-100'>
			<Whiteboard />
		</main>
	);
}
```

## Step 3: Understanding the Code

Let's break down the key parts of our Whiteboard component:

### Canvas Initialization

We initialize the Fabric.js canvas only once using a ref to track initialization:

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
const fabricCanvasRef = useRef<Canvas | null>(null);
const isInitializedRef = useRef(false);

// Initialize canvas only once
useEffect(() => {
	if (isInitializedRef.current) return;

	const canvasEl = canvasRef.current;
	if (!canvasEl) return;

	const canvas = new Canvas(canvasEl, {
		backgroundColor: '#fff',
	});

	// Set canvas dimensions
	canvas.setDimensions({
		width: window.innerWidth,
		height: window.innerHeight - 80,
	});

	// Store canvas reference
	fabricCanvasRef.current = canvas;
	isInitializedRef.current = true;

	// Add event listeners for resize and delete
	// ...

	// Cleanup function
	return () => {
		// ...
	};
}, []);
```

### Tool Management

We manage different drawing tools using a state variable and a switch statement:

```typescript
const [tool, setTool] = useState<Tool>('draw');

// Handle tool changes
useEffect(() => {
	const canvas = fabricCanvasRef.current;
	if (!canvas) return;

	// Cleanup previous tool's settings
	const cleanup = () => {
		// ...
	};

	cleanup();

	// Set up the new tool
	switch (tool) {
		case 'draw': {
			// Set up freehand drawing
			// ...
		}
		case 'rectangle': {
			// Set up rectangle drawing
			// ...
		}
		// Other tools...
	}

	return cleanup;
}, [tool, brushColor, brushSize]);
```

### Drawing Tools Implementation

Each drawing tool has its own implementation:

1. **Freehand Drawing**: Uses Fabric.js's built-in drawing mode
2. **Rectangle**: Creates a rectangle on mouse down and resizes it on mouse move
3. **Line**: Creates a line on mouse down and updates its end point on mouse move
4. **Ellipse**: Creates an ellipse on mouse down and resizes it on mouse move
5. **Selection**: Enables object selection and manipulation
6. **Clear**: Clears the entire canvas

## Step 4: Running the Application

Now you can run your application:

```bash
npm run dev
```

Visit http://localhost:3000 to see your drawing application in action!

## Key Concepts Explained

### 1. Canvas Persistence

One of the challenges in building drawing applications is maintaining the canvas state when switching between tools. We solve this by:

- Using a single canvas instance throughout the component's lifecycle
- Properly cleaning up event listeners when switching tools
- Not reinitializing the canvas when changing tools

### 2. Tool Management

Each tool has its own event handlers for mouse interactions:

- `mouse:down`: Start drawing or creating a shape
- `mouse:move`: Update the shape as the user drags
- `mouse:up`: Finalize the shape

### 3. Responsive Design

The canvas adjusts to the window size using:

- Event listeners for window resize
- Dynamic dimension calculations

## Conclusion

Congratulations! You've built a functional drawing application with Next.js and Fabric.js. This project demonstrates several important concepts:

- Working with HTML5 Canvas using Fabric.js
- Managing complex state in React applications
- Handling user interactions and events
- Creating a responsive UI with Tailwind CSS

## Next Steps

Here are some ideas to enhance your drawing application:

1. Add more drawing tools (polygon, text, etc.)
2. Implement undo/redo functionality
3. Add the ability to save and load drawings
4. Implement layers for more complex drawings
5. Add touch support for mobile devices

## Resources

- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

I hope this tutorial helped you understand how to build a drawing application with Next.js and Fabric.js. Feel free to reach out if you have any questions or need further assistance!
