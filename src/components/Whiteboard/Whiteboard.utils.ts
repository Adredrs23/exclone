import { v4 as uuidv4 } from 'uuid';
import {} from './Whiteboard.types';
import { FabricObject } from 'fabric';
import {
	ExtendedFabricObject,
	SerializedObjectData,
} from '@/types/global.types';
import { Tool } from '../Toolbar/Toolbar.types';

export const generateId = (): string => uuidv4();

export const getToolOptions = (): Tool[] => [
	'select',
	'draw',
	'rectangle',
	'line',
	'ellipse',
	'clear',
];

export const handleToolClick =
	(setTool: (tool: Tool) => void) => (tool: Tool) => () => {
		setTool(tool);
	};

export const handleColorChange =
	(setBrushColor: (color: string) => void) =>
	(e: React.ChangeEvent<HTMLInputElement>) => {
		setBrushColor(e.target.value);
	};

export const handleSizeChange =
	(setBrushSize: (size: number) => void) => (val: number[]) => {
		setBrushSize(val[0]);
	};

export const getCanvasDimensions = () => ({
	width: window.innerWidth,
	height: window.innerHeight - 80,
});

export const serializeObject = (
	obj: ExtendedFabricObject
): SerializedObjectData => {
	const serialized = obj.toObject();
	return {
		...serialized,
		id: obj.id,
	};
};

export const deserializeObject = (
	data: SerializedObjectData
): ExtendedFabricObject => {
	const obj = new FabricObject(data);
	obj.id = data.id;
	return obj;
};
