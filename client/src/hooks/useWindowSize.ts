import { debounce } from "@packages/utilities";
import { useEffect, useState } from "react";

type WindowSize = {
	width: number;
	height: number;
};

export function useWindowSize(debounceMs = 300) {
	const [windowSize, setWindowSize] = useState<WindowSize>({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		const debouncedResizeHandler = debounce(() => {
			setWindowSize({ width: window.innerWidth, height: window.innerHeight });
		}, debounceMs);

		window.addEventListener("resize", debouncedResizeHandler);
		return () => window.removeEventListener("resize", debouncedResizeHandler);
	}, [debounceMs]);

	return windowSize;
}
