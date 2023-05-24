import type { ComponentPropsWithoutRef } from 'react';
import classNames from 'classnames';

type Position = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
	tooltipText: string;
	position: Position;
} & ComponentPropsWithoutRef<'span'>;

const positionMap: Record<Position, string> = {
	top: 'bottom-0 -translate-y-full left-1/2 transform -translate-x-1/2',
	bottom: 'top-0 translate-y-full left-1/2 transform -translate-x-1/2',
	left: '-top-1 -left-2 -translate-x-full',
	right: '-top-1 -right-2 translate-x-full',
};

export const Tooltip = ({ children, tooltipText, position = 'bottom', ...props }: TooltipProps) => {
	return (
		<span tabIndex={-1} role="tooltip" className={classNames(['relative group'])}>
			{children}
			<span
				tabIndex={-1}
				className={classNames(
					[positionMap[position]],
					['bg-neutral-900 text-neutral-100'],
					['px-2 py-1 rounded'],
					['absolute'],
					[
						'opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100',
					],
					['delay-300 group-focus-visible:delay-0'],
					['select-none pointer-events-none']
				)}
				{...props}
			>
				{tooltipText}
			</span>
		</span>
	);
};
