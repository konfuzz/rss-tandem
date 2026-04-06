<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { computed } from 'vue';

import type { QuizResultSummary } from '../stores/quiz';

const props = defineProps<{
  restartError?: null | string;
  restartLoading?: boolean;
  summary: QuizResultSummary;
}>();

const emit = defineEmits<{
  (e: 'dashboard'): void;
  (e: 'restart'): void;
}>();

const maxScore = computed(() => props.summary.totalQuestions * 10);
const progressPercent = computed(() => {
  if (maxScore.value === 0) return 0;

  return Math.min(100, Math.round((props.summary.totalScore / maxScore.value) * 100));
});

const progressTone = computed(() => {
  if (progressPercent.value < 40) return 'low';
  if (progressPercent.value < 70) return 'medium';

  return 'high';
});

const progressBarColor = computed(() => {
  if (progressTone.value === 'low') return 'bg-red-500!';
  if (progressTone.value === 'medium') return 'bg-amber-500!';

  return 'bg-emerald-500!';
});

const feedbackText = computed(() => {
  if (progressTone.value === 'low')
    return 'Ничего страшного — каждая попытка делает тебя сильнее. Повтори темы и попробуй ещё раз.';
  if (progressTone.value === 'medium') return 'Ты на верном пути! Ещё немного практики, и результат будет ещё лучше.';

  return 'Отличная работа! Так держать, продолжай в том же духе.';
});

function formatScore(score: number) {
  return score.toFixed(1);
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-6 py-10">
    <Card
      class="w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200/70 shadow-2xl dark:border-zinc-800"
    >
      <template #content>
        <div class="flex flex-col gap-6">
          <Message v-if="props.restartError" severity="error" :closable="false">
            {{ props.restartError }}
          </Message>

          <div class="flex flex-col gap-5">
            <Message
              severity="secondary"
              :closable="false"
              class="border-emerald-200! bg-emerald-50! px-4! py-4! dark:border-emerald-900/60! dark:bg-emerald-950/60!"
            >
              <div class="space-y-3">
                <p class="text-sm font-semibold text-emerald-950 dark:text-emerald-100">Результат сохранён</p>
                <p class="text-sm text-emerald-800 dark:text-emerald-200">{{ feedbackText }}</p>
              </div>
            </Message>

            <div>
              <div class="mb-4 flex items-center justify-between gap-4">
                <p class="text-sm font-medium text-zinc-950 dark:text-zinc-50">Прогресс текущей попытки</p>
                <p class="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{{ progressPercent }}%</p>
              </div>

              <ProgressBar
                :value="progressPercent"
                :showValue="false"
                :pt="{ value: { class: `${progressBarColor} transition-colors duration-200` } }"
                class="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
              />
            </div>

            <div class="flex flex-wrap gap-3">
              <Tag
                v-for="category in summary.categories"
                :key="category.name"
                :value="`${category.name}: ${formatScore(category.averageScore)}`"
                severity="success"
                class="rounded-md border! border-emerald-200! bg-emerald-50! px-3.5! py-2! text-sm! font-semibold! text-emerald-900! shadow-sm dark:border-emerald-800! dark:bg-emerald-950/80! dark:text-emerald-100!"
              />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <Card
              class="rounded-2xl border border-zinc-200 bg-zinc-50 shadow-none dark:border-zinc-800 dark:bg-zinc-900"
            >
              <template #content>
                <p class="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">Баллы</p>
                <p class="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{{ summary.totalScore }}</p>
                <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">из {{ maxScore }}</p>
              </template>
            </Card>

            <Card
              class="rounded-2xl border border-zinc-200 bg-zinc-50 shadow-none dark:border-zinc-800 dark:bg-zinc-900"
            >
              <template #content>
                <p class="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                  Идеальных ответов
                </p>
                <p class="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{{ summary.perfectAnswers }}</p>
              </template>
            </Card>

            <Card
              class="rounded-2xl border border-zinc-200 bg-zinc-50 shadow-none dark:border-zinc-800 dark:bg-zinc-900"
            >
              <template #content>
                <p class="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">Тем</p>
                <p class="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
                  {{ summary.categories.length }}
                </p>
              </template>
            </Card>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              label="Новый квиз"
              severity="secondary"
              variant="outlined"
              icon="pi pi-refresh"
              :loading="props.restartLoading"
              @click="emit('restart')"
            />
            <Button label="Завершить" icon="pi pi-chart-bar" @click="emit('dashboard')" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
