type Props = {
	type: 'num' | 'letter';
	axis: 'row' | 'column';
	gridArea: string;
};

export function CoordinatesBar({ type, axis, gridArea }: Props) {
	const content = type === 'num' ? getNumbers() : getLetters();

	return (
		<div
			className={`${gridArea} font-bebas-neue text-xl !leading-[0px] select-none text-black/90 text-center flex`}
			style={axis === 'row' ? { flexDirection: 'row' } : { flexDirection: 'column' }}
		>
			{content}
		</div>
	);
}

const squareCSS = 'grid place-items-center h-full w-full';

function getNumbers() {
	const numbers = [];
	for (let i = 1; i < 11; i++) {
		numbers.push(
			<div className={squareCSS} key={i}>
				{i}
			</div>
		);
	}
	return numbers;
}

function getLetters() {
	const letters = [];
	for (let i = 97; i < 107; i++) {
		letters.push(
			<div className={squareCSS} key={i}>
				{String.fromCharCode(i)}
			</div>
		);
	}
	return letters;
}
