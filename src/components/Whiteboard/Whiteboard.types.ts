import { TPointerEvent } from 'fabric';
import { SocketDetails } from '@/types/global.types';
import { Tool } from '../Toolbar/Toolbar.types';

export type CanvasEventOpts = {
	e: TPointerEvent;
};

export type WhiteboardProps = Record<string, never>;

export type WhiteboardState = {
	tool: Tool;
	brushColor: string;
	brushSize: number;
	socketDetails: SocketDetails;
};

export type ToolOptions = {
	label: string;
	value: Tool;
	icon?: React.ReactNode;
};
