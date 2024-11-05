import { useEffect } from 'react';
import { io } from 'socket.io-client';

const Home = () => {
  const projectId = 'base';
	useEffect(() => {
    const socket = io(`http://localhost:5000?projectId=${projectId}`);
    socket.on('connect', () => {
      console.log('Connected to the server');
    });
    return () => {
      socket.disconnect();
    }
  }, []);
	return <div className='text-xl'>HomePage</div>;
};

export default Home;
