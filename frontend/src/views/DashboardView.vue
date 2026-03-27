<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { apiFetch } from '../utils/api';

interface QuizResults {
  complexity: string;
  createdAt: string;
  details: string;
  id: number;
  totalDuration: number;
  totalScore: number;
  userId: number;
}

interface UserData {
  stats: {
    avgScore: number;
    recentHistory: QuizResults[];
    totalQuizzes: number;
  };
  user: {
    id: number;
    username: string;
  };
}

const data = ref<null | UserData>(null);

onMounted(async () => {
  try {
    const response = await apiFetch('/user/stats');

    if (!response.ok) {
      throw new Error('Failed to load dashboard data.');
    }

    data.value = (await response.json()) as UserData;
  } catch (error) {
    console.error('Ошибка:', error);
  }
});
</script>
<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-2">
    <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
    <p class="text-zinc-700 dark:text-zinc-300">Привет, {{ data ? data.user.username : '' }}</p>
    <p class="text-zinc-500 dark:text-zinc-400">Твой id: {{ data ? data.user.id : '' }}</p>

    <RouterLink
      to="/quiz"
      class="rounded-xl bg-zinc-900 px-4 py-2 text-center font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900"
    >
      Начать квиз
    </RouterLink>
  </div>
</template>
