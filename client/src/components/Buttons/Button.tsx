import classNames from "classnames";
import type { ComponentPropsWithoutRef } from "react";

export function Button({
	children,
	className,
	type = "button",
	...props
}: ComponentPropsWithoutRef<"button">) {
	return (
		<button
			className={classNames(
				className,
				{
					"bg-gradient-to-r from-orange-400 to-orange-500 hover:scale-105 active:scale-100 duration-75":
						!props.disabled,
					"bg-neutral-700": props.disabled,
				},
				["rounded-sm shadow shadow-black/20 w-max select-none"],
				["px-3 md:px-4 lg:px-5"],
				["py-[6px] md:py-2 lg:py-[10px]"],
				["text-base md:text-lg lg:text-xl"],
				["text-white text-shadow-sm font-staatliches tracking-widest"],
			)}
			type={type}
			{...props}
		>
			{children}
		</button>
	);
}
