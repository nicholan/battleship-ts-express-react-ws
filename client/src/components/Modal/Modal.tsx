import { useState, type ComponentPropsWithoutRef } from 'react';

type ModalProps = {
	onClose?: () => void;
};

export function Modal({ children, onClose, ...props }: ComponentPropsWithoutRef<'div'> & ModalProps) {
	const [visible, setVisible] = useState(true);

	const closeButton = (
		<div
			onClick={() => {
				setVisible(false);
				onClose && onClose();
			}}
			className="absolute text-3xl top-3 right-3 h-8 w-8 cursor-pointer leading-[0px] grid place-items-center font-roboto text-white hover:text-orange-400"
		>
			×
		</div>
	);

	if (!visible) return null;

	return (
		<div className="absolute left-0 top-0 w-full h-full grid bg-black/30">
			<div className="relative place-self-center p-12 rounded shadow-md bg-black/90 text-white">
				{closeButton}
				<div {...props}>{children}</div>
			</div>
		</div>
	);
}
