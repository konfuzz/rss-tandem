import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../db/index.js';
import { questions as questionsTable, quizResults } from '../db/schema.js';
import { AuthRequest, QuizDetail } from '../types/schemas.js';

interface Question {
  category: string;
  content: QuestionContent;
  id: number;
  time: number;
  type: string;
}

interface QuestionContent {
  answers?: string[];
  question: string;
}

export async function quizStart(req: AuthRequest, res: Response) {
  try {
    const userId = Number(req.userId);
    if (!userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const complexity = typeof req.query.complexity === 'string' ? req.query.complexity : 'junior';

    const allQuestions = (await db
      .select({
        category: questionsTable.category,
        content: questionsTable.content,
        id: questionsTable.id,
        time: questionsTable.time,
        type: questionsTable.type,
      })
      .from(questionsTable)
      .where(eq(questionsTable.complexity, complexity))) as Question[];

    if (allQuestions.length === 0) {
      return res.status(404).json({ error: 'Вопросы не найдены' });
    }

    const userHistory = await db
      .select({ details: quizResults.details })
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    const statsMap: Record<number, { attempts: number; maxScore: number }> = {};
    for (const result of userHistory) {
      const details = result.details as QuizDetail[];
      if (!Array.isArray(details)) continue;
      for (const d of details) {
        const stats = statsMap[d.id] || { attempts: 0, maxScore: 0 };
        stats.maxScore = Math.max(stats.maxScore, d.score);
        stats.attempts += 1;
        statsMap[d.id] = stats;
      }
    }

    const selected = calculateQuizQuestions(allQuestions, statsMap, 10);

    res.json(selected);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

function calculateQuizQuestions(
  allQuestions: Question[],
  statsMap: Record<number, { attempts: number; maxScore: number }>,
  LIMIT = 10,
): Question[] {
  const allTypes = Array.from(new Set(allQuestions.map((q) => q.type)));
  const TOTAL_TYPES = allTypes.length;
  const MIN_PER_TYPE = TOTAL_TYPES > 0 ? Math.floor(LIMIT / TOTAL_TYPES) : 0;

  const selected: Question[] = [];
  const typeCount: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};
  let available = [...allQuestions];

  while (selected.length < LIMIT && available.length > 0) {
    const weightedPool = available.map((q) => {
      const stats = statsMap[q.id] || { attempts: 0, maxScore: 0 };
      const tw = 1 / (1 + (typeCount[q.type] || 0));
      const cw = 1 / (1 + (categoryCount[q.category] || 0));
      let hw = 1;
      if (stats.maxScore >= 10) hw = 0.2;
      else if (stats.maxScore >= 5) hw = 0.5;
      const aw = 1 / (1 + stats.attempts * 0.5);

      return {
        item: q,
        weight: tw * cw * hw * aw,
      };
    });

    const slotsLeft = LIMIT - selected.length;
    let totalNeededForMin = 0;
    const typesStillNeedingMin: string[] = [];

    for (const t of allTypes) {
      const count = typeCount[t] || 0;
      if (count < MIN_PER_TYPE) {
        const availableOfType = available.filter((aq) => aq.type === t).length;
        const needed = Math.min(MIN_PER_TYPE - count, availableOfType);
        if (needed > 0) {
          totalNeededForMin += needed;
          typesStillNeedingMin.push(t);
        }
      }
    }

    let candidates = weightedPool;
    if (slotsLeft <= totalNeededForMin && typesStillNeedingMin.length > 0) {
      candidates = weightedPool.filter((wp) => typesStillNeedingMin.includes(wp.item.type));
    }

    if (candidates.length === 0) break;

    const picked = weightedRandomPick(candidates);
    selected.push(picked);

    typeCount[picked.type] = (typeCount[picked.type] || 0) + 1;
    categoryCount[picked.category] = (categoryCount[picked.category] || 0) + 1;
    available = available.filter((q) => q.id !== picked.id);
  }

  return selected.sort(() => Math.random() - 0.5);
}

function weightedRandomPick<T>(candidates: { item: T; weight: number }[]): T {
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight <= 0) {
    return candidates[Math.floor(Math.random() * candidates.length)].item;
  }
  let r = Math.random() * totalWeight;
  for (const c of candidates) {
    r -= c.weight;
    if (r <= 0) return c.item;
  }
  return candidates[candidates.length - 1].item;
}
