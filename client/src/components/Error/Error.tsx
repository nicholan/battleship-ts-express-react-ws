import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export function ErrorPage() {
	const error = useRouteError();
	const msg = isRouteErrorResponse(error) ? (
		<p className="text-xl font-roboto">{error.statusText}</p>
	) : (
		<p className="text-xl font-roboto">Sorry, an unexpected error has occured.</p>
	);

	return (
		<div id="error-page" className="mx-auto my-0 flex justify-center">
			{msg}
		</div>
	);
}
