import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { isDeepStrictEqual } from 'node:util';

import { db } from '../db/index.js';
import { questions as questionsTable } from '../db/schema.js';
import { QuestionSchema } from '../types/schemas.js';

export async function submitAnswer(req: Request, res: Response) {
  const { answer, questionId }: { answer: unknown; questionId: number } = req.body;

  const [row] = await db.select().from(questionsTable).where(eq(questionsTable.id, questionId));

  if (!row) return res.status(404).json({ error: 'Вопрос не найден' });

  const parseResult = QuestionSchema.safeParse(row);

  if (!parseResult.success) {
    console.error('Ошибка данных в БД:', parseResult.error);
    return res.status(500).json({ error: 'Ошибка структуры данных вопроса' });
  }

  const q = parseResult.data;
  let score = 0;
  let correct;

  switch (q.type) {
    case 'basic-poll':
      if (answer === q.answerKey.correctAnswer) score = 10;
      correct = q.answerKey.correctAnswer;
      break;

    case 'code-analysis':
    case 'multiple-choice': {
      const correctIndices = q.answerKey.correctAnswers;
      correct = correctIndices;
      const userIndices = answer as number[];

      if (!Array.isArray(userIndices)) {
        score = 0;
        break;
      }

      const correctSelected = userIndices.filter((idx) => correctIndices.includes(idx)).length;
      const incorrectSelected = userIndices.filter((idx) => !correctIndices.includes(idx)).length;
      const totalCorrect = correctIndices.length;

      const rawScore = ((correctSelected - incorrectSelected * 0.5) / totalCorrect) * 10;

      score = Math.max(0, Math.round(rawScore * 10) / 10);

      break;
    }

    case 'drag-n-drop':
      if (isDeepStrictEqual(answer, q.answerKey.correctStructure)) {
        score = 10;
      }
      correct = q.answerKey.correctStructure;
      break;
  }

  res.json({ correctAnswer: correct, score });
}
