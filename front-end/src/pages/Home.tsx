import { useEffect, useState } from 'react';
import CreateProject from '../components/CreateProject';
import { getAllProjects, ProjectType } from '../api/user';
import { Link } from 'react-router-dom';

const Home = () => {
	const techStack: {
		[key in 'react' | 'node' | 'express' | 'mern' | 'nextjs']: string;
	} = {
		react:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1150px-React-icon.svg.png',
		node: 'https://images.seeklogo.com/logo-png/27/1/node-js-logo-png_seeklogo-273749.png?v=1957362420476283968',
		express:
			'https://www.manektech.com/storage/developer/1646733543.webp',
		mern: 'https://miro.medium.com/v2/resize:fit:678/0*kxPYwfJmkXZ3iCWy.png',
		nextjs: 'https://cdn.worldvectorlogo.com/logos/next-js.svg',
	};

	const [showCreateProject, setShowCreateProject] = useState(false);

	const [projects, setProjects] = useState([]);

	const fetchProjects = async () => {
		try {
			const res = await getAllProjects();
			setProjects((res as { success: boolean; result: [] }).result);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, [showCreateProject]);

	return (
		<main className='mt-24 px-10'>
			<section>
				<h2 className='text-3xl mb-7'>Your Projects</h2>
				<div className='flex flex-wrap gap-10 items-center justify-start max-md:justify-center'>
					<div
						className='flex flex-col items-center hover:scale-110 duration-300 justify-center cursor-pointer bg-white hover:gradient p-2 rounded-xl text-black w-[170px] h-[208px] max-md:w-[130px]'
						onClick={() => {
							document.body.style.overflow = 'hidden';
							setShowCreateProject(true);
						}}
					>
						<img
							src={'/folder.png'}
							className='rounded-lg p-1 h-32 w-full object-cover'
							alt='project logo'
						/>
						<h3 className='font-medium'>Create New Project</h3>
					</div>
					{projects.map((project: ProjectType) => {
						return (
							<Link
								className='no-underline text-white hover:text-white'
								key={project.name}
								to={`/project/${project.name}`}
							>
								<div
									key={project.name}
									className='gradient bg-gray-200 hover:scale-110 duration-300 cursor-pointer p-2 rounded-xl w-[170px] h-[208px] max-md:w-[130px]'
								>
									<img
										src={techStack[project.techStack as keyof typeof techStack]}
										className='bg-white rounded-lg h-32 object-cover w-full'
										alt='project logo'
									/>
									<div className='mx-auto'>
										<h3 className='font-medium'>
											{project.name.slice(0, 21)}
											<br />
										</h3>
										<span className='bg-black rounded-md px-1 text-sm'>
											# {project.techStack}
										</span>
										<p className='text-sm text-gray-200'>
											{new Date(project.createdAt).toDateString().slice(3)}
										</p>
									</div>
								</div>
							</Link>
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
