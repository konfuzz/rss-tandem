<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import Textarea from 'primevue/textarea';
import { computed, ref } from 'vue';

import { apiFetch } from '../../utils/api';

const md = new MarkdownIt();
const answer = ref('');
const studentAnswer = ref('');
const draftAnswer = ref('');
const score = ref(0);

const question = defineProps({
  question: {
    required: true,
    type: String,
  },
});

const emit = defineEmits<{
  validated: [boolean];
}>();

const renderedHtml = computed(() => md.render(answer.value));

async function validate() {
  answer.value = '';
  score.value = 0;
  studentAnswer.value = draftAnswer.value;
  draftAnswer.value = '';

  const response = await apiFetch('/quiz/review', {
    body: JSON.stringify({
      question: question,
      studentAnswer: studentAnswer.value,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.body) return;
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
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  emit('validated', true);
}

defineExpose({ validate });
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex grow flex-col gap-1">
      <p
        class="ai-message max-w-[70%] rounded-lg bg-emerald-800 px-4 py-2 text-emerald-50 dark:bg-emerald-900 dark:text-emerald-100"
      >
        {{ question.question }}
      </p>
      <p
        v-if="studentAnswer"
        class="ai-message max-w-[70%] self-end rounded-lg bg-emerald-600 px-4 py-2 text-emerald-50 dark:bg-emerald-700 dark:text-emerald-100"
      >
        {{ studentAnswer }}
      </p>
      <div
        v-if="renderedHtml"
        v-html="renderedHtml"
        class="ai-message flex max-w-[70%] flex-col gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-emerald-50 dark:bg-emerald-900 dark:text-emerald-100"
      />
    </div>
    <div class="flex w-full items-start gap-4">
      <p
        class="rounded-lg bg-emerald-800 px-4 py-2 text-lg font-bold text-emerald-50 dark:bg-emerald-900 dark:text-emerald-100"
      >
        {{ score }}
      </p>
      <Textarea rows="5" cols="30" v-model="draftAnswer" placeholder="Введите ответ..." class="grow" />
    </div>
  </div>
</template>
