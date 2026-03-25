import { Response } from 'express';

import { db } from '../db/index.js';
import { quizResults } from '../db/schema.js';
import { AuthRequest, FinishQuizSchema } from '../types/schemas.js';

export async function finishQuiz(req: AuthRequest, res: Response) {
  const userId = Number(req.userId);

  const result = FinishQuizSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ details: result.error, error: 'Неверный формат данных' });
  }

  try {
    const [inserted] = await db
      .insert(quizResults)
      .values({
        complexity: result.data.complexity,
        details: result.data.answers,
        totalDuration: result.data.totalDuration,
        totalScore: Math.round(result.data.totalScore),
        userId: userId,
      })
      .returning();

    res.json({
      message: 'Результат сохранен.',
      resultId: inserted.id,
      success: true,
    });
  } catch {
    res.status(500).json({ error: 'Ошибка при сохранении в базу' });
  }
}
