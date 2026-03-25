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
  <div flex flex-col min-h-screen items-center justify-center>
    <h1>Dashboard</h1>
    <p>Привет, {{ data ? data.user.username : '' }}</p>
    <p>Твой id: {{ data ? data.user.id : '' }}</p>
  </div>
</template>
