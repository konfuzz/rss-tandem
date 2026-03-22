<script setup lang="ts">
import type { WidgetConfig } from '../types/widget';

import WidgetWrapper from '../components/WidgetWrapper.vue';

const questions: WidgetConfig[] = [
  { type: 'example' },
  {
    type: 'basic-poll',
  },
  {
    type: 'drag-n-drop',
  },
  {
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
