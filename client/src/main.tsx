import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './routes/Root';
import { ErrorPage } from './components/Error/Error';
import { Index } from './routes/Index';
import { Create } from './routes/Create';
import { Join } from './routes/Join';
import { Lobby } from './routes/Lobby';
import { loader as lobbyLoader } from './routes/Lobby';
import './styles.css';

import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                index: true,
                element: <Index />,
            },
            {
                path: '/create',
                element: <Create />,
            },
            {
                path: '/join',
                element: <Join />,
            },
            {
                path: '/:gameId/:playerName',
                loader: lobbyLoader,
                element: <Lobby />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);