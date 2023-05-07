import { DetailedHTMLProps, LabelHTMLAttributes, FC } from 'react';
import classNames from 'classnames';

type LabelSize = 'sm' | 'md' | 'lg' | 'none';

type LabelProps = {
	size?: LabelSize;
} & Omit<DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, 'size'>;

const sizeMap: { [key in LabelSize]: string } = {
	none: 'p-0',
	sm: 'p-2',
	md: 'p-3',
	lg: 'p-4',
};

export const Label: FC<LabelProps> = ({ children, size = 'none', className, ...props }: LabelProps) => {
	return (
		<label className={classNames([sizeMap[size], className])} {...props}>
			{children}
		</label>
	);
};
