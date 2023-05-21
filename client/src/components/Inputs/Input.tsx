import { FC, forwardRef, ComponentPropsWithRef } from 'react';
import classNames from 'classnames';

export type InputType = 'text' | 'email' | 'checkbox';

export type InputProps = {
	id: string;
	name: string;
	label: string;
	type?: InputType;
	placeholder?: string;
	className?: string;
} & ComponentPropsWithRef<'input'>;

// eslint-disable-next-line react/display-name
export const Input: FC<InputProps> = forwardRef<HTMLInputElement, InputProps>(
	({ id, name, label, type = 'text', className = '', placeholder = '', ...props }, ref) => {
		return (
			<input
				id={id}
				tabIndex={0}
				ref={ref}
				name={name}
				type={type}
				aria-label={label}
				placeholder={placeholder}
				className={classNames(
					[className],
					['text-black font-roboto'],
					['p-2 md:p-3'],
					['dark:bg-neutral-50'],
					['border rounded-sm'],
					['shadow-sm dark:shadow-inner']
				)}
				{...props}
			/>
		);
	}
);
