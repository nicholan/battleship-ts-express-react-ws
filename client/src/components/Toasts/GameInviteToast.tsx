import type { ToastContentProps } from 'react-toastify';
import { Button } from '../Buttons/Button.js';

export type GameInviteToastProps = {
	gameId: string;
	name: string;
	hostName: string;
	joinGame: (name: string, gameId: string) => Promise<void>;
};

export const GameInviteToast = ({
	closeToast,
	joinGame,
	gameId,
	hostName,
	name,
}: Partial<ToastContentProps> & GameInviteToastProps) => {
	return (
		<div className="px-8 py-4 flex flex-col gap-4">
			<p>
				Invitation from <span className="text-orange-400 tracking-wider">{hostName}</span>
			</p>
			<div className="flex gap-2 flex-row justify-center">
				<Button onClick={async () => await joinGame(name, gameId)}>Accept</Button>
				<Button onClick={() => closeToast && closeToast()}>Decline</Button>
			</div>
		</div>
	);
};
