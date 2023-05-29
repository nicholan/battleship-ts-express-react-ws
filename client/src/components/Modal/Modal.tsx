import { useState, useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import classNames from 'classnames';

type ModalProps = {
	onClose?: () => void;
	isVisible?: boolean;
};

export function Modal({ children, onClose, isVisible = true, ...props }: ComponentPropsWithoutRef<'div'> & ModalProps) {
	const [visible, setVisible] = useState(isVisible);
	const modalRef = useRef<HTMLDialogElement | null>(null);

	const closeButton = (
		<button
			aria-label="Close modal"
			tabIndex={0}
			onClick={() => {
				setVisible(false);
				onClose && onClose();
			}}
			className={classNames(
				['grid place-items-center'],
				['cursor-pointer'],
				['absolute top-3 right-3 h-8 w-8'],
				['text-2xl md:text-2xl font-roboto text-white hover:text-orange-400']
			)}
		>
			×
		</button>
	);

	const handleTabSelection = (event: KeyboardEvent) => {
		if (!modalRef.current) return;

		const focusableElements: NodeListOf<HTMLElement> = modalRef.current.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length < 1) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (!event.shiftKey && document.activeElement === lastElement) {
			event.preventDefault();
			firstElement.focus();
		} else if (event.shiftKey && document.activeElement === firstElement) {
			event.preventDefault();
			lastElement.focus();
		}
	};

	const handleKeyboardEvent = (event: KeyboardEvent) => {
		if (!Object.hasOwn(keyboardDispatch, event.key)) return;

		keyboardDispatch[event.key as keyof typeof keyboardDispatch](event);
	};

	const keyboardDispatch = {
		Escape: () => {
			onClose && onClose();
			setVisible(false);
		},
		Tab: (event: KeyboardEvent) => handleTabSelection(event),
	} as const;

	useEffect(() => {
		if (!modalRef.current) return;

		const input = modalRef.current.querySelector('input');
		if (input) {
			input.focus();
			return;
		}

		const button = modalRef.current.querySelector('button');
		if (button) {
			button.focus();
			return;
		}
	}, []);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyboardEvent);

		return () => {
			window.removeEventListener('keydown', handleKeyboardEvent);
		};
	}, []);

	if (!visible) return null;

	return (
		<dialog
			ref={modalRef}
			role="dialog"
			className={classNames(
				['fixed inset-0 left-0 top-0 w-screen h-screen'],
				['grid p-0 m-0 z-50'],
				['bg-black/30 pointer-events-auto']
			)}
		>
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
