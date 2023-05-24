import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export default function Error() {
	const error = useRouteError();
	const msg = isRouteErrorResponse(error) ? (
		<p>{error.statusText}</p>
	) : (
		<p>Sorry, an unexpected error has occured.</p>
	);

	return (
		<div
			id="error-page"
			className="mx-auto my-0 flex justify-center text-neutral-800 dark:text-neutral-100 mt-8 text-xl font-roboto"
		>
			{msg}
		</div>
	);
}
