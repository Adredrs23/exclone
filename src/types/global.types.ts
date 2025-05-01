import { FabricObject, TPointerEvent, TPointerEventInfo } from 'fabric';

// Extend FabricObject to include our custom properties
declare module 'fabric' {
	interface FabricObject {
		id?: string;
		__skipEmit?: boolean;
	}
}

export type ExtendedFabricObject = FabricObject & {
	id?: string;
	__skipEmit?: boolean;
};

export type SerializedObjectData = {
	id?: string;
	[key: string]: unknown;
};

export type SocketDetails = {
	clientId?: string;
} | null;

export type CanvasEventOpts = {
	e: TPointerEvent;
};

export type MouseEventHandlers = {
	handleMouseDown: (opt: TPointerEventInfo<TPointerEvent>) => void;
	handleMouseMove: (opt: TPointerEventInfo<TPointerEvent>) => void;
	handleMouseUp: () => void;
};
