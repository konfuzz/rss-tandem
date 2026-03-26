import { useQuizStore } from '../stores/quiz';
import { type QuizRound } from '../stores/quiz';

const quizState = useQuizStore();

export const saveQuizStep = (quiz: QuizRound) => {
  quizState.recordAnswer(quiz.questionId, quiz.userAnswer, quiz.score);
};
