import { desc, eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../db/index.js';
import { quizResults, users } from '../db/schema.js';
import { AuthRequest, QuizDetail } from '../types/schemas.js';

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
  const overallAvgScore = totalQuizzes > 0 ? history.reduce((acc, curr) => acc + curr.totalScore, 0) / totalQuizzes : 0;

  const dailyStats: Record<string, { count: number; total: number }> = {};
  history.forEach((res) => {
    if (!res.createdAt) return;
    const date = res.createdAt.split('T')[0];
    if (!dailyStats[date]) dailyStats[date] = { count: 0, total: 0 };
    dailyStats[date].total += res.totalScore;
    dailyStats[date].count += 1;
  });

  const recentHistory = Object.entries(dailyStats)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 30)
    .map(([date, data]) => ({
      avgScore: Math.round(data.total / data.count),
      date,
    }))
    .reverse();

  const categoryStatsMap: Record<string, { count: number; total: number }> = {};
  history.forEach((res) => {
    const details = (res.details as QuizDetail[]) || [];
    details.forEach((answer) => {
      const cat = answer.category;
      if (!categoryStatsMap[cat]) categoryStatsMap[cat] = { count: 0, total: 0 };
      categoryStatsMap[cat].total += answer.score;
      categoryStatsMap[cat].count += 1;
    });
  });

  const categories = Object.entries(categoryStatsMap).map(([cat, data]) => ({
    avgScore: Math.round((data.total / data.count) * 10) / 10,
    category: cat,
  }));

  res.json({
    stats: {
      avgScore: Math.round(overallAvgScore),
      categories,
      recentHistory,

      totalQuizzes,
    },
    user: {
      id: user.id,
      username: user.username,
    },
  });
}
