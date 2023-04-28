import './Buttons.css';

type Props = {
	text: string;
	color?: string;
	disabled?: boolean;
	onClick?: () => void;
};

export function Button({ text, onClick, disabled }: Props) {
	return (
		<button className={'btn'} onClick={onClick} disabled={disabled}>
			{text}
		</button>
	);
}
