import { useAuth0 } from '@auth0/auth0-react';
import Skeleton from 'react-loading-skeleton';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
	const { isAuthenticated, user, isLoading } = useAuth0();
	const [userImg, setUserImg] = useState<string>(
		user?.picture || 'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.pn'
	);

	return (
		<nav className='flex justify-between items-center w-full px-10 max-sm:px-2 py-2 gradient shadow-xl fixed top-0 left-0 right-0 z-10'>
			<div>
				<Link to='/home' className='text-white hover:text-white'>
				<h2 className='font-bold max-md:text-lg rounded-full text-2xl p-2 bg-indigo-400'>
					&lt;code<span className='underline'>Labs</span>🚀&gt;
				</h2>
				</Link>
			</div>
			<div className='flex items-center gap-4'>
				<div>
					{isLoading ? (
						<Skeleton width={150} count={2} baseColor='indigo' />
					) : isAuthenticated ? (
						<div className='flex items-center gap-2 px-2 py-1 bg-purple-500 rounded-xl'>
							<img
								className='rounded-full'
								width={42}
								src={userImg}
								onError={() => {
									setUserImg(
										'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png'
									);
								}}
							/>
							<div className='max-md:text-sm text-md text-left max-[500px]:hidden'>
								<h2 className='font-medium'>{user?.name}</h2>
								<p className='text-gray-200 text-sm max-md:hidden'>{user?.email}</p>
							</div>
						</div>
					) : (
						<LoginButton />
					)}
				</div>
				{isAuthenticated && <LogoutButton />}
			</div>
		</nav>
	);
};

export default Navbar;
