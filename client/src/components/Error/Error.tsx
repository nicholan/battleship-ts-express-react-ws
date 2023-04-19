import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export function ErrorPage() {
    const error = useRouteError();
    console.log(error);

    const msg = isRouteErrorResponse(error) ? <p>{error.status} {error.statusText}</p> : null;

    return (
        <div id="error-page">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            {msg && msg}
        </div>
    );
}