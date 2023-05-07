import { Outlet, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Layout() {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="text-3xl bg-gradient-to-r from-orange-400 to-orange-500 max-w-6xl w-full text-center font-staatliches tracking-[10px] mx-auto my-6 py-3 hover:tracking-[11px] duration-1000 hover:duration-1000">
				<Link to={''}>Battleship</Link>
			</header>
			<div id="detail" className="flex-1">
				<Outlet />
			</div>
			<footer className="py-3 font-roboto w-full text-center my-0 mx-auto">Nicholas Anttila 2023</footer>
			<ToastContainer
				position="bottom-center"
				autoClose={1500}
				hideProgressBar={true}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				draggable
				pauseOnHover={false}
				theme="light"
				progressClassName="bg-gradient-to-r from-orange-400 to-orange-500"
				toastClassName={'bg-black'}
				bodyClassName={'text-xl tracking-wider font-staatliches text-white text-center'}
			/>
		</div>
	);
}
