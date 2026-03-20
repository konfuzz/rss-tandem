import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { aiReview } from './routes/ai.js';
import { quizStart } from './routes/start.js';
import { submitAnswer } from './routes/submit.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Backend is running' });
});

app.post('/review', aiReview);
app.get('/quiz/start', quizStart);
app.post('/quiz/submit', submitAnswer);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
