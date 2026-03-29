<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import Textarea from 'primevue/textarea';
import { computed, ref } from 'vue';

import type { QuizTask } from '../../types/widget';

import { useQuizStore } from '../../stores/quiz';
import { apiFetch } from '../../utils/api';

const quizState = useQuizStore();

const md = new MarkdownIt();
const answer = ref('');
const studentAnswer = ref('');
const draftAnswer = ref('');
const score = ref(0);

const question = defineProps<{
  category: string;
  content: QuizTask;
  questionId: number;
}>();

const emit = defineEmits<{
  validated: [boolean];
}>();

const renderedHtml = computed(() => md.render(answer.value));
const errorMessage = ref('');
const isValidating = ref(false);

async function validate() {
  answer.value = '';
  score.value = 0;
  studentAnswer.value = draftAnswer.value;
  draftAnswer.value = '';
  errorMessage.value = '';
  isValidating.value = true;

  let scoreReceived = false;

  try {
    const response = await apiFetch('/quiz/review', {
      body: JSON.stringify({
        question: question.content?.question,
        studentAnswer: studentAnswer.value,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok || !response.body) {
      errorMessage.value = 'Произошла ошибка при запросе к ИИ. Пожалуйста, попробуйте позже.';
      isValidating.value = false;
      draftAnswer.value = studentAnswer.value;
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '');
          try {
            const data = JSON.parse(jsonStr);

            if (data.type === 'response.output_text.delta') {
              answer.value += data.delta;
            }
            if (data.type === 'response.function_call_arguments.done') {
              score.value = JSON.parse(data.arguments).score;
              scoreReceived = true;
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    }

    if (!scoreReceived) {
      score.value = 10;
    }

    quizState.recordAnswer(question.questionId, question.category, score.value);
    isValidating.value = false;
    emit('validated', true);
  } catch (err) {
    console.error('Validation error:', err);
    errorMessage.value = 'Не удалось связаться с сервером. Пожалуйста, попробуйте позже.';
    isValidating.value = false;
    draftAnswer.value = studentAnswer.value;
  }
}

defineExpose({ validate });
</script>

<template>
  <div class="flex w-full flex-col gap-6 font-sans">
    <div class="flex grow flex-col gap-4">
      <div class="group flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 shadow-sm transition-transform group-hover:scale-110 dark:bg-emerald-900/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-emerald-700 dark:text-emerald-300"
          >
            <path d="M12 8V4H8"></path>
            <rect width="16" height="12" x="4" y="8" rx="2"></rect>
            <path d="M2 14h2"></path>
            <path d="M20 14h2"></path>
            <path d="M15 13v2"></path>
            <path d="M9 13v2"></path>
          </svg>
        </div>
        <div
          class="relative max-w-[70%] rounded-2xl rounded-tl-none bg-emerald-800 px-5 py-3 text-emerald-50 shadow-md transition-all dark:bg-emerald-900"
        >
          <p class="text-[15px] leading-relaxed">
            {{ question.content?.question }}
          </p>
          <div
            class="absolute top-0 -left-2 h-4 w-4 bg-emerald-800 [clip-path:polygon(100%_0,0_0,100%_100%)] dark:bg-emerald-900"
          ></div>
        </div>
      </div>

      <transition
        enter-active-class="transform transition duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0 scale-95"
        enter-to-class="translate-y-0 opacity-100 scale-100"
      >
        <div v-if="studentAnswer" class="group flex items-start justify-end gap-3">
          <div
            class="relative max-w-[85%] rounded-2xl rounded-tr-none bg-emerald-600 px-5 py-3 text-emerald-50 shadow-md transition-all dark:bg-emerald-700"
          >
            <p class="text-[15px] leading-relaxed">
              {{ studentAnswer }}
            </p>
            <div
              class="absolute top-0 -right-2 h-4 w-4 bg-emerald-600 [clip-path:polygon(0_0,100%_0,0_100%)] dark:bg-emerald-700"
            ></div>
          </div>
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 shadow-sm transition-transform group-hover:scale-110 dark:bg-emerald-900/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-emerald-700 dark:text-emerald-300"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </transition>

      <transition
        enter-active-class="transform transition duration-500 ease-out"
        enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
      >
        <div v-if="renderedHtml || isValidating" class="group flex items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 shadow-sm transition-transform group-hover:scale-110 dark:bg-emerald-900/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-emerald-700 dark:text-emerald-300"
            >
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div class="relative max-w-[70%] flex-col gap-3">
            <div
              class="relative rounded-2xl rounded-tl-none bg-emerald-800 px-5 py-3 text-emerald-50 shadow-md transition-all dark:bg-emerald-900"
            >
              <div v-if="isValidating && !renderedHtml" class="flex gap-1.5 py-2">
                <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]"></span>
                <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]"></span>
                <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-400"></span>
              </div>
              <div
                v-if="renderedHtml"
                v-html="renderedHtml"
                class="ai-feedback-content text-[15px] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0"
              />
              <div
                class="absolute top-0 -left-2 h-4 w-4 bg-emerald-800 [clip-path:polygon(100%_0,0_0,100%_100%)] dark:bg-emerald-900"
              ></div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
    >
      <div
        v-if="errorMessage"
        class="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="text-sm font-medium">{{ errorMessage }}</span>
      </div>
    </transition>

    <transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div v-if="!studentAnswer || errorMessage" class="relative flex w-full flex-col gap-2 pt-2">
        <div
          class="relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-200 transition-all focus-within:ring-2 focus-within:ring-emerald-500 dark:bg-gray-800 dark:ring-gray-700"
        >
          <Textarea
            rows="3"
            v-model="draftAnswer"
            placeholder="Напишите ваш ответ тут..."
            class="w-full border-none! bg-transparent! px-4 py-3 text-[15px] placeholder:text-gray-400 focus:ring-0 focus:outline-none dark:text-gray-100"
            :disabled="isValidating"
          />
        </div>
      </div>
    </transition>
  </div>
</template>
