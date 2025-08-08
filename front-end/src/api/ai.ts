import axiosInstance from './axios-config';

export const askAI = async (question: string) => {
	const res = await axiosInstance.post('/api/ai/ask', { question });
	return res.data;
};
