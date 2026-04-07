<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import { computed, ref, watch } from 'vue';

import type { WidgetConfig } from '../types/widget';

import { useQuizStore } from '../stores/quiz';
import { apiFetch } from '../utils/api';
import { buildFinishQuizPayload, buildQuizSummary, calculateQuizStats } from '../utils/quizResults';
import { widgetRegistry } from '../widgets/widgetRegistry';

const quizState = useQuizStore();

const props = defineProps<{
  questions: WidgetConfig[];
}>();

const currentIndex = computed({
  get: () => quizState.currentStep,
  set: (val) => (quizState.currentStep = val),
});

const isAnswered = ref(false);
const loading = ref(false);
const error = ref<null | string>(null);
const widgetRef = ref();

const currentQuestion = computed(() => props.questions[currentIndex.value]);
const currentQuestionId = computed(() => currentQuestion.value?.props?.questionId);
const currentQuestionAnswered = computed(
  () => currentQuestionId.value != null && quizState.answers.some((answer) => answer.id === currentQuestionId.value),
);

const currentWidget = computed(() => {
  const question = currentQuestion.value;
  return question ? widgetRegistry[question.type] : null;
});

const questionCount = computed(() => props.questions.length);

const buttonLabel = computed(() => {
  if (!isAnswered.value) return 'Ответить';
  return currentIndex.value === questionCount.value - 1 ? 'Завершить' : 'Следующий вопрос';
});

watch(
  currentQuestionAnswered,
  (answered) => {
    isAnswered.value = answered;
  },
  { immediate: true },
);

async function finishQuiz() {
  loading.value = true;
  error.value = null;

  try {
    const stats = calculateQuizStats(quizState.answers);
    const payload = buildFinishQuizPayload(quizState.answers, 'junior', stats);

    const response = await apiFetch('/quiz/finish', {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) throw new Error('Ошибка при сохранении результатов');

    const data = (await response.json()) as { resultId?: number };

    quizState.completeQuiz(
      buildQuizSummary({
        resultId: data.resultId ?? null,
        stats,
        totalQuestions: questionCount.value,
      }),
    );
  } catch (finishError) {
    error.value = finishError instanceof Error ? finishError.message : 'Не удалось завершить квиз';
    console.error(finishError);
  } finally {
    loading.value = false;
  }
}

function goToNextWidget() {
  if (currentIndex.value < questionCount.value - 1) {
    currentIndex.value++;
  }
}

async function handleButtonClick() {
  if (!isAnswered.value) {
    widgetRef.value?.validate();
    return;
  }

  if (currentIndex.value === questionCount.value - 1) {
    await finishQuiz();
  } else {
    nextQuestion();
  }
}

function nextQuestion() {
  goToNextWidget();
  isAnswered.value = false;
}

function onValidated(valid: boolean) {
  if (valid) {
    isAnswered.value = true;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
    <Card class="w-full max-w-300 rounded-2xl shadow-xl">
      <template #title>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Вопрос №{{ currentIndex + 1 }}</h2>
          <span class="text-sm text-zinc-500 dark:text-zinc-400"> {{ currentIndex + 1 }}/{{ questionCount }} </span>
        </div>
      </template>

      <template #content>
        <div class="relative min-h-50">
          <div v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</div>

          <div v-else-if="loading" class="flex justify-center p-10">Сохраняем результат...</div>

          <Transition name="fade" mode="out-in">
            <component
              :is="currentWidget"
              :key="currentIndex"
              ref="widgetRef"
              v-bind="currentQuestion?.props"
              @validated="onValidated"
            />
          </Transition>
        </div>
      </template>

      <template #footer>
        <div class="justify mt-4 flex justify-center">
          <Button :label="buttonLabel" :loading="loading" @click="handleButtonClick" />
        </div>
      </template>
    </Card>
  </div>
</template>
