import { SendHorizontalIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { IoCloseCircle } from 'react-icons/io5';
import { askAI } from '../api/ai';
import Markdown from 'react-markdown';
import { useAuth0 } from '@auth0/auth0-react';

interface IMessage {
	sender: string;
	message: string;
	timestamp: string;
}

const AskAI = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [question, setQuestion] = useState('');
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [loading, setLoading] = useState(false);
	const msgRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth0();

	const handleAskAI = async () => {
		try {
			setLoading(true);
			if (!question.trim()) return;

			const newMessage: IMessage = {
				sender: 'user',
				message: question,
				timestamp: new Date().toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				}),
			};

			setMessages([...messages, newMessage]);
			setQuestion('');

			const res = (await askAI(question)) as {
				answer: string;
				success: boolean;
			};
			setMessages((prevMessages) => [
				...prevMessages,
				{
					sender: 'ai',
					message: res.answer,
					timestamp: new Date().toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					}),
				},
			]);
		} catch (error) {
			console.error('Error asking AI:', error);
			setMessages((prevMessages) => [
				...prevMessages,
				{
					sender: 'ai',
					message: 'Sorry, I could not process your request at the moment.',
					timestamp: new Date().toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					}),
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		msgRef.current?.scrollTo({
			top: msgRef.current.scrollHeight + 100,
			behavior: 'smooth',
		});
	}, [messages, isOpen]);

	return (
		<div className='absolute bottom-8 right-8'>
			{isOpen && (
				<div className='bg-gradient-to-br border-gray-700 border-[0.1px] relative h-[80vh] from-violet-950 via-gray-950 to-black px-4 pb-4 pt-2 rounded-lg shadow-lg w-[450px]'>
					<IoCloseCircle
						size={28}
						className='absolute top-3 right-3 cursor-pointer'
						onClick={() => setIsOpen(false)}
					/>
					<div className='flex h-full flex-col justify-between'>
						<h2 className='text-lg font-bold border-gray-400 border-b pb-3 rounded-none'>
							Ask AI ✨
							<p className='font-extralight text-xs'>gemini-2.5-flash</p>
						</h2>
						<div>
							{messages.length > 0 ? (
								<div
									ref={msgRef}
									className='overflow-y-auto h-[350px] hide-scrollbar'
								>
									<div className='flex flex-col gap-3'>
										{messages.map((msg, index) => {
											const isUser = msg.sender === 'user';
											return (
												<div
													key={msg.timestamp + index}
													className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
												>
													{' '}
													<div>
														<div
															className={`font-semibold text-sm py-2 px-3 ${isUser ? 'text-right' : 'text-left'}`}
														>
															{isUser ? 'You' : 'AI ✨'}
														</div>
														<div
															className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-md hide-scrollbar overflow-x-scroll w-full
            									${isUser ? 'bg-violet-600/30 text-white rounded-br-none' : 'bg-gray-800/70 text-gray-100 rounded-bl-none'}
          									`}
														>
															<Markdown>{msg.message}</Markdown>
															<div
																className={`text-xs mt-1 ${
																	isUser
																		? 'text-violet-300 text-right'
																		: 'text-gray-400 text-left'
																}`}
															>
																{msg.timestamp}
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
									{loading && (
										<div className='text-left'>
											<p className='font-bold'>AI ✨</p>
											<img src='/Typing.gif' alt='Loading...' width={60} />
										</div>
									)}
								</div>
							) : (
								<div className='text-gray-200 text-center text-lg mt-4'>
									Hi, {user?.name?.split(' ')[0]}
									<p>How can I help you today?</p>
								</div>
							)}
						</div>
						<div className='flex items-center gap-2 bg-gray-800/80 p-2 rounded-lg'>
							<textarea
								value={question}
								readOnly={loading}
								disabled={loading}
								rows={3}
								onChange={(e) => setQuestion(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										handleAskAI();
									}
								}}
								placeholder='Ask me anything in tech'
								className='flex-1 bg-transparent text-white outline-none resize-none'
							/>
							<SendHorizontalIcon
								onClick={handleAskAI}
								className='cursor-pointer hover:text-gray-300'
							/>
						</div>
					</div>
				</div>
			)}
			{!isOpen && (
				<button
					onClick={() => setIsOpen(true)}
					className='bg-gradient-to-r hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] shadow-xl from-violet-900 via-violet-950 to-gray-950'
				>
					Ask AI ✨
				</button>
			)}
		</div>
	);
};

export default AskAI;
