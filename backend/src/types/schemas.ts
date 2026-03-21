import { z } from 'zod';
import { Request } from 'express';

const PollKeySchema = z.object({
  correctAnswer: z.number(),
});

const MultipleKeySchema = z.object({
  correctAnswers: z.array(z.number()),
});

const DragDropKeySchema = z.object({
  correctStructure: z.record(z.string(), z.any()),
});

export const QuestionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('basic-poll'), answerKey: PollKeySchema }),
  z.object({ type: z.literal('multiple-choice'), answerKey: MultipleKeySchema }),
  z.object({ type: z.literal('code-analysis'), answerKey: MultipleKeySchema }),
  z.object({ type: z.literal('drag-n-drop'), answerKey: DragDropKeySchema }),
]);

export type ValidatedQuestion = z.infer<typeof QuestionSchema>;

export const FinishQuizSchema = z.object({
  complexity: z.string(),
  totalScore: z.number(),
  totalDuration: z.number(),
  answers: z.array(z.object({
    id: z.number(),
    category: z.string(),
    score: z.number(),
    time: z.number()
  }))
});

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
  } | any;
}