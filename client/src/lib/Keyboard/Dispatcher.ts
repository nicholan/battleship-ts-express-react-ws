import type { Coordinates } from "@packages/zod-data-types";

const moveDown = (c: Coordinates) => {
	return { x: c.x, y: c.y < 9 ? ++c.y : 0 };
};

const moveUp = (c: Coordinates) => {
	return { x: c.x, y: c.y > 0 ? --c.y : 9 };
};

const moveLeft = (c: Coordinates) => {
	return { x: c.x > 0 ? --c.x : 9, y: c.y };
};

const moveRight = (c: Coordinates) => {
	return { x: c.x < 9 ? ++c.x : 0, y: c.y };
};

export const keyboardDispatch = () => {
	const keyMap = {
		KeyS: (c: Coordinates) => moveDown(c),
		KeyA: (c: Coordinates) => moveLeft(c),
		KeyD: (c: Coordinates) => moveRight(c),
		KeyW: (c: Coordinates) => moveUp(c),
	} as const;

	const move = (code: string, current: Coordinates) => {
		const copy = { ...current };
		if (code in keyMap) {
			return keyMap[code as keyof typeof keyMap](copy);
		}
	};

	return { move };
};
