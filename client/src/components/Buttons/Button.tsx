import type { ComponentPropsWithoutRef } from 'react';
import classNames from 'classnames';

type InputSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
	size?: InputSize;
};

const sizeMap: { [key in InputSize]: string } = {
	sm: 'px-3 py-[6px] text-md',
	md: 'px-4 py-2 text-lg',
	lg: 'px-5 py-[10px] text-xl',
};

export function Button({
	children,
	className,
	size = 'lg',
	...props
}: ComponentPropsWithoutRef<'button'> & ButtonProps) {
	return (
		<button
			className={classNames(
				className,
				{
					'bg-neutral-700': props.disabled,
				},
				{
					'bg-gradient-to-r from-orange-400 to-orange-500 hover:scale-105 active:scale-100 duration-75':
						!props.disabled,
				},
				[
					'text-white rounded shadow text-shadow-sm shadow-black/20 font-staatliches tracking-widest w-max select-none',
				],
				[sizeMap[size]]
			)}
			{...props}
		>
			{children}
		</button>
	);
}
