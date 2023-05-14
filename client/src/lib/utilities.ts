export function randomNum(max: number) {
	return Math.floor(Math.random() * max);
}

export const delay = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
