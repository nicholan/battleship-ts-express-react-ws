import { toast } from 'react-toastify';
import { GameInviteToast } from './GameInviteToast';
import { GameInviteToastProps } from './GameInviteToast';
import { RematchToastProps } from './RematchToast';
import { RematchToast } from './RematchToast';

type ToastKeys = 'INVITE' | 'INVITE_RECEIVED' | 'PLAYER_JOIN' | 'REMATCH_REQUEST' | 'GAME_START' | 'API_RESPONSE';

type Name = {
	name: string;
};

type ApiError = {
	message: string;
};

type ToastDispatchProps = Name | ApiError | GameInviteToastProps | RematchToastProps;

const toasts: Record<ToastKeys, (props?: ToastDispatchProps) => void> = {
	INVITE: (props) => {
		props &&
			'name' in props &&
			toast(
				<p>
					Invite sent to <span className="text-orange-400">{props.name}</span>
				</p>
			);
	},
	INVITE_RECEIVED: (props) => {
		props &&
			'joinGame' in props &&
			toast(<GameInviteToast {...props} />, {
				autoClose: 30000,
				hideProgressBar: false,
			});
	},
	PLAYER_JOIN: (props) => {
		props &&
			'name' in props &&
			toast(
				<p>
					<span className="text-orange-400">{props.name}</span> has joined the game!
				</p>
			);
	},
	REMATCH_REQUEST: (props) => {
		props &&
			'requestRematch' in props &&
			toast(<RematchToast {...props} />, {
				autoClose: 30000,
				hideProgressBar: false,
			});
	},
	GAME_START: () => {
		toast(<p>Game started!</p>);
	},
	API_RESPONSE: (props) => {
		props && 'message' in props && toast(<p>{props.message}</p>);
	},
} as const;

export function dispatchToast(action: ToastKeys, props?: ToastDispatchProps) {
	if (!Object.hasOwn(toasts, action)) return;
	toasts[action](props);
}
