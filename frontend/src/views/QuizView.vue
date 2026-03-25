<script setup lang="ts">
import type { WidgetConfig } from '../types/widget';

import WidgetWrapper from '../components/WidgetWrapper.vue';

const questions: WidgetConfig[] = [
  {
    props: {
      question: 'Что такое замыкание (closure) и как оно работает?',
    },
    type: 'ai-interviewer',
  },
];
</script>

<template>
  <div>
    <WidgetWrapper :questions="questions" />
  </div>
</template>

<style scoped></style>
