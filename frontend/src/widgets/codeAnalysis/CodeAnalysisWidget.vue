<script setup lang="ts">
import Button from 'primevue/button';
import Message from 'primevue/message';
import { computed, ref } from 'vue';

import type { QuizTask } from '../../types/widget';

import { apiFetch } from '../../utils/api';

interface CodeAnalysisValidationResponse {
  correctAnswer?: number[];
  score?: number;
}

type NoticeSeverity = 'error' | 'warn';

const props = defineProps<{
  content?: QuizTask;
  questionId?: number;
  task?: QuizTask;
}>();

const emit = defineEmits<{
  (e: 'result', payload: { score: number; success: boolean }): void;
  (e: 'validated', valid: boolean): void;
}>();

const status = ref<'fail' | 'playing' | 'showing_answer' | 'success'>('playing');
const selectedLines = ref<number[]>([]);
const correctLineIndices = ref<number[]>([]);
const isSubmitting = ref(false);
const notice = ref<null | { severity: NoticeSeverity; text: string }>(null);

const resolvedTask = computed<QuizTask>(() => props.task ?? props.content ?? {});
const lines = computed(() =>
  (resolvedTask.value.answers ?? []).filter((answer): answer is string => typeof answer === 'string'),
);
const questionText = computed(() => resolvedTask.value.question?.trim() ?? '');
const questionImage = computed(() => resolvedTask.value.questionImage?.trim() ?? '');
const hasRenderableTask = computed(() => questionText.value.length > 0 && lines.value.length > 0);
const isFinished = computed(() => status.value !== 'playing');
const selectedLinesCaption = computed(() =>
  selectedLines.value.length > 0
    ? `Выбраны строки: ${selectedLines.value.map((line) => line + 1).join(', ')}`
    : 'Нажмите на одну или несколько строк кода, чтобы отметить их.',
);

function clearNotice() {
  notice.value = null;
}

function getCodeClasses(index: number) {
  const isSelected = selectedLines.value.includes(index);
  const isCorrect = correctLineIndices.value.includes(index);
  const isCorrectVisible =
    (status.value === 'success' && isSelected && isCorrect) ||
    (status.value === 'showing_answer' && isCorrect) ||
    (status.value === 'fail' && isSelected && isCorrect);
  const isWrongVisible = status.value === 'fail' && isSelected && !isCorrect;

  return [
    'ca-code text-slate-700 dark:text-slate-200',
    status.value === 'playing' && isSelected && 'text-slate-900 dark:text-slate-100',
    isCorrectVisible && 'text-emerald-900 dark:text-emerald-100',
    isWrongVisible && 'text-rose-900 dark:text-rose-100',
  ].filter(Boolean);
}

function getGutterClasses(index: number) {
  const isSelected = selectedLines.value.includes(index);
  const isCorrect = correctLineIndices.value.includes(index);
  const isCorrectVisible =
    (status.value === 'success' && isSelected && isCorrect) ||
    (status.value === 'showing_answer' && isCorrect) ||
    (status.value === 'fail' && isSelected && isCorrect);
  const isWrongVisible = status.value === 'fail' && isSelected && !isCorrect;

  return [
    'ca-gutter border-slate-200 text-slate-400 dark:border-slate-700/60 dark:text-slate-500',
    !isFinished.value && 'group-hover/line:text-slate-500 dark:group-hover/line:text-slate-400',
    status.value === 'playing' &&
      isSelected &&
      'font-semibold text-emerald-700 drop-shadow-[0_0_6px_rgba(16,185,129,0.28)] dark:text-emerald-300 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]',
    isCorrectVisible &&
      'font-semibold text-emerald-700 drop-shadow-[0_0_7px_rgba(16,185,129,0.32)] dark:text-emerald-200 dark:drop-shadow-[0_0_9px_rgba(52,211,153,0.4)]',
    isWrongVisible && 'text-rose-600 dark:text-rose-300',
  ].filter(Boolean);
}

function getLineClasses(index: number) {
  const isSelected = selectedLines.value.includes(index);
  const isCorrect = correctLineIndices.value.includes(index);
  const isCorrectVisible =
    (status.value === 'success' && isSelected && isCorrect) ||
    (status.value === 'showing_answer' && isCorrect) ||
    (status.value === 'fail' && isSelected && isCorrect);
  const isWrongVisible = status.value === 'fail' && isSelected && !isCorrect;

  return [
    'ca-line group/line',
    !isFinished.value &&
      'cursor-pointer hover:bg-slate-50 focus-visible:bg-slate-50 dark:hover:bg-slate-800/70 dark:focus-visible:bg-slate-800/70',
    isFinished.value && 'cursor-default',
    status.value === 'playing' &&
      isSelected &&
      'border-l-emerald-400 bg-emerald-50/80 shadow-[inset_3px_0_0_0_rgba(52,211,153,1),inset_0_0_18px_rgba(16,185,129,0.08)] dark:border-l-emerald-500 dark:bg-emerald-500/12 dark:shadow-[inset_3px_0_0_0_rgba(16,185,129,1),inset_0_0_22px_rgba(16,185,129,0.14)]',
    isCorrectVisible &&
      'border-l-emerald-500 bg-emerald-100/80 shadow-[inset_3px_0_0_0_rgba(16,185,129,1),inset_0_0_24px_rgba(16,185,129,0.12)] dark:border-l-emerald-400 dark:bg-emerald-500/18 dark:shadow-[inset_3px_0_0_0_rgba(52,211,153,1),inset_0_0_28px_rgba(16,185,129,0.18)]',
    isWrongVisible && 'border-l-rose-500 bg-rose-50 dark:border-l-rose-400 dark:bg-rose-500/10',
  ].filter(Boolean);
}

function isCodeAnalysisValidationResponse(value: unknown): value is CodeAnalysisValidationResponse {
  if (!value || typeof value !== 'object') return false;

  const correctAnswer = Reflect.get(value, 'correctAnswer');
  const score = Reflect.get(value, 'score');

  const hasValidCorrectAnswer =
    correctAnswer === undefined ||
    (Array.isArray(correctAnswer) && correctAnswer.every((item) => typeof item === 'number'));
  const hasValidScore = score === undefined || typeof score === 'number';

  return hasValidCorrectAnswer && hasValidScore;
}

function setNotice(severity: NoticeSeverity, text: string) {
  notice.value = { severity, text };
}

function showAnswer() {
  if (correctLineIndices.value.length === 0) {
    setNotice('error', 'Не удалось получить правильные строки с сервера.');
    return;
  }

  selectedLines.value = [...correctLineIndices.value];
  status.value = 'showing_answer';
  clearNotice();
  emit('validated', true);
}

function toggleLine(index: number) {
  if (isFinished.value || isSubmitting.value) return;

  selectedLines.value = selectedLines.value.includes(index)
    ? selectedLines.value.filter((lineIndex) => lineIndex !== index)
    : [...selectedLines.value, index].sort((left, right) => left - right);

  if (notice.value?.severity === 'warn') {
    clearNotice();
  }
}

async function validate() {
  if (isSubmitting.value) return;

  if (status.value === 'showing_answer') {
    emit('validated', true);
    return;
  }

  if (!hasRenderableTask.value) {
    setNotice('warn', 'Вопрос пока не содержит данных для отображения.');
    emit('validated', false);
    return;
  }

  if (selectedLines.value.length === 0) {
    setNotice('warn', 'Выберите хотя бы одну строку кода перед проверкой.');
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
    const response = await apiFetch('/quiz/submit', {
      body: JSON.stringify({
        answer: selectedLines.value,
        questionId: props.questionId,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('API error');
    }

    const data: unknown = await response.json();

    if (!isCodeAnalysisValidationResponse(data)) {
      throw new Error('Invalid code-analysis validation response');
    }

    const score = typeof data.score === 'number' ? data.score : 0;

    correctLineIndices.value = Array.isArray(data.correctAnswer) ? [...data.correctAnswer] : [];
    status.value = score === 10 ? 'success' : 'fail';

    emit('result', { score, success: score === 10 });
    emit('validated', true);
  } catch (error) {
    console.error('Code-analysis validation failed', error);
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
    <div class="flex flex-col items-center gap-3 text-center">
      <h2 class="m-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
        {{ questionText || 'Вопрос не загружен' }}
      </h2>
      <p v-if="hasRenderableTask" class="text-sm text-slate-500 dark:text-slate-400">
        {{ selectedLinesCaption }}
      </p>
    </div>

    <div
      v-if="questionImage"
      class="overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
    >
      <img :src="questionImage" alt="Code analysis illustration" class="h-auto max-h-72 w-full object-cover" />
    </div>

    <Message v-if="!hasRenderableTask" severity="warn" :closable="false">
      Для этого вопроса пока нет текста или строк кода для анализа.
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
      Вот правильные строки.
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

    <div
      v-if="hasRenderableTask"
      class="ca-editor overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_0_0_1px_rgba(148,163,184,0.08),0_20px_50px_-12px_rgba(15,23,42,0.12)] dark:border-slate-700/70 dark:bg-slate-900 dark:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_50px_-12px_rgba(0,0,0,0.28)]"
    >
      <div class="ca-titlebar border-b border-slate-200 bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800">
        <div class="ca-dots">
          <span class="ca-dot ca-dot--close" />
          <span class="ca-dot ca-dot--min" />
          <span class="ca-dot ca-dot--max" />
        </div>
        <span class="ca-tab bg-white/95 text-slate-500 dark:bg-slate-900/65 dark:text-slate-400">code</span>
        <span class="ca-meta text-slate-400 dark:text-slate-500">{{ lines.length }} lines</span>
      </div>

      <div class="ca-body">
        <button
          v-for="(line, index) in lines"
          :key="`${index}-${line}`"
          type="button"
          :class="getLineClasses(index)"
          @click="toggleLine(index)"
        >
          <span :class="getGutterClasses(index)">{{ index + 1 }}</span>
          <span :class="getCodeClasses(index)">{{ line }}</span>
        </button>
      </div>
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
/* ── editor shell ── */
.ca-editor {
  width: 100%;
}

/* ── titlebar ── */
.ca-titlebar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 1rem;
}

.ca-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ca-dot {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ca-dot--close {
  background: #ff5f57;
}
.ca-dot--min {
  background: #febc2e;
}
.ca-dot--max {
  background: #28c840;
}

.ca-tab {
  padding: 0.15rem 0.55rem;
  border-radius: 0.3rem;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 0.7rem;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.ca-meta {
  margin-left: auto;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.02em;
}

/* ── code body ── */
.ca-body {
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  padding: 0.3rem 0;
}

/* ── line (button reset + layout) ── */
.ca-line {
  appearance: none;
  display: flex;
  align-items: stretch;
  width: 100%;
  border: none;
  border-left: 3px solid transparent;
  border-radius: 0;
  padding: 0;
  margin: 0;
  font: inherit;
  text-align: left;
  outline: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

/* ── gutter ── */
.ca-gutter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 3.25rem;
  min-width: 3.25rem;
  padding: 0 0.65rem 0 0.5rem;
  border-right-width: 1px;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.65rem;
  user-select: none;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

/* ── code cell ── */
.ca-code {
  flex: 1;
  min-width: 0;
  padding: 0 1rem 0 0.85rem;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  line-height: 1.65rem;
  white-space: pre;
  transition: color 0.15s ease;
}
</style>
