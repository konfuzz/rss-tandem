import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { WidgetConfig } from '../types/widget';

export interface QuizResultSummary {
  answeredQuestions: number;
  averageScore: number;
  categories: QuizSummaryCategory[];
  completedAt: string;
  perfectAnswers: number;
  resultId: null | number;
  totalDuration: number;
  totalQuestions: number;
  totalScore: number;
}

export interface QuizRound {
  category: string;
  id: number;
  score: number;
  time: number;
}

export interface QuizSummaryCategory {
  averageScore: number;
  name: string;
}

export const useQuizStore = defineStore(
  'quiz',
  () => {
    const questions = ref<WidgetConfig[]>([]);
    const currentQuizId = ref<null | string>(null);
    const answers = ref<QuizRound[]>([]);
    const currentStep = ref(0);
    const isFinished = ref(false);
    const lastResult = ref<null | QuizResultSummary>(null);

    function recordAnswer(id: number, category: string, score: number, time: number = 0) {
      if (answers.value.some((answer) => answer.id === id)) {
        return;
      }

      answers.value.push({ category, id, score, time });
    }

    function clearActiveQuiz() {
      answers.value = [];
      currentStep.value = 0;
      currentQuizId.value = null;
      questions.value = [];
    }

    function clearLastResult() {
      lastResult.value = null;
      isFinished.value = false;
    }

    function completeQuiz(summary: QuizResultSummary) {
      lastResult.value = summary;
      clearActiveQuiz();
      isFinished.value = true;
    }

    function resetQuiz() {
      clearActiveQuiz();
      clearLastResult();
    }

    function startQuiz(nextQuizId: string, nextQuestions: WidgetConfig[]) {
      currentQuizId.value = nextQuizId;
      questions.value = nextQuestions;
      answers.value = [];
      currentStep.value = 0;
      isFinished.value = false;
      lastResult.value = null;
    }

    return {
      answers,
      clearLastResult,
      completeQuiz,
      currentQuizId,
      currentStep,
      isFinished,
      lastResult,
      questions,
      recordAnswer,
      resetQuiz,
      startQuiz,
    };
  },
  {
    persist: {
      key: 'quiz-progress',
      pick: ['answers', 'currentQuizId', 'currentStep', 'questions'],
      storage: localStorage,
    },
  },
);
