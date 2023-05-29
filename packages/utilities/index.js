export function randomNum(max) {
	return Math.floor(Math.random() * max);
}
export const delay = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
export function generateUniqueId() {
	return (Date.now() + Math.trunc(Math.random() * 10000)).toString(36);
}
export const debounce = (fn, ms = 300) => {
	let timeoutId;
	return function (...args) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

//# sourceMappingURL=index.js.map
