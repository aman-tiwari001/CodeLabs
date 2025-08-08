import { GoogleGenAI } from '@google/genai';
import { Request, Response } from 'express';

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

export const askAI = async (req: Request, res: Response) => {
	try {
		const { question } = req.body;
		if (!question || typeof question !== 'string') {
			res.status(400).json({ success: false, message: 'Invalid question' });
			return;
		}

		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: question,
		});

		res.status(200).json({
			success: true,
			answer: response.text,
		});
		return;
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
		return;
	}
};
