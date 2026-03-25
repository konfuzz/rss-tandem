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
  <Card>
    <div class="chat">
      <p class="message int">{{ question.question }}</p>
      <p class="message student">{{ studentAnswer }}</p>
      <div v-html="renderedHtml" class="message"></div>
    </div>
    <div class="form">
      <p class="message score">{{ score }}</p>
      <Textarea rows="5" cols="30" v-model="draftAnswer" placeholder="Введите ответ..." />
      <!-- <Button label='Ответить' @click="submitAnswer" /> -->
    </div>
  </Card>
</template>

<style scoped>
.chat {
  flex-grow: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.form {
  width: 100%;
  display: flex;
  height: 100px;
  gap: 1rem;
}

textarea {
  flex-grow: 1;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}

button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background-color: rgb(3, 89, 4);
  border: none;
}

.message {
  max-width: 70%;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  line-height: 1.5;
  background-color: rgb(0, 62, 62);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:empty {
    display: none;
  }

  &.student {
    background-color: rgb(0, 106, 5);
    align-self: flex-end;
  }
}
</style>
