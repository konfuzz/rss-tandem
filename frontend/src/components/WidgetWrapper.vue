<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import { computed, ref, watch } from 'vue';

import type { WidgetConfig } from '../types/widget';

import { useQuizStore } from '../stores/quiz';
import { apiFetch } from '../utils/api';
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

function buildQuizSummary(resultId: null | number = null) {
  const answeredQuestions = quizState.answers.length;
  const totalDuration = quizState.answers.reduce((acc, curr) => acc + curr.time, 0);
  const totalScore = quizState.answers.reduce((acc, curr) => acc + curr.score, 0);

  return {
    answeredQuestions,
    averageScore: answeredQuestions > 0 ? Number((totalScore / answeredQuestions).toFixed(1)) : 0,
    categories: [...new Set(quizState.answers.map((answer) => answer.category))],
    completedAt: new Date().toISOString(),
    perfectAnswers: quizState.answers.filter((answer) => answer.score === 10).length,
    resultId,
    totalDuration,
    totalQuestions: questionCount.value,
    totalScore,
  };
}

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
    const payload = {
      answers: quizState.answers,
      complexity: 'junior',
      totalDuration: quizState.answers.reduce((acc, curr) => acc + curr.time, 0),
      totalScore: quizState.answers.reduce((acc, curr) => acc + curr.score, 0),
    };

    const response = await apiFetch('/quiz/finish', {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) throw new Error('Ошибка при сохранении результатов');

    const data = (await response.json()) as { resultId?: number };

    quizState.completeQuiz(buildQuizSummary(data.resultId ?? null));
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
  <div class="flex min-h-screen items-center justify-center">
    <Card class="mx-10! w-full rounded-2xl shadow-xl">
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}
</style>
