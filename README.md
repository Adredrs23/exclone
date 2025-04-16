# ExClone

A canvas-based drawing application built with Next.js and Fabric.js.

## Features

- Multiple drawing tools (freehand, rectangle, line, ellipse)
- Selection tool for modifying existing objects
- Customizable brush color and size
- Responsive canvas that adjusts to window size
- Delete objects with Delete/Backspace keys

## Project Structure

```
exclone/
├── src/
│   ├── app/
│   │   └── page.tsx              # Main application page
│   ├── components/
│   │   ├── Whiteboard/
│   │   │   └── Whiteboard.tsx    # Canvas drawing component
│   │   ├── Toolbar/
│   │   │   ├── Toolbar.tsx       # Toolbar component
│   │   │   ├── types.tsx         # Tool type definitions
│   │   │   └── index.ts          # Barrel file for exports
│   │   └── ui/                   # UI components from shadcn/ui
├── public/                        # Static assets
└── docs/                          # Documentation
    └── Whiteboard.md              # Whiteboard component documentation
```

## Components

### Whiteboard

The main drawing component that provides a canvas for users to create and manipulate various shapes and drawings. See [Whiteboard.md](./docs/Whiteboard.md) for detailed documentation.

### Toolbar

A component that provides controls for selecting drawing tools and customizing drawing properties.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- **Next.js**: React framework for building the application
- **Fabric.js**: Canvas manipulation library
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: UI component library

## Development

### Key Concepts

- **Canvas Persistence**: The canvas state is preserved when switching between tools
- **Tool Management**: Each tool has its own event handlers for mouse interactions
- **Responsive Design**: The canvas adjusts to the window size

### Best Practices

- Use the provided tools for drawing and manipulation
- Avoid clearing the canvas unnecessarily
- Use the selection tool to modify existing objects

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
