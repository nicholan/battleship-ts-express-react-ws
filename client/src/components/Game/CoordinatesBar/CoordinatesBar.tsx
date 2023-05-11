type Props = {
	type: 'num' | 'letter';
	axis: 'row' | 'column';
	gridArea: string;
};

export function CoordinatesBar({ type, axis, gridArea }: Props) {
	const content = type === 'num' ? getNumbers(1, 10) : getLetters('A', 'J');

	return (
		<div
			className={`${gridArea} font-bebas-neue text-xl !leading-[0px] select-none text-black/90 text-center flex`}
			style={axis === 'row' ? { flexDirection: 'row' } : { flexDirection: 'column' }}
			tabIndex={-1}
		>
			{content}
		</div>
	);
}

function getNumbers(start: number, end: number) {
	const numbers = [];
	for (let i = start; i < end + 1; i++) {
		numbers.push(
			<div className="grid place-items-center h-full w-full" key={i}>
				{i}
			</div>
		);
	}
	return numbers;
}

function getLetters(start: string, end: string) {
	const letters = [];
	const s = start.charCodeAt(0);
	const e = end.charCodeAt(0);
	for (let i = s; i < e + 1; i++) {
		letters.push(
			<div className="grid place-items-center h-full w-full" key={i}>
				{String.fromCharCode(i)}
			</div>
		);
	}
	return letters;
}
