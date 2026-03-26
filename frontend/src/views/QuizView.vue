<script setup lang="ts">
import { onMounted, ref } from 'vue';

import type { WidgetConfig } from '../types/widget';

import WidgetWrapper from '../components/WidgetWrapper.vue';
import { useQuizStore } from '../stores/quiz';
import { apiFetch } from '../utils/api';

const questions = ref<WidgetConfig[]>([]);
const isLoading = ref(true);
const quizState = useQuizStore();

onMounted(async () => {
  if (quizState.currentQuizId) {
    questions.value = quizState.questions;
  } else {
    quizState.currentQuizId = crypto.randomUUID();
    try {
      const req = await apiFetch('/quiz/start');
      const rawData = await req.json();

      questions.value = rawData.map((item: Record<string, unknown>) => ({
        props: {
          category: item.category,
          content: item.content,
          questionId: item.id,
        },
        type: item.type,
      }));
      quizState.questions = questions.value;
    } catch (error) {
      console.error('Ошибка загрузки квиза:', error);
    } finally {
      isLoading.value = false;
    }
  }
});
</script>

<template>
  <div>
    <WidgetWrapper :questions="questions" />
  </div>
</template>

<style scoped></style>
