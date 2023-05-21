import React from 'react';
import ReactDOM from 'react-dom/client';
import { Layout } from './components/Layout/Layout.js';
import { ErrorPage } from './components/Error/Error.js';
import { Index } from './routes/Index.js';
import { Lobby } from './routes/Lobby.js';
import { loader as lobbyLoader } from './routes/Lobby.js';
import { loader as layoutLoader } from './components/Layout/Layout.js';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './global.css';

const router = createBrowserRouter([
	{
		path: '',
		element: <Layout />,
		loader: layoutLoader,
		errorElement: <ErrorPage />,
		children: [
			{
				errorElement: <ErrorPage />,
				children: [
					{
						path: '/',
						element: <Index />,
					},
					{
						path: '/:gameId/:name',
						loader: lobbyLoader,
						element: <Lobby />,
					},
					{
						// All other paths; 404 to <Outlet />
						path: '*',
						loader: () => {
							throw new Response('Page not found.', {
								status: 404,
								statusText: 'Page not found',
							});
						},
					},
				],
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
