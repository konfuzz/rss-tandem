import { Response } from 'express';
import { AuthRequest } from '../types/schemas.js';
import { db } from '../db/index.js';
import { quizResults } from '../db/schema.js';
import { FinishQuizSchema } from '../types/schemas.js';

export async function finishQuiz(req: AuthRequest, res: Response) {
  const result = FinishQuizSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Неверный формат данных', details: result.error });
  }

  try {
    const [inserted] = await db.insert(quizResults).values({
      complexity: result.data.complexity,
      totalScore: Math.round(result.data.totalScore),
      totalDuration: result.data.totalDuration,
      details: result.data.answers,
      userId: req.user.userId
    }).returning();

    res.json({
      success: true,
      resultId: inserted.id,
      message: "Результат сохранен."
    });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при сохранении в базу' });
  }
}