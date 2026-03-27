import { Response } from 'express';

import { db } from '../db/index.js';
import { quizResults, users } from '../db/schema.js';
import { AuthRequest } from '../types/schemas.js';

export async function getLeaders(_req: AuthRequest, res: Response) {
  try {
    const allUsers = await db.select().from(users);
    const allResults = await db.select().from(quizResults);

    const leaders = allUsers.map((user) => {
      const userResults = allResults.filter((result) => result.userId === user.id);

      const finished = userResults.length;
      const totalScore = userResults.reduce((acc, curr) => acc + curr.totalScore, 0);
      const avgScore = finished > 0 ? Math.round(totalScore / finished) : 0;

      const resultDates = userResults.map((result) => {
        const date = new Date(result.createdAt!);
        return date.toISOString().split('T')[0];
      });

      const uniqueDates = Array.from(new Set(resultDates)).sort();

      let maxStreak = 0;
      let currentStreak = 0;
      let lastDate: Date | null = null;

      for (const dateStr of uniqueDates) {
        const currentDate = new Date(dateStr);
        if (lastDate) {
          const diffTime = currentDate.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        lastDate = currentDate;
      }
      maxStreak = Math.max(maxStreak, currentStreak);

      return {
        avgScore,
        finished,
        streak: finished > 0 ? maxStreak : 0,
        user: user.username,
      };
    });

    res.json(leaders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
