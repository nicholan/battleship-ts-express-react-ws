import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Layout() {
    return (
        <>
            <header>
                <Link to={''}>Battleship</Link>
            </header>
            <div id="detail">
                <Outlet />
            </div>

            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light" />
            <footer>
                Nicholas Anttila 2023
            </footer>
        </>
    );
}