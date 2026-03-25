import { Request } from 'express';
import { z } from 'zod';

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
  z.object({ answerKey: PollKeySchema, type: z.literal('basic-poll') }),
  z.object({ answerKey: MultipleKeySchema, type: z.literal('multiple-choice') }),
  z.object({ answerKey: MultipleKeySchema, type: z.literal('code-analysis') }),
  z.object({ answerKey: DragDropKeySchema, type: z.literal('drag-n-drop') }),
]);

export type ValidatedQuestion = z.infer<typeof QuestionSchema>;

export const FinishQuizSchema = z.object({
  answers: z.array(
    z.object({
      category: z.string(),
      id: z.number(),
      score: z.number(),
      time: z.number(),
    }),
  ),
  complexity: z.string(),
  totalDuration: z.number(),
  totalScore: z.number(),
});

export interface AuthRequest extends Request {
  user?: // eslint-disable-next-line @typescript-eslint/no-explicit-any -- temporary until auth payload/db types are aligned
    | any
    | {
        userId: number;
        username: string;
      };
}
