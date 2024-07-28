export function randomNum(max: number) {
	return Math.floor(Math.random() * max);
}

export const delay = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export function generateUniqueId() {
	return (Date.now() + Math.trunc(Math.random() * 10_000)).toString(36);
}

export const debounce = <T extends (...args: unknown[]) => void>(
	fn: T,
	ms = 300,
): ((...args: Parameters<T>) => void) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};
