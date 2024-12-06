import { useEffect } from 'react';
import { io } from 'socket.io-client';
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';
import Skeleton from 'react-loading-skeleton';

const Home = () => {
	const { isAuthenticated, user, isLoading } = useAuth0();
	const projectId = 'msi365';
	useEffect(() => {
		const socket = io(`http://localhost:5000?projectId=${projectId}`);
		socket.on('connect', () => {
			console.log('Connected to the server');
		});
		socket.on('folder-structure', (data) => {
			console.log('Str ', data);
		});
		return () => {
			socket.disconnect();
			console.log('Disconnected from the server');
		};
	}, []);
	return (
		<div className='text-xl'>
			HomePage
			<LoginButton />
			<LogoutButton />
			{isLoading ? (
				<Skeleton count={3} baseColor='black' />
			) : (
				isAuthenticated && (
					<div className='flex items-center gap-3'>
						<img
							className='rounded-full'
							width={70}
							src={user?.picture}
							alt={user?.name}
						/>
						<div className='text-lg text-left'>
							<h2>{user?.name}</h2>
							<p className='text-md text-base text-gray-400'>{user?.email}</p>
						</div>
					</div>
				)
			)}
		</div>
	);
};

export default Home;
