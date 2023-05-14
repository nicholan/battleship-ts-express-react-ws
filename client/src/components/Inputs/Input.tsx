import { DetailedHTMLProps, InputHTMLAttributes, FC, forwardRef, ComponentPropsWithRef } from 'react';
import classNames from 'classnames';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'checkbox';

export type InputProps = {
	id: string;
	name: string;
	label: string;
	type?: InputType;
	size?: InputSize;
	placeholder?: string;
	className?: string;
} & ComponentPropsWithRef<
	'input' & Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'size'>
>;

const sizeMap: { [key in InputSize]: string } = {
	sm: 'p-2',
	md: 'p-3',
	lg: 'p-4',
};

// eslint-disable-next-line react/display-name
export const Input: FC<InputProps> = forwardRef<HTMLInputElement, InputProps>(
	({ id, name, label, type = 'text', size = 'md', className = '', placeholder = '', ...props }, ref) => {
		return (
			<input
				id={id}
				tabIndex={0}
				ref={ref}
				name={name}
				type={type}
				aria-label={label}
				placeholder={placeholder}
				className={classNames([sizeMap[size], className, 'text-black'])}
				{...props}
			/>
		);
	}
);
