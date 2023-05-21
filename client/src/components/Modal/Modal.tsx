import { useState, type ComponentPropsWithoutRef } from 'react';
import classNames from 'classnames';

type ModalProps = {
	onClose?: () => void;
};

export function Modal({ children, onClose, ...props }: ComponentPropsWithoutRef<'div'> & ModalProps) {
	const [visible, setVisible] = useState(true);

	const closeButton = (
		<button
			tabIndex={0}
			onClick={() => {
				setVisible(false);
				onClose && onClose();
			}}
			className={classNames(
				['grid place-items-center'],
				['cursor-pointer'],
				['absolute top-3 right-3 h-8 w-8'],
				['text-3xl leading-[0px] font-roboto text-white hover:text-orange-400']
			)}
		>
			×
		</button>
	);

	if (!visible) return null;

	return (
		<dialog className="fixed left-0 top-0 w-full h-full grid p-0 m-0 bg-black/30 ">
			<div
				className={classNames(
					['relative place-self-center rounded shadow-md text-neutral-50'],
					['bg-gradient-to-b from-neutral-800 to-neutral-900'],
					['border dark:border-neutral-300/10'],
					['p-8 lg:p-12']
				)}
			>
				{closeButton}
				<div {...props}>{children}</div>
			</div>
		</dialog>
	);
}
