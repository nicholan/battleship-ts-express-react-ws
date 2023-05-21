import { Outlet, Link, useLoaderData } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';
import classNames from 'classnames';
import 'react-toastify/dist/ReactToastify.css';
import { IconMoonFilled, IconSunFilled, IconBrandGithubFilled, IconBrandLinkedin } from '@tabler/icons-react';

export function loader() {
	let theme;
	if (
		localStorage.theme === 'dark' ||
		(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
	) {
		document.documentElement.classList.add('dark');
		theme = 'dark';
	} else {
		document.documentElement.classList.remove('dark');
		theme = 'light';
	}
	return { theme };
}

export function Layout() {
	const { theme } = useLoaderData() as { theme: 'light' | 'dark' };
	const [colorScheme, setColorScheme] = useState(theme);

	const handleThemeChange = () => {
		const color = colorScheme === 'dark' ? 'light' : 'dark';
		if (color === 'dark') {
			document.documentElement.classList.add('dark');
		}
		if (color === 'light') {
			document.documentElement.classList.remove('dark');
		}
		localStorage.theme = color;
		setColorScheme(color);
	};

	const icon = colorScheme === 'dark' ? <IconSunFilled size={24} /> : <IconMoonFilled size={24} />;

	return (
		<div
			className={classNames(
				['flex flex-col min-h-screen'],
				['bg-gradient-to-b'],
				['from-white to-neutral-100'],
				['dark:from-neutral-800 dark:to-neutral-900']
			)}
		>
			{/* -----------HEADER----------- */}
			<header
				className={classNames(
					['relative'],
					['max-w-6xl w-full mx-auto text-center'],
					['py-2 lg:py-3'],
					['my-3 lg:my-6'],
					['text-neutral-900'],
					['dark:bg-none bg-gradient-to-r from-orange-400 to-orange-500']
				)}
			>
				<Link
					className={classNames(
						['text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-staatliches'],
						['tracking-[10px] hover:tracking-[11px] duration-1000 hover:duration-1000'],
						['dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r'],
						['dark:from-orange-400 dark:to-orange-500']
					)}
					to={''}
				>
					Battleship
				</Link>
				<button
					className="absolute right-5 md:right-10 lg:right-20 top-0 h-full dark:text-white select-none cursor-pointer"
					onClick={handleThemeChange}
				>
					{icon}
				</button>
			</header>

			{/* -----------CONTENT OUTLET----------- */}
			<div
				id="detail"
				className={classNames(
					['flex-1 mx-auto max-w-6xl w-full'],
					['border-b dark:border-t dark:border-neutral-300/10']
				)}
			>
				<Outlet />
			</div>

			{/* -----------FOOTER----------- */}
			<footer
				className={classNames(
					['relative max-w-6xl w-full'],
					['text-neutral-700 dark:text-neutral-200'],
					['py-3 lg:py-4 w-full text-center my-0 mx-auto']
				)}
			>
				<p className={classNames(['font-roboto text-sm md:text-base lg:text-lg'])}>Nicholas Anttila 2023</p>
				<div className="absolute flex flex-row gap-2 items-center right-5 md:right-10 lg:right-20 top-0 h-full">
					<Link to={'https://github.com/nicholan/battleship-ts-express-react-ws'}>
						<IconBrandGithubFilled size={21} />
					</Link>
					<IconBrandLinkedin size={21} />
				</div>
			</footer>

			{/* -----------TOAST CONTAINER----------- */}
			<ToastContainer
				position="bottom-center"
				autoClose={1500}
				hideProgressBar={true}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				draggable
				pauseOnHover={false}
				pauseOnFocusLoss={false}
				theme="dark"
				progressClassName="bg-gradient-to-r from-orange-400 to-orange-500"
				toastClassName={'bg-gradient-to-b from-neutral-800 to-neutral-900 border dark:border-neutral-300/10'}
				bodyClassName={'text-lg lg:text-xl tracking-wider font-staatliches text-white text-center'}
			/>
		</div>
	);
}
