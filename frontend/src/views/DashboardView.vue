<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch } from '../utils/api';

interface QuizResults {
  id: number;
  totalDuration: number;
  totalScore: number;
  userId: number;
  complexity: string;
  createdAt: string;
  details: string;
}

interface UserData {
  stats: {
    avgScore: number;
    recentHistory: QuizResults[];
    totalQuizzes: number;
  },
  user: {
    id: number;
    username: string;
  };
}

const data = ref<null | UserData>(null);

onMounted(async () => {
  try {
    data.value = await apiFetch('/user/stats');
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
