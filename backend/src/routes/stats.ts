import { desc, eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../db/index.js';
import { quizResults } from '../db/schema.js';
import { AuthRequest } from '../types/schemas.js';

export async function getUserStats(req: AuthRequest, res: Response) {
  const userId = req.user.id;

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
    user: req.user,
  });
}
