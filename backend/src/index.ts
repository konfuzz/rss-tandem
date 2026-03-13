import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { aiReview } from './routes/ai.js';

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Backend is running' });
});

app.post('/review', aiReview);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
