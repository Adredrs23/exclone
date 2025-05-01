export type Tool =
	| 'draw'
	| 'select'
	| 'rectangle'
	| 'line'
	| 'ellipse'
	| 'clear';

export type ToolbarProps = {
	tool: Tool;
	brushColor: string;
	brushSize: number;
	onToolChange: (tool: Tool) => void;
	onColorChange: (color: string) => void;
	onSizeChange: (size: number) => void;
};
