# Whiteboard Component

The Whiteboard component is a canvas-based drawing tool that allows users to create and manipulate various shapes and drawings.

## Features

- **Multiple Drawing Tools**: Supports various drawing tools including:

  - Freehand drawing
  - Rectangle
  - Line
  - Ellipse
  - Selection tool
  - Clear canvas

- **Customizable Drawing Properties**:

  - Adjustable brush color
  - Adjustable brush size

- **Canvas Management**:
  - Responsive canvas that adjusts to window size
  - Delete objects with Delete/Backspace keys

## Implementation Details

The Whiteboard component is built using:

- React for the UI framework
- Fabric.js for canvas manipulation
- Tailwind CSS for styling

### Key Technical Aspects

1. **Canvas Initialization**:

   - The canvas is initialized only once using a ref to prevent re-initialization on re-renders
   - The canvas dimensions are set based on the window size

2. **Tool Management**:

   - Tools are managed using React state
   - Each tool has its own event handlers for mouse interactions
   - Tool switching preserves the canvas state

3. **Event Handling**:
   - Mouse events (down, move, up) are used for drawing
   - Keyboard events for delete operations

## Usage

```tsx
import { Whiteboard } from '@/components/Whiteboard/Whiteboard';

export default function HomePage() {
	return (
		<main className='min-h-screen bg-gray-100'>
			<Whiteboard />
		</main>
	);
}
```

## Props

The Whiteboard component is a self-contained component that manages its own state. It does not accept any props.

## State Management

The component manages the following state internally:

- `tool`: The currently selected drawing tool
- `brushColor`: The color of the brush
- `brushSize`: The size of the brush

## Event Handlers

- `handleToolClick`: Changes the active tool
- Mouse event handlers for each drawing tool
- Keyboard event handlers for delete operations

## Styling

The component uses Tailwind CSS for styling and includes:

- A toolbar with tool selection buttons
- Color and size controls
- A responsive canvas area
