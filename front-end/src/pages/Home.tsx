import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth0 } from '@auth0/auth0-react';
import Skeleton from 'react-loading-skeleton';
import axios, { create } from 'axios';
import { div } from 'framer-motion/client';
import CreateProject from '../components/CreateProject';
import toast from 'react-hot-toast';
import { getAllProjects } from '../api/user';

const Home = () => {
	// const { isAuthenticated, user, isLoading } = useAuth0();
	// const projectId = 'msi365';
	// useEffect(() => {
	// 	const socket = io(`http://localhost:5000?projectId=${projectId}`);
	// 	socket.on('connect', () => {
	// 		console.log('Connected to the server');
	// 	});
	// 	socket.on('folder-structure', (data) => {
	// 		console.log('Str ', data);
	// 	});
	// 	return () => {
	// 		socket.disconnect();
	// 		console.log('Disconnected from the server');
	// 	};
	// }, []);

	const techStack: {
		[key in 'React' | 'Node' | 'Express' | 'MERN' | 'NextJS']: string;
	} = {
		React:
			'https://media2.dev.to/dynamic/image/width=1080,height=1080,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F096baapsqqt9fks0us99.png',
		Node: 'https://images.seeklogo.com/logo-png/27/1/node-js-logo-png_seeklogo-273749.png?v=1957362420476283968',
		Express:
			'https://w7.pngwing.com/pngs/925/447/png-transparent-express-js-node-js-javascript-mongodb-node-js-text-trademark-logo.png',
		MERN: 'https://miro.medium.com/v2/resize:fit:678/0*kxPYwfJmkXZ3iCWy.png',
		NextJS: 'https://cdn.worldvectorlogo.com/logos/next-js.svg',
	};

	const [showCreateProject, setShowCreateProject] = useState(false);

	const [projects, setProjects] = useState([]);

	const fetchProjects = async () => {
		try {
			const res = await getAllProjects();
			console.log(res);
			setProjects((res as { success: boolean; result: [] }).result);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, []);

	return (
		<main className='mt-24 px-10'>
			<section>
				<h2 className='text-3xl mb-7'>Your Projects</h2>
				<div className='flex flex-wrap gap-10 items-center justify-start'>
					<div
						className='flex flex-col items-center justify-start cursor-pointer bg-gray-100 hover:gradient p-2 rounded-xl text-black w-[170px] h-[190px]'
						onClick={() => setShowCreateProject(true)}
					>
						<img
							src={'/folder.png'}
							className='bg-white rounded-lg p-1 h-32 w-full object-cover'
							alt='project logo'
						/>
						<h3 className='font-medium'>Create New Project</h3>
					</div>
					{projects.map((project) => {
						return (
							<div
								key={project.name}
								className='flex flex-col items-center justify-start gradient bg-gray-200 hover:scale-110 duration-300 cursor-pointer p-2 rounded-xl w-[170px] h-[190px]'
							>
								<img
									src={techStack[project.techStack as keyof typeof techStack]}
									className='bg-white rounded-lg h-32 w-32 object-cover'
									alt='project logo'
								/>
								<h3 className='font-medium'>{project.name.slice(0, 21)}</h3>
								<p>{project.createAt}</p>
							</div>
						);
					})}
				</div>
			</section>
			{showCreateProject && (
				<CreateProject
					showCreateProject={showCreateProject}
					setShowCreateProject={setShowCreateProject}
				/>
			)}
		</main>
	);
};

export default Home;
