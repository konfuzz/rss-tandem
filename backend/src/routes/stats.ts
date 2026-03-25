import { desc, eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../db/index.js';
import { quizResults, users } from '../db/schema.js';
import { AuthRequest } from '../types/schemas.js';

export async function getUserStats(req: AuthRequest, res: Response) {
  const userId = Number(req.userId);

  const user = await db.select().from(users).where(eq(users.id, userId)).get();

  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  const history = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, userId))
    .orderBy(desc(quizResults.createdAt));

  const totalQuizzes = history.length;
  const avgScore = history.reduce((acc, curr) => acc + curr.totalScore, 0) / totalQuizzes;

  res.json({
    stats: {
      avgScore: Math.round(avgScore),
      recentHistory: history,
      totalQuizzes,
    },
    user: {
      id: user.id,
      username: user.username,
    },
  });
}
