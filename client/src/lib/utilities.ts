import { zParse, zodMessage } from '@packages/zod-data-types';

export function parseSocketMessage({ data }: MessageEvent) {
	if (typeof data !== 'string') return;

	const json: unknown = JSON.parse(data);
	const parsedData = zParse(zodMessage, json);
	return parsedData;
}

export function randomNum(max: number) {
	return Math.floor(Math.random() * max);
}
