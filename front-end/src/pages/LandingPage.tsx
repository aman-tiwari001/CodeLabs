import { motion } from 'framer-motion';
import { FaCode, FaLaptopCode, FaLinkedin } from 'react-icons/fa';
import { syncUserWithDB } from '../api/user';
import { useAuth0 } from '@auth0/auth0-react';
import { BiCloud, BiFolder, BiLogoGithub, BiTerminal } from 'react-icons/bi';
import { GrTechnology } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { BsTwitterX } from 'react-icons/bs';
import { useEffect } from 'react';

const LandingPage = () => {
	const { loginWithPopup, getIdTokenClaims, isAuthenticated } = useAuth0();
	const navigate = useNavigate();

	const handleLogin = async () => {
		try {
			await loginWithPopup();
			const loginData = await getIdTokenClaims();
			console.log(loginData);
			const res = await syncUserWithDB({
				name: loginData?.name as string,
				email: loginData?.email as string,
				picture: loginData?.picture as string,
				sub: loginData?.sub as string,
				authToken: loginData?.__raw as string,
			});
			console.log(res);
			navigate('/home');
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/home');
		}
	}, [isAuthenticated, navigate]);

	return (
		<main className='w-full flex flex-col min-h-screen'>
			{/* Hero Section */}
			<section className='w-full py-20 md:py-32 text-white contrast-125 bg-cover bg-[url(https://miro.medium.com/v2/resize:fit:1400/0*7VyEZgzwUhQMeBqb)]'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8 '>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className='text-center'
					>
						<h1 className='text-4xl md:text-6xl flex items-center justify-center gap-4 font-bold mb-6 max-md:mt-6'>
							<FaLaptopCode className='max-sm:hidden' size={56} /> Code Anywhere
							& Anytime
						</h1>
						<p className='text-xl md:text-2xl mb-8'>
							Your powerful online IDE for all your development needs
						</p>
						<motion.button
							className='gradient	 px-8 py-3 rounded-full text-lg max-md:text-md font-semibold hover:bg-indigo-100 transition duration-300'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleLogin}
						>
							Get Started!
						</motion.button>
					</motion.div>
				</div>
			</section>

			{/* Features */}
			<section className='p-10 gradient rounded-t-[30px] flex flex-col items-center justify-center gap-5'>
				<h2 className='text-4xl max-md:text-3xl mb-7 text-center'>Features</h2>
				<div className='flex items-center justify-center flex-wrap gap-7'>
					<motion.div
						className='h-[150px] w-[260px] border-4 rounded-xl p-4 border-white'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h3 className='text-xl flex font-bold mb-2 items-center gap-2'>
							<FaCode size={32} /> Editor
						</h3>
						<p>
							Write and edit your code with ease using our powerful code editor.
						</p>
					</motion.div>
					<motion.div
						className='h-[150px] w-[260px] border-4 rounded-xl p-4 border-white'
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h3 className='text-xl flex font-bold mb-2 items-center gap-2'>
							<BiTerminal size={32} />
							Built in Terminal
						</h3>
						<p>
							Access a fully integrated terminal to run your commands and
							scripts.
						</p>
					</motion.div>
					<motion.div
						className='h-[150px] w-[260px] border-4 rounded-xl p-4 border-white'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h3 className='text-xl flex font-bold mb-2 items-center gap-2'>
							<BiFolder size={32} />
							Directory Explorer
						</h3>
						<p>
							An explorer for easily navigating across the project codebase.
						</p>
					</motion.div>
					<motion.div
						className='h-[150px] w-[260px] border-4 rounded-xl p-4 border-white'
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h3 className='text-xl flex font-bold mb-2 items-center gap-2'>
							<GrTechnology size={32} />
							Multiple Tech Stacks
						</h3>
						<p>We support multiple tech stacks and frameworks.</p>
					</motion.div>
					<motion.div
						className='h-[150px] w-[260px] border-4 rounded-xl p-4 border-white'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h3 className='text-xl flex font-bold mb-2 items-center gap-2'>
							<BiCloud size={32} /> Cloud Syncing
						</h3>
						<p>All your projects are automatically saved to cloud.</p>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<section>
				<div className='w-full py-12 bg-gray-950 text-white'>
					<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className='flex justify-between items-start mx-9'
						>
							<div className='w-[50%]'>
								<h3 className='text-2xl font-bold mb-4 flex items-center gap-2'>
									<FaLaptopCode size={24} /> CodeLabs
								</h3>
								<p className='text-gray-300 text-justify'>
									Your powerful online IDE for all your development needs. Code
									anywhere and anytime.
								</p>
							</div>

							<div>
								<h4 className='text-xl font-semibold mb-4'>Contact Us</h4>
								<div className='flex items-center space-x-4 text-2xl'>
									<motion.a
										href='https://www.linkedin.com/in/aman-tiwari001/'
										target='_blank'
										rel='noopener noreferrer'
										whileHover={{ y: -5 }}
										className='cursor-pointer'
									>
										<FaLinkedin size={27} className='gradient bg-clip-text' />
									</motion.a>
									<motion.a
										href='https://x.com/aman_tiwari100'
										target='_blank'
										rel='noopener noreferrer'
										whileHover={{ y: -5 }}
										className='cursor-pointer'
									>
										<BsTwitterX className='gradient bg-clip-text' />
									</motion.a>
									<motion.a
										href='https://github.com/aman-tiwari001/CodeLabs'
										target='_blank'
										rel='noopener noreferrer'
										whileHover={{ y: -5 }}
										className='cursor-pointer'
									>
										<BiLogoGithub size={30} className='gradient bg-clip-text' />
									</motion.a>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5, duration: 0.5 }}
							className='border-t border-gray-700 mt-8 pt-8 text-center'
						>
							<p className='mb-6 text-gray-300'>
								Designed by{' '}
								<a
									href='https://www.linkedin.com/in/aman-tiwari001/'
									target='_blank'
									rel='noopener noreferrer'
									className='underline text-white hover:gradient bg-clip-text transition-colors'
								>
									Aman Tiwari
								</a>{' '}
								with ❤️‍🔥
							</p>
							<p className='text-gray-400'>
								© {new Date().getFullYear()} CodeLabs. All rights reserved.
							</p>
						</motion.div>
					</div>
				</div>
			</section>
		</main>
	);
};

export default LandingPage;
