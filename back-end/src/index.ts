import express, { Request, Response } from 'express';
import cors from 'cors';
import { initializeProject, testFunc } from './controller/project';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to the CodeLabs 🚀');
});

app.post('/api/create-project', initializeProject);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
