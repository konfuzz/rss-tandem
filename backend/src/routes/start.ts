import { db } from '../db/index.js';
import { questions as questionsTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';

export async function quizStart(req: Request, res: Response) {
  try {
    const { complexity = 'junior' } = req.query;
    const LIMIT = 10;
    const MAX_PER_CATEGORY = 2;

    const allQuestions = await db
      .select({
        id: questionsTable.id,
        type: questionsTable.type,
        category: questionsTable.category,
        content: questionsTable.content,
        time: questionsTable.time
      })
      .from(questionsTable)
      .where(eq(questionsTable.complexity, complexity as string));

    if (allQuestions.length === 0) {
      return res.status(404).json({ error: 'Вопросы не найдены' });
    }

    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

    const selected: typeof allQuestions = [];
    const categoryCount: Record<string, number> = {};

    for (const q of shuffled) {
      if (selected.length >= LIMIT) break;

      const currentCount = categoryCount[q.category] || 0;

      if (currentCount < MAX_PER_CATEGORY) {
        selected.push(q);
        categoryCount[q.category] = currentCount + 1;
      }
    }

    if (selected.length < LIMIT) {
      const selectedIds = new Set(selected.map(q => q.id));
      const remaining = shuffled.filter(q => !selectedIds.has(q.id));

      const extra = remaining.slice(0, LIMIT - selected.length);
      selected.push(...extra);
    }

    res.json(selected.sort(() => Math.random() - 0.5));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}