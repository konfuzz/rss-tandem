import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { WidgetConfig } from '../types/widget';

export interface QuizRound {
  category: string;
  id: number;
  score: number;
  time: number;
}

export const useQuizStore = defineStore(
  'quiz',
  () => {
    const questions = ref<WidgetConfig[]>([]);
    const currentQuizId = ref<null | string>(null);
    const answers = ref<QuizRound[]>([]);
    const currentStep = ref(0);
    const isFinished = ref(false);

    function recordAnswer(id: number, category: string, score: number, time: number = 0) {
      answers.value.push({ category, id, score, time });
    }

    function resetQuiz() {
      currentQuizId.value = null;
      answers.value = [];
      currentStep.value = 0;
      isFinished.value = false;
    }

    return {
      answers,
      currentQuizId,
      currentStep,
      isFinished,
      questions,
      recordAnswer,
      resetQuiz,
    };
  },
  {
    persist: {
      key: 'quiz-progress',
      storage: localStorage,
    },
  },
);
