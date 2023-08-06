export function getUrlParams(url: string) {
	const parts = url.split('/').filter((part) => part !== '');
	const playerName = parts[parts.length - 1]; // Get the last part
	const gameCode = parts[parts.length - 2]; // Get the second-to-last part

	return { gameCode, playerName };
}
