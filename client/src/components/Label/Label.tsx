import { ComponentPropsWithoutRef } from 'react';
import classNames from 'classnames';

export function Label({ children, className, ...props }: ComponentPropsWithoutRef<'label'>) {
	return (
		<label
			className={classNames(
				[className],
				['p-1 sm:p-2'],
				['inline-block'],
				['text-lg lg:text-xl'],
				['font-staatliches tracking-wider'],
				['text-neutral-700 dark:text-neutral-100']
			)}
			{...props}
		>
			{children}
		</label>
	);
}
