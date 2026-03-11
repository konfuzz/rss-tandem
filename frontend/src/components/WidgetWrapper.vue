<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import { computed, ref } from 'vue';

import type { WidgetConfig } from '../types/widget';

import { widgetRegistry } from '../widgets/widgetRegistry';

const props = defineProps<{
  questions: WidgetConfig[];
}>();

const currentIndex = ref(0);
const isAnswered = ref(false);
const validateTrigger = ref(0);
const loading = ref(false);
const error = ref<null | string>(null);

const currentQuestion = computed(() => props.questions[currentIndex.value]);

const currentWidget = computed(() => {
  const question = currentQuestion.value;

  if (question) {
    const component = widgetRegistry[question.type];
    return component;
  }

  return null;
});

const questionCount = computed(() => props.questions.length);

const buttonLabel = computed(() => {
  if (!isAnswered.value) return 'Ответить';

  if (currentIndex.value === questionCount.value - 1) {
    return 'Завершить';
  }

  return 'Следующий вопрос';
});

function emitValidate() {
  validateTrigger.value++;
}

function goToNextWidget() {
  currentIndex.value = (currentIndex.value + 1) % questionCount.value;
}

function handleButtonClick() {
  if (!isAnswered.value) {
    emitValidate();
    return;
  }

  nextQuestion();
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
          <span class="text-sm text-gray-500"> {{ currentIndex + 1 }}/{{ questionCount }} </span>
        </div>
      </template>

      <template #content>
        <div class="relative min-h-50">
          <div v-if="error" class="text-red-500">Failed to load a question: {{ error }}</div>

          <div v-else-if="loading" class="flex justify-center p-10">Загрузка вопроса...</div>

          <Transition name="fade" mode="out-in">
            <component
              :is="currentWidget"
              v-bind="currentQuestion?.props"
              :validate-trigger="validateTrigger"
              @validated="onValidated"
              :key="currentIndex"
            />
          </Transition>
        </div>
      </template>

      <template #footer>
        <div class="justify mt-4 flex justify-center">
          <Button :label="buttonLabel" @click="handleButtonClick" />
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
