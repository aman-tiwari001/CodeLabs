import { motion } from 'framer-motion';
import { FaCode, FaLaptopCode } from 'react-icons/fa';
import { syncUserWithDB } from '../api/user';
import { useAuth0 } from '@auth0/auth0-react';
import { BiCloud, BiFolder, BiTerminal } from 'react-icons/bi';
import { GrTechnology } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
	const { loginWithPopup, getIdTokenClaims } = useAuth0();
	const navigate = useNavigate();
	
	const handleLogin = async () => {
		try {
			console.log('hey in side this func');
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

	return (
		<main className='w-full flex flex-col min-h-screen'>
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
							className='gradient px-8 py-3 rounded-full text-lg max-md:text-md font-semibold hover:bg-indigo-100 transition duration-300'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleLogin}
						>
							Get Started!
						</motion.button>
					</motion.div>
				</div>
			</section>
			<section className='p-10 gradient'>
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
		</main>
	);
};

export default LandingPage;
