import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthRequest } from './types/schemas.js';
import { login } from './routes/auth/login.js';
import { register } from './routes/auth/register.js';
import { aiReview } from './routes/ai.js';
import { quizStart } from './routes/start.js';
import { submitAnswer } from './routes/submit.js';
import { finishQuiz } from './routes/finish.js';
import { getUserStats } from './routes/stats.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Backend is running' });
});

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Unauthorized');

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};

app.post('/auth/register', register);
app.post('/auth/login', login);
app.post('/quiz/review', aiReview);
app.get('/quiz/start', quizStart);
app.post('/quiz/submit', submitAnswer);
app.post('/quiz/finish', authMiddleware, finishQuiz);
app.get('/user/stats', authMiddleware, getUserStats);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
