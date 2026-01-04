import { useEffect, useState } from 'react';
import CreateProject from '../components/CreateProject';
import { deleteProject, getAllProjects, ProjectType } from '../api/user';
import { Link } from 'react-router-dom';
import { sleep } from '../utils/helper';
import { MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const Home = () => {
	const techStack: {
		[key in 'react' | 'node' | 'express' | 'mern' | 'nextjs' | 'blank']: string;
	} = {
		react:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1150px-React-icon.svg.png',
		node: 'https://images.seeklogo.com/logo-png/27/1/node-js-logo-png_seeklogo-273749.png?v=1957362420476283968',
		express: 'https://www.manektech.com/storage/developer/1646733543.webp',
		mern: 'https://miro.medium.com/v2/resize:fit:678/0*kxPYwfJmkXZ3iCWy.png',
		nextjs: 'https://cdn.worldvectorlogo.com/logos/next-js.svg',
		blank: 'https://cdn-icons-png.freepik.com/512/318/318966.png',
	};

	const [showCreateProject, setShowCreateProject] = useState(false);
	const [loading, setLoading] = useState(false);
	const [projects, setProjects] = useState([]);
	const [projectToDelete, setProjectToDelete] = useState<string>('');
	const [modalIsOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

	function openModal() {
		setIsOpen(true);
	}

	function closeModal() {
		setIsOpen(false);
	}

	const handleDeleteProject = async (projectName: string) => {
    try {
      setIsDeleting(true);
			await deleteProject(projectName);
			setProjects((prevProjects) =>
				prevProjects.filter(
					(project: ProjectType) => project.name !== projectName
				)
			);
			toast.success('Project deleted');
		} catch (error) {
			toast.error('Unable to delete project');
			console.log('Unable to delete project:', error);
		} finally {
      setIsDeleting(false);
      closeModal();
    }
	};

	const fetchProjects = async () => {
		try {
			setLoading(true);
			await sleep(1000);
			const res = await getAllProjects();
			setProjects((res as { success: boolean; result: [] }).result);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, [showCreateProject]);

	return (
		<main className='mt-24 px-10'>
			<section>
				<h2 className='text-3xl mb-7'>Your Projects</h2>
				<div className='flex flex-wrap gap-10 items-center justify-start max-md:justify-start'>
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
					{loading && (
						<div className='fixed inset-0 h-screen w-screen flex items-center justify-center backdrop-blur-xl'>
							<img
								src='/loader.png'
								alt='Loading'
								width={100}
								className='mx-auto invert animate-spin'
							/>
						</div>
					)}
					<Modal
						isOpen={modalIsOpen}
						onRequestClose={closeModal}
						contentLabel='Delete Project Modal'
						className='w-[30%] bg-gray-900 p-6 rounded-lg mx-auto mt-40 flex flex-col'
            overlayClassName="fixed inset-0 backdrop-blur-xl flex items-center justify-center"
					>
						<h2 className='text-left text-xl font-semibold mb-2'>
							Delete Project
						</h2>
						<p>Are you sure you want to delete this project?</p>
						<p className='font-semibold'>"{projectToDelete}"</p>
						<div className='flex items-center gap-6 my-3'>
							<button
								className='bg-red-600 hover:bg-red-700'
								onClick={() => handleDeleteProject(projectToDelete)}
                disabled={isDeleting}
							>
								{isDeleting ? 'Deleting...' : 'Delete'}
							</button>
							<button className='bg-purple-600 hover:bg-purple-700' disabled={isDeleting} onClick={closeModal}>
								Cancel
							</button>
						</div>
					</Modal>
					{projects.map((project: ProjectType) => {
						return (
							<div
								className='no-underline text-white hover:text-white'
								key={project.name}
								// to={`/project/${project.name}`}
							>
								<div
									key={project.name}
									className='gradient bg-gray-200 cursor-pointer overflow-hidden p-2 rounded-xl w-[170px] h-[208px] max-md:w-[130px]'
								>
									<Link to={`/project/${project.name}`}>
										<img
											src={
												techStack[project.techStack as keyof typeof techStack]
											}
											className='bg-white rounded-lg h-32 object-cover w-full hover:scale-110 duration-300'
											alt='project logo'
										/>
									</Link>
									<div className='flex flex-row items-end justify-between w-full'>
										<div className=''>
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
										<MdDelete
											size={24}
											onClick={() => {
												setProjectToDelete(project.name);
												openModal();
											}}
											className='hover:text-red-500 cursor-pointer'
										/>
									</div>
								</div>
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
