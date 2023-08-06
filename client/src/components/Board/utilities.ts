export type BoardSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export const KEYS = ['KeyE', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];

export const boardSizeMap: { [key in BoardSize]: number } = {
	xxs: 350,
	xs: 400,
	sm: 500,
	md: 380,
	lg: 460,
} as const;

export function getCoordinates(
	{ pageX, pageY }: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
	canvas: HTMLCanvasElement | null,
	size: number
) {
	if (!canvas) {
		return null;
	}

	const { offsetLeft, offsetTop } = canvas;
	const x = Math.floor(((pageX - offsetLeft) / size) * 10);
	const y = Math.floor(((pageY - offsetTop) / size) * 10);

	return {
		x: x < 0 ? 0 : x,
		y: y < 0 ? 0 : y,
	};
}
