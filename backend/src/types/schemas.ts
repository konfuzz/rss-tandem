import { Request } from 'express';
import { z } from 'zod';

const PollKeySchema = z.object({
  correctAnswer: z.number(),
});

const MultipleKeySchema = z.object({
  correctAnswers: z.array(z.number()),
});

interface DragDropNode {
  children?: DragDropNode[];
  label: string;
}

const DragDropNodeSchema: z.ZodType<DragDropNode> = z.lazy(() =>
  z.object({
    children: z.array(DragDropNodeSchema).optional(),
    label: z.string(),
  }),
);

const DragDropKeySchema = z.object({
  correctStructure: DragDropNodeSchema,
});

export const QuestionSchema = z.discriminatedUnion('type', [
  z.object({ answerKey: PollKeySchema, type: z.literal('basic-poll') }),
  z.object({ answerKey: MultipleKeySchema, type: z.literal('multiple-choice') }),
  z.object({ answerKey: MultipleKeySchema, type: z.literal('code-analysis') }),
  z.object({ answerKey: DragDropKeySchema, type: z.literal('drag-n-drop') }),
]);

export type ValidatedQuestion = z.infer<typeof QuestionSchema>;

export const QuizDetailSchema = z.object({
  category: z.string(),
  id: z.number(),
  score: z.number(),
  time: z.number(),
});

export type QuizDetail = z.infer<typeof QuizDetailSchema>;

export const FinishQuizSchema = z.object({
  answers: z.array(QuizDetailSchema),
  complexity: z.string(),
  totalDuration: z.number(),
  totalScore: z.number(),
});

export interface AuthRequest extends Request {
  userId?: string;
}

export const RegisterSchema = z.object({
  password: z.string().min(6, 'Пароль должен быть не короче 6 символов').max(20, 'Слишком длинный пароль'),
  username: z
    .string()
    .min(3, 'Юзернейм должен быть не короче 3 символов')
    .max(20, 'Слишком длинный юзернейм (максимум 20 символов)')
    .trim()
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Юзернейм должен содержать только буквы английского алфавита, цифры и нижнее подчеркивание',
    ),
});
export const LoginSchema = z.object({
  password: z.string().min(1, 'Пароль обязателен'),
  username: z.string().min(1, 'Юзернейм обязателен'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const SubmitAnswerSchema = z.object({
  answer: z.unknown(),
  questionId: z.number(),
});

export const QuizStartSchema = z.object({
  complexity: z.enum(['junior', 'middle', 'senior']).default('junior'),
});

export const AIReviewSchema = z.object({
  question: z.string(),
  studentAnswer: z.string(),
});
