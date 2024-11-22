import { useEffect } from 'react';
import { io } from 'socket.io-client';

const Home = () => {
	const projectId = 'msi365';
	useEffect(() => {
		const socket = io(`http://localhost:5000?projectId=${projectId}`);
		socket.on('connect', () => {
			console.log('Connected to the server');
		});
		socket.on('folder-structure', (data) => {
			console.log("Str ", data);
		});
		return () => {
			socket.disconnect();
		};
	}, []);
	return <div className='text-xl'>HomePage</div>;
};

export default Home;
