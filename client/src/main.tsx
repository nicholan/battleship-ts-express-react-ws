import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./routes/Layout";
import { ErrorPage } from "./components/Error/Error";
import { Index } from "./routes/Index";
import { Lobby } from "./routes/Lobby";
import { loader as lobbyLoader } from "./routes/Lobby";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            path: "/",
            element: <Index />,
          },
          {
            path: "/:gameId/:name",
            loader: lobbyLoader,
            element: <Lobby />,
          },
          {
            // All other paths; 404 to <Outlet />
            path: "*",
            loader: () => {
              throw new Response("Page not found.", {
                status: 404,
                statusText: "Page not found",
              });
            },
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
