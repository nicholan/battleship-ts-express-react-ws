import classNames from "classnames";
import type { ComponentPropsWithoutRef } from "react";

type Nametag = {
	active: boolean;
} & ComponentPropsWithoutRef<"div">;

export function Nametag({ active, children, className, ...props }: Nametag) {
	return (
		<div
			className={classNames(
				[className],
				["grid items-center"],
				["text-lg md:text-xl lg:text-2xl"],
				["py-1 lg:py-0"],
				["tracking-wider font-staatliches text-center"],
				["select-none"],
				[active ? "text-orange-400" : "text-neutral-800 dark:text-neutral-50"],
			)}
			{...props}
		>
			{children ?? "Player"}
		</div>
	);
}
