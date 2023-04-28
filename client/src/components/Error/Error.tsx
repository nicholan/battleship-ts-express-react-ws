import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import './Error.css';

export function ErrorPage() {
    const error = useRouteError();
    const msg = isRouteErrorResponse(error) ? <p>{error.statusText}</p> : null;

    return (
        <div id="error-page">
            {!msg && <p>Sorry, an unexpected error has occured.</p>}
            {msg && msg}
        </div>
    );
}