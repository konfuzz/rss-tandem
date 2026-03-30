<script setup lang="ts">
import { markRaw, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { WidgetConfig } from '../types/widget';

import QuizSummaryCard from '../components/QuizSummaryCard.vue';
import WidgetWrapper from '../components/WidgetWrapper.vue';
import { useQuizStore } from '../stores/quiz';
import { apiFetch } from '../utils/api';

interface BackendQuizQuestion {
  category: string;
  content: Record<string, unknown>;
  id: number;
  type: WidgetConfig['type'];
}

const error = ref<null | string>(null);
const isLoading = ref(true);
const quizState = useQuizStore();
const restartError = ref<null | string>(null);
const restartLoading = ref(false);
const router = useRouter();

function goToDashboard() {
  quizState.resetQuiz();
  router.push({ name: 'dashboard' });
}

async function initializeQuiz() {
  if (quizState.currentQuizId && quizState.questions.length > 0) {
    isLoading.value = false;
    return;
  }

  if (quizState.lastResult) {
    isLoading.value = false;
    return;
  }

  await loadQuiz();
}

async function loadQuiz(options?: { inline?: boolean }) {
  const inline = options?.inline ?? false;

  if (inline) {
    restartLoading.value = true;
    restartError.value = null;
  } else {
    isLoading.value = true;
    error.value = null;
  }

  try {
    const response = await apiFetch('/quiz/start');

    if (!response.ok) {
      throw new Error('Не удалось загрузить вопросы квиза');
    }

    const rawData = (await response.json()) as BackendQuizQuestion[];

    const questions = rawData.map((item) =>
      markRaw({
        props: {
          category: item.category,
          content: item.content,
          questionId: item.id,
        },
        type: item.type,
      }),
    );

    quizState.startQuiz(crypto.randomUUID(), questions);
  } catch (loadError) {
    const message = loadError instanceof Error ? loadError.message : 'Ошибка загрузки квиза';

    if (inline) {
      restartError.value = message;
    } else {
      error.value = message;
    }

    console.error('Ошибка загрузки квиза:', loadError);
  } finally {
    if (inline) {
      restartLoading.value = false;
    } else {
      isLoading.value = false;
    }
  }
}

async function restartQuiz() {
  await loadQuiz({ inline: true });
}

onMounted(initializeQuiz);
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex min-h-screen items-center justify-center text-zinc-500 dark:text-zinc-400">
      Загружаем квиз...
    </div>

    <div
      v-else-if="error"
      class="flex min-h-screen items-center justify-center px-6 text-center text-red-600 dark:text-red-400"
    >
      {{ error }}
    </div>

    <QuizSummaryCard
      v-else-if="quizState.lastResult"
      :restart-error="restartError"
      :restart-loading="restartLoading"
      :summary="quizState.lastResult"
      @dashboard="goToDashboard"
      @restart="restartQuiz"
    />

    <WidgetWrapper v-else :questions="quizState.questions" />
  </div>
</template>

<style scoped></style>
