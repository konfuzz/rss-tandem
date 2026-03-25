<script setup lang="ts">
import Button from 'primevue/button';
import Message from 'primevue/message';
import RadioButton from 'primevue/radiobutton';
import { computed, ref } from 'vue';

type NoticeSeverity = 'error' | 'warn';

interface PollTask {
  answers?: string[];
  question?: string;
  questionImage?: string;
}

interface PollValidationResponse {
  correctAnswer?: number;
  score?: number;
}

const props = defineProps<{
  content?: PollTask;
  questionId?: number;
  task?: PollTask;
}>();

const emit = defineEmits<{
  (e: 'result', payload: { score: number; success: boolean }): void;
  (e: 'validated', valid: boolean): void;
}>();

const status = ref<'fail' | 'playing' | 'showing_answer' | 'success'>('playing');
const selectedAnswer = ref<null | number>(null);
const correctAnswerIndex = ref<null | number>(null);
const isSubmitting = ref(false);
const notice = ref<null | { severity: NoticeSeverity; text: string }>(null);

const resolvedTask = computed<PollTask>(() => props.task ?? props.content ?? {});
const answers = computed(() =>
  (resolvedTask.value.answers ?? []).filter((answer): answer is string => typeof answer === 'string'),
);
const questionText = computed(() => resolvedTask.value.question?.trim() ?? '');
const questionImage = computed(() => resolvedTask.value.questionImage?.trim() ?? '');
const hasRenderablePoll = computed(() => questionText.value.length > 0 && answers.value.length > 0);
const isFinished = computed(() => status.value !== 'playing');

function clearNotice() {
  notice.value = null;
}

function getOptionClasses(index: number) {
  const isSelected = selectedAnswer.value === index;
  const isCorrectAnswerVisible =
    (status.value === 'success' && isSelected) ||
    (status.value === 'showing_answer' && correctAnswerIndex.value === index);
  const isWrongAnswerVisible = status.value === 'fail' && isSelected;

  return [
    'poll-option min-h-16 cursor-pointer rounded-md border-2 text-slate-900 shadow-sm transition-all duration-200 dark:text-slate-100',
    'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40',
    !isFinished.value &&
      'hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md dark:hover:border-slate-500 dark:hover:bg-slate-900/65',
    status.value === 'playing' &&
      isSelected &&
      '!border-slate-400 bg-slate-50 dark:!border-slate-500 dark:bg-slate-900/75',
    isCorrectAnswerVisible && '!border-emerald-600 bg-emerald-50 dark:!border-emerald-500 dark:bg-emerald-500/10',
    isWrongAnswerVisible && '!border-rose-600 bg-rose-50 dark:!border-rose-500 dark:bg-rose-500/10',
    isFinished.value && 'cursor-default',
  ].filter(Boolean);
}

function isPollValidationResponse(value: unknown): value is PollValidationResponse {
  if (!value || typeof value !== 'object') return false;

  const correctAnswer = Reflect.get(value, 'correctAnswer');
  const score = Reflect.get(value, 'score');

  const hasValidCorrectAnswer = correctAnswer === undefined || typeof correctAnswer === 'number';
  const hasValidScore = score === undefined || typeof score === 'number';

  return hasValidCorrectAnswer && hasValidScore;
}

function selectAnswer(index: number) {
  if (isFinished.value || isSubmitting.value) return;

  selectedAnswer.value = index;

  if (notice.value?.severity === 'warn') {
    clearNotice();
  }
}

function setNotice(severity: NoticeSeverity, text: string) {
  notice.value = { severity, text };
}

function showAnswer() {
  if (correctAnswerIndex.value === null) {
    setNotice('error', 'Не удалось получить правильный ответ с сервера.');
    return;
  }

  selectedAnswer.value = correctAnswerIndex.value;
  status.value = 'showing_answer';
  clearNotice();
  emit('validated', true);
}

async function validate() {
  if (isSubmitting.value) return;

  if (status.value === 'showing_answer') {
    emit('validated', true);
    return;
  }

  if (!hasRenderablePoll.value) {
    setNotice('warn', 'Вопрос пока не содержит данных для отображения.');
    emit('validated', false);
    return;
  }

  if (selectedAnswer.value === null) {
    setNotice('warn', 'Выберите один вариант ответа перед проверкой.');
    emit('validated', false);
    return;
  }

  if (!props.questionId) {
    setNotice('error', 'Не удалось определить идентификатор вопроса для проверки.');
    emit('validated', false);
    return;
  }

  isSubmitting.value = true;
  clearNotice();

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/quiz/submit`, {
      body: JSON.stringify({
        answer: selectedAnswer.value,
        questionId: props.questionId,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('API error');
    }

    const data: unknown = await response.json();

    if (!isPollValidationResponse(data)) {
      throw new Error('Invalid poll validation response');
    }

    const score = typeof data.score === 'number' ? data.score : 0;
    const isCorrect = score === 10;

    correctAnswerIndex.value = typeof data.correctAnswer === 'number' ? data.correctAnswer : null;
    status.value = isCorrect ? 'success' : 'fail';

    emit('result', { score, success: isCorrect });
    emit('validated', true);
  } catch (error) {
    console.error('Poll validation failed', error);
    status.value = 'fail';
    setNotice('error', 'Не удалось проверить ответ. Попробуйте ещё раз.');
    emit('result', { score: 0, success: false });
    emit('validated', true);
  } finally {
    isSubmitting.value = false;
  }
}

defineExpose({ validate });
</script>

<template>
  <div class="flex w-full flex-col gap-6 md:p-2">
    <div class="flex flex-col items-center gap-4 text-center">
      <h2 class="m-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
        {{ questionText || 'Вопрос не загружен' }}
      </h2>
    </div>

    <div
      v-if="questionImage"
      class="overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
    >
      <img :src="questionImage" alt="Poll illustration" class="h-auto max-h-72 w-full object-cover" />
    </div>

    <Message v-if="!hasRenderablePoll" severity="warn" :closable="false">
      Для этого вопроса пока нет текста или вариантов ответа.
    </Message>

    <Message
      v-else-if="status === 'success'"
      severity="success"
      :closable="false"
      icon="pi pi-check-circle"
      class="border-emerald-500/20! bg-emerald-500/10! text-emerald-600! shadow-sm dark:text-emerald-400!"
    >
      Ответ верный.
    </Message>

    <Message
      v-else-if="status === 'showing_answer'"
      severity="info"
      :closable="false"
      icon="pi pi-info-circle"
      class="shadow-sm"
    >
      Вот правильный ответ.
    </Message>

    <Message
      v-else-if="status === 'fail'"
      severity="error"
      :closable="false"
      icon="pi pi-times-circle"
      class="shadow-sm"
    >
      Ответ неверный.
    </Message>

    <Message v-else-if="notice" :severity="notice.severity" :closable="false">
      {{ notice.text }}
    </Message>

    <div v-if="hasRenderablePoll" class="grid gap-3">
      <label
        v-for="(answer, index) in answers"
        :key="`${index}-${answer}`"
        :class="getOptionClasses(index)"
        @click="selectAnswer(index)"
      >
        <div class="poll-option-radio">
          <RadioButton
            :input-id="`poll-answer-${index}`"
            :model-value="selectedAnswer"
            :value="index"
            :disabled="isFinished || isSubmitting"
            class="shrink-0"
            @update:model-value="selectAnswer(index)"
            @click.stop
          />
        </div>

        <div class="min-w-0">
          <p class="text-base leading-relaxed font-medium wrap-break-word">
            {{ answer }}
          </p>
        </div>
      </label>
    </div>

    <div class="flex items-center justify-start pt-1">
      <Button
        v-if="status === 'fail'"
        label="Показать ответ"
        icon="pi pi-eye"
        severity="secondary"
        variant="text"
        size="small"
        @click="showAnswer"
      />
    </div>
  </div>
</template>

<style scoped>
.poll-option {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  align-items: center;
  column-gap: 1.5rem;
  padding: 1rem 1.5rem;
}

.poll-option-radio {
  display: flex;
  width: 2rem;
  align-items: center;
  justify-content: center;
}
</style>
