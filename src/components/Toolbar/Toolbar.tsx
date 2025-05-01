import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
	getToolOptions,
	handleToolClick,
	handleColorChange,
	handleSizeChange,
} from '../Whiteboard/Whiteboard.utils';
import { ToolbarProps } from './Toolbar.types';

export const Toolbar = ({
	tool,
	brushColor,
	brushSize,
	onToolChange,
	onColorChange,
	onSizeChange,
}: ToolbarProps) => {
	const toolOptions = getToolOptions();

	return (
		<div className='flex items-center gap-3 bg-gray-100 px-4 py-2 shadow-md sticky top-0 z-10'>
			{toolOptions.map((t) => (
				<Button
					key={t}
					variant={tool === t ? 'default' : 'outline'}
					onClick={handleToolClick(onToolChange)(t)}
				>
					{t.charAt(0).toUpperCase() + t.slice(1)}
				</Button>
			))}

			<div className='flex items-center gap-3 ml-6'>
				<label className='text-sm'>Color:</label>
				<Input
					type='color'
					value={brushColor}
					onChange={handleColorChange(onColorChange)}
					className='w-10 h-10 p-0 border-none'
				/>
				<label className='text-sm'>Size:</label>
				<Slider
					min={1}
					max={20}
					step={1}
					value={[brushSize]}
					onValueChange={handleSizeChange(onSizeChange)}
					className='w-32'
				/>
			</div>
		</div>
	);
};
