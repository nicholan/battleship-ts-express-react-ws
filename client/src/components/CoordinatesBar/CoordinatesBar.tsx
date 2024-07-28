import classNames from "classnames";
import type { ComponentPropsWithoutRef } from "react";

type Props = {
	type: "num" | "letter";
} & ComponentPropsWithoutRef<"div">;

export function CoordinatesBar({ type, className }: Props) {
	const content = type === "num" ? getNumbers(1, 10) : getLetters("A", "J");

	return (
		<div
			className={classNames(
				[className],
				["text-black dark:text-neutral-100"],
				["font-bebas-neue text-xl !leading-[0px] select-none"],
				["hidden lg:flex"],
			)}
			tabIndex={-1}
		>
			{content}
		</div>
	);
}

const style = classNames(["grid place-items-center"], ["w-full h-full"]);

function getNumbers(start: number, end: number) {
	const numbers = [];
	for (let i = start; i < end + 1; i++) {
		numbers.push(
			<div className={style} key={i}>
				{i}
			</div>,
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
			<div className={style} key={i}>
				{String.fromCharCode(i)}
			</div>,
		);
	}
	return letters;
}
