<script setup lang="ts">
import Button from 'primevue/button';
import { onMounted, ref } from 'vue';

import type { questionType, WidgetConfig } from '../types/widget';

import WidgetWrapper from '../components/WidgetWrapper.vue';
import { apiFetch } from '../utils/api';

interface BackendQuizQuestion {
  content: Record<string, unknown>;
  id: number;
  type: string;
}

type SupportedQuestionType = Exclude<questionType, 'example'>;

const error = ref('');
const isLoading = ref(true);
const questions = ref<WidgetConfig[]>([]);
const supportedQuestionTypes = new Set<SupportedQuestionType>([
  'ai-interviewer',
  'basic-poll',
  'code-analysis',
  'drag-n-drop',
  'multiple-choice',
]);

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data: unknown = await response.json();
    const errorMessage = data && typeof data === 'object' ? Reflect.get(data, 'error') : undefined;

    return typeof errorMessage === 'string' ? errorMessage : fallback;
  } catch {
    return fallback;
  }
}

function isBackendQuizQuestion(value: unknown): value is BackendQuizQuestion {
  if (!value || typeof value !== 'object') return false;

  const content = Reflect.get(value, 'content');
  const id = Reflect.get(value, 'id');
  const type = Reflect.get(value, 'type');

  return typeof id === 'number' && typeof type === 'string' && !!content && typeof content === 'object';
}

function isSupportedQuestionType(value: string): value is SupportedQuestionType {
  return supportedQuestionTypes.has(value as SupportedQuestionType);
}

async function loadQuestions() {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await apiFetch('/quiz/start?complexity=junior');

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to load quiz questions.'));
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Server returned an unexpected quiz payload.');
    }

    const mappedQuestions = data
      .filter(isBackendQuizQuestion)
      .map(mapQuestionToWidgetConfig)
      .filter((question): question is WidgetConfig => question !== null);

    if (mappedQuestions.length === 0) {
      throw new Error('No supported quiz questions were returned.');
    }

    questions.value = mappedQuestions;
  } catch (err) {
    questions.value = [];
    error.value = err instanceof Error ? err.message : 'Failed to load quiz questions.';
  } finally {
    isLoading.value = false;
  }
}

function mapQuestionToWidgetConfig(question: BackendQuizQuestion): null | WidgetConfig {
  if (!isSupportedQuestionType(question.type)) {
    console.warn(`Unsupported question type: ${question.type}`);
    return null;
  }

  if (question.type === 'ai-interviewer') {
    const questionText = Reflect.get(question.content, 'question');

    if (typeof questionText !== 'string') {
      console.warn(`Invalid AI interviewer payload for question ${question.id}`);
      return null;
    }

    return {
      props: {
        question: questionText,
      },
      type: question.type,
    };
  }

  return {
    props: {
      questionId: question.id,
      task: question.content,
    },
    type: question.type,
  };
}

onMounted(loadQuestions);
</script>

<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <p class="text-zinc-600 dark:text-zinc-400">Loading questions...</p>
  </div>

  <div v-else-if="error" class="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
    <p class="max-w-xl text-red-600 dark:text-red-400">{{ error }}</p>
    <Button label="Retry" @click="loadQuestions" />
  </div>

  <div v-else-if="questions.length === 0" class="flex min-h-screen items-center justify-center">
    <p class="text-zinc-600 dark:text-zinc-400">No questions available.</p>
  </div>

  <WidgetWrapper v-else :questions="questions" />
</template>

<style scoped></style>
