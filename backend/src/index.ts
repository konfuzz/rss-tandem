import cors from 'cors';
import 'dotenv/config';
import express, { json, NextFunction, Response } from 'express';
import { jwtVerify } from 'jose';

import { aiReview } from './routes/ai.js';
import { login } from './routes/auth/login.js';
import { register } from './routes/auth/register.js';
import { finishQuiz } from './routes/finish.js';
import { getLeaders } from './routes/leaders.js';
import { quizStart } from './routes/start.js';
import { getUserStats } from './routes/stats.js';
import { submitAnswer } from './routes/submit.js';
import { AuthRequest } from './types/schemas.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const secret = new TextEncoder().encode(JWT_SECRET);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(json());

app.get('/', (_req, res) => {
  res.json({ message: 'Backend is running' });
});

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Unauthorized');

  const token = authHeader.split(' ')[1];
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    if (!payload.userId) return res.status(401).send('Invalid token');
    req.userId = payload.userId as string;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
};

app.post('/auth/register', register);
app.post('/auth/login', login);
app.post('/quiz/review', authMiddleware, aiReview);
app.get('/quiz/start', authMiddleware, quizStart);
app.post('/quiz/submit', authMiddleware, submitAnswer);
app.post('/quiz/finish', authMiddleware, finishQuiz);
app.get('/user/stats', authMiddleware, getUserStats);
app.get('/leaders', authMiddleware, getLeaders);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
