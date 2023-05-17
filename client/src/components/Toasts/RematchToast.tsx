import type { ToastContentProps } from 'react-toastify';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from '../Buttons/Button.js';

export type RematchToastProps = {
	name: string;
	requestRematch: () => void;
	setRematchModalVisible: Dispatch<SetStateAction<boolean>>;
};

export const RematchToast = ({
	closeToast,
	name,
	requestRematch,
	setRematchModalVisible,
}: Partial<ToastContentProps> & RematchToastProps) => {
	return (
		<div className="px-8 py-4 flex flex-col gap-4">
			<p>
				<span className="text-orange-400 tracking-wider">{name}</span> has requested rematch!
			</p>
			<div className="flex gap-2 flex-row justify-center">
				<Button onClick={() => requestRematch()}>Accept</Button>
				<Button
					onClick={() => {
						closeToast && closeToast();
						setRematchModalVisible(true);
					}}
				>
					Decline
				</Button>
			</div>
		</div>
	);
};
