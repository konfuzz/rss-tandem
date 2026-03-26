<script setup lang="ts">
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Message from 'primevue/message';
import { computed, onMounted, ref } from 'vue';

import type { CaretPosition, NodeItem } from './MethodNode.vue';

import { useQuizStore } from '../../stores/quiz';
import { apiFetch } from '../../utils/api';
import MethodNode from './MethodNode.vue';
const quizState = useQuizStore();

interface TaskData {
  answers: { isContainer: boolean; label: string }[];
  initialCode: { isContainer: boolean; label: string };
  question: string;
}

interface TaskNode {
  children?: TaskNode[];
  label: string;
}

const props = defineProps<{ category: string; content: TaskData; questionId: number }>();
const emit = defineEmits<{
  (e: 'validated', valid: boolean): void;
  (e: 'result', payload: { success: boolean }): void;
}>();

const uid = () => Math.random().toString(36).slice(2, 11);

// ─── State ───
const status = ref<'fail' | 'playing' | 'showing_answer' | 'success'>('playing');
const bank = ref<NodeItem[]>([]);
const root = ref<NodeItem | null>(null);
const correctStructure = ref<null | TaskNode>(null);
const selectedId = ref<null | string>(null);
const caret = ref<CaretPosition | null>(null);

// ─── Init ───
const initTask = () => {
  status.value = 'playing';
  selectedId.value = null;
  caret.value = null;
  bank.value = props.content.answers.map((a) => ({
    children: a.isContainer ? [] : undefined,
    id: uid(),
    isContainer: a.isContainer,
    label: a.label,
  }));
  root.value = {
    children: props.content.initialCode.isContainer ? [] : undefined,
    id: uid(),
    isContainer: props.content.initialCode.isContainer,
    label: props.content.initialCode.label,
  };
};

onMounted(initTask);

const isFinished = computed(() => status.value !== 'playing');

// ─── Tree ───
const findNode = (node: NodeItem, id: string): NodeItem | null => {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};
const findAndRemove = (id: string, searchBank = true): NodeItem | null => {
  if (!root.value) return null;
  if (searchBank) {
    const idx = bank.value.findIndex((i) => i.id === id);
    if (idx > -1) return bank.value.splice(idx, 1)[0] ?? null;
  }
  const removeFromTree = (node: NodeItem): NodeItem | null => {
    if (!node.children) return null;
    const idx = node.children.findIndex((c) => c.id === id);
    if (idx > -1) return node.children.splice(idx, 1)[0] ?? null;
    for (const child of node.children) {
      const found = removeFromTree(child);
      if (found) return found;
    }
    return null;
  };
  return removeFromTree(root.value);
};
const isNodeInside = (targetId: string, rootNode: NodeItem): boolean => {
  if (rootNode.id === targetId) return true;
  return !!rootNode.children?.some((c) => isNodeInside(targetId, c));
};
const flattenNode = (node: NodeItem): NodeItem[] => {
  const items: NodeItem[] = [{ ...node, children: node.isContainer ? [] : undefined }];
  node.children?.forEach((c) => items.push(...flattenNode(c)));
  return items;
};

// ─── Insert at index ───
const insertItemAt = (itemId: string, containerId: string, index?: number) => {
  if (itemId === containerId || !root.value) return;
  const target = findNode(root.value, containerId);
  if (!target?.isContainer) return;

  const draggedNode = findNode(root.value, itemId) ?? bank.value.find((b) => b.id === itemId);
  // Prevent dropping a container into itself or its own children
  if (draggedNode && isNodeInside(target.id, draggedNode)) return;

  // Track old position to adjust index later if moving rightwards in same container
  const wasInSameContainer = target.children?.some((c) => c.id === itemId);
  const oldIndex = wasInSameContainer ? target.children!.findIndex((c) => c.id === itemId) : -1;

  const item = findAndRemove(itemId);
  if (!item) return;
  if (!target.children) target.children = [];

  let insertIdx = index ?? target.children.length;

  if (wasInSameContainer && oldIndex >= 0 && oldIndex < insertIdx) {
    insertIdx--;
  }

  insertIdx = Math.max(0, Math.min(insertIdx, target.children.length));
  target.children.splice(insertIdx, 0, item);
};

// ─── Calculate caret index ───
const calcInsertIndex = (event: DragEvent | MouseEvent, containerId: string): number => {
  if (!root.value) return 0;
  const container = findNode(root.value, containerId);
  if (!container?.children?.length) return 0;

  const currentTarget = event.currentTarget;
  if (!(currentTarget instanceof HTMLElement)) return container.children.length;

  const dropZone = currentTarget.closest('.drop-zone');
  if (!dropZone) return container.children.length;

  const childEls = Array.from(dropZone.children).filter(
    (el) => el.classList.contains('method-node') || el.classList.contains('p-chip'),
  );

  if (childEls.length === 0) return 0;

  const mouseX = event.clientX;

  for (let i = 0; i < childEls.length; i++) {
    const rect = childEls[i]?.getBoundingClientRect();
    if (!rect) continue;
    const midX = rect.left + rect.width / 2;
    if (mouseX < midX) return i;
  }

  return container.children?.length ?? 0;
};

// ─── Click-to-place ───
const onChipClick = (payload: { event: MouseEvent; id: string }) => {
  if (isFinished.value) return;
  const { id } = payload;

  if (selectedId.value === id) {
    selectedId.value = null;
    caret.value = null;
  } else if (selectedId.value) {
    const clickedInTree = root.value ? !!findNode(root.value, id) : false;
    if (clickedInTree && caret.value) {
      // Intentionally placing cursor near an existing chip using click-to-place aiming
      insertItemAt(selectedId.value, caret.value.containerId, caret.value.index);
      selectedId.value = null;
      caret.value = null;
    } else {
      const clicked = (root.value ? findNode(root.value, id) : null) ?? bank.value.find((b) => b.id === id);
      if (clicked?.isContainer && selectedId.value !== id) {
        insertItemAt(selectedId.value, id);
        selectedId.value = null;
        caret.value = null;
      } else {
        selectedId.value = id;
      }
    }
  } else {
    selectedId.value = id;
  }
};

const onZoneClick = (payload: { containerId: string; event: MouseEvent }) => {
  if (isFinished.value || !selectedId.value) return;
  const idx =
    caret.value?.containerId === payload.containerId
      ? caret.value.index
      : calcInsertIndex(payload.event, payload.containerId);
  insertItemAt(selectedId.value, payload.containerId, idx);
  selectedId.value = null;
  caret.value = null;
};

// ─── Hover Events ───
const onCardMouseMove = () => {
  if (selectedId.value && !isBankHighlighted.value) {
    caret.value = null;
  }
};

const onZoneMouseMove = (payload: { containerId: string; event: MouseEvent }) => {
  if (isFinished.value || !selectedId.value) return;
  const idx = calcInsertIndex(payload.event, payload.containerId);
  if (!caret.value || caret.value.containerId !== payload.containerId || caret.value.index !== idx) {
    caret.value = { containerId: payload.containerId, index: idx };
  }
};

// ─── Drag & Drop ───
const onChipDragStart = (payload: { event: DragEvent; id: string }) => {
  if (isFinished.value) return;
  selectedId.value = null;
  if (payload.event.dataTransfer) {
    // Only pass id, so other text is not dragged by default
    payload.event.dataTransfer.setData('text/plain', payload.id);
    payload.event.dataTransfer.effectAllowed = 'move';
  }
};

const onChipDragEnd = () => {
  caret.value = null;
};

// Top-level dragover to clear caret when outside drop zones
const onCardDragOver = () => {
  caret.value = null;
  isBankHighlighted.value = false;
};

const onZoneDragOver = (payload: { containerId: string; event: DragEvent }) => {
  const idx = calcInsertIndex(payload.event, payload.containerId);
  if (!caret.value || caret.value.containerId !== payload.containerId || caret.value.index !== idx) {
    caret.value = { containerId: payload.containerId, index: idx };
  }
};

const onZoneDrop = (payload: { containerId: string; event: DragEvent }) => {
  const itemId = payload.event.dataTransfer?.getData('text/plain');
  if (!itemId) return;
  const idx = caret.value?.containerId === payload.containerId ? caret.value.index : undefined;
  insertItemAt(itemId, payload.containerId, idx);
  onChipDragEnd();
};

// ─── Bank logic ───
const isBankHighlighted = ref(false);
const onBankDragOver = () => {
  isBankHighlighted.value = true;
  caret.value = null; // Clear caret if hovering bank
};
const onBankDrop = (event: DragEvent) => {
  isBankHighlighted.value = false;
  const itemId = event.dataTransfer?.getData('text/plain');
  if (!itemId) return;
  const item = findAndRemove(itemId, false);
  if (item) bank.value.push(...flattenNode(item));
  onChipDragEnd();
};

const onBankClick = () => {
  // If clicked bank empty space and an item is selected from constructor, move it back
  if (isFinished.value || !selectedId.value) return;
  const item = findAndRemove(selectedId.value, false);
  if (item) {
    bank.value.push(...flattenNode(item));
  }
  selectedId.value = null;
  caret.value = null;
};

// ─── Results ───

const buildCleanAnswer = (node: NodeItem): Record<string, unknown> => {
  const result: Record<string, unknown> = { label: node.label };
  if (node.children && node.children.length > 0) {
    result.children = node.children.map(buildCleanAnswer);
  }
  return result;
};

const validate = async () => {
  if (!root.value) return;

  if (status.value === 'showing_answer') {
    emit('validated', true);
    return;
  }

  const answerPayload = buildCleanAnswer(root.value);
  try {
    const response = await apiFetch('/quiz/submit', {
      body: JSON.stringify({ answer: answerPayload, questionId: props.questionId }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();

    if (data.score === 10) {
      status.value = 'success';
      correctStructure.value = data.correctAnswer || correctStructure.value;
      emit('validated', true);
    } else {
      status.value = 'fail';
      if (data.correctAnswer) {
        correctStructure.value = data.correctAnswer;
      }
      emit('validated', true);
    }
    quizState.recordAnswer(props.questionId, props.category, data.score);
    emit('result', { success: data.score === 10 });
  } catch (err) {
    console.error('Validation failed', err);
    status.value = 'fail';
    emit('validated', true);
    emit('result', { success: false });
  }
};

defineExpose({ validate });

const showAnswer = () => {
  if (!correctStructure.value) {
    console.warn('Cannot show answer: correctStructure is missing.');
    return;
  }

  // Create a pool of all available answers to track what's left
  const pool = [...props.content.answers];

  const build = (n: TaskNode): NodeItem => {
    const kids = n.children;
    const label = n.label;

    // Remove this label from the pool if it exists (it's part of the answer)
    const poolIdx = pool.findIndex((p) => p.label === label);
    if (poolIdx > -1) pool.splice(poolIdx, 1);

    return {
      children: kids?.map((c) => build(c)),
      id: uid(),
      isContainer: !!kids,
      label,
    };
  };

  root.value = build(correctStructure.value);

  // The remaining items in the pool are distractors
  bank.value = pool.map((p) => ({
    children: p.isContainer ? [] : undefined,
    id: uid(),
    isContainer: p.isContainer,
    label: p.label,
  }));

  status.value = 'showing_answer';
  emit('validated', true);
};
</script>

<template>
  <div class="w-full" @dragover.prevent="onCardDragOver" @mousemove="onCardMouseMove">
    <div class="flex w-full flex-col gap-8 md:p-2">
      <!-- Header -->
      <div class="flex flex-col items-center gap-4 text-center">
        <h2 class="m-0 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl dark:text-zinc-100">
          {{ content.question }}
        </h2>
      </div>

      <!-- Status -->
      <div v-if="isFinished" class="transition-all duration-300">
        <Message
          v-if="status === 'success'"
          severity="success"
          :closable="false"
          icon="pi pi-check-circle"
          class="border-emerald-500/20! bg-emerald-500/10! text-emerald-600! shadow-sm dark:text-emerald-400!"
        >
          Отлично! Метод собран верно.
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
          Неверно.
        </Message>
      </div>

      <!-- Constructor -->
      <div
        class="flex min-h-20 items-center justify-center overflow-x-auto rounded-2xl p-8 transition-all duration-500 md:p-6"
        :class="{ 'animating-answer': status === 'showing_answer' }"
      >
        <div v-if="root" class="flex items-center">
          <MethodNode
            :node="root"
            :is-root="true"
            :selected-id="selectedId"
            :caret="caret"
            :disabled="isFinished"
            @chip-click="onChipClick"
            @chip-dragstart="onChipDragStart"
            @chip-dragend="onChipDragEnd"
            @zone-click="onZoneClick"
            @zone-dragover="onZoneDragOver"
            @zone-drop="onZoneDrop"
            @zone-mousemove="onZoneMouseMove"
          />
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div
          class="flex items-center gap-2 pl-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500"
        >
          <span>Параметры</span>
          <span v-if="selectedId" class="font-normal text-emerald-500/70 normal-case dark:text-emerald-400/70">
            · Выберите зону или кликните сюда для возврата
          </span>
        </div>
        <div
          class="flex min-h-20 cursor-pointer flex-wrap items-center justify-center gap-3 rounded-2xl p-6 transition-all duration-200 md:p-8"
          :class="{ 'shadow-[0_0_0_2px_rgba(16,185,129,0.4)]': isBankHighlighted || selectedId }"
          @dragover.prevent.stop="onBankDragOver"
          @drop.prevent.stop="onBankDrop"
          @click="onBankClick"
        >
          <Chip
            v-for="item in bank"
            :key="item.id"
            class="cursor-grab rounded-lg! border! border-zinc-200! bg-zinc-100! transition-all duration-200 dark:border-zinc-700! dark:bg-zinc-800!"
            :class="{
              'scale-105 ring-2 ring-emerald-500/40': selectedId === item.id,
              'cursor-default! opacity-60': isFinished,
            }"
            :draggable="!isFinished"
            @click.stop="onChipClick({ id: item.id, event: $event })"
            @dragstart="onChipDragStart({ event: $event, id: item.id })"
            @dragend="onChipDragEnd"
          >
            <template #default>
              <span class="flex items-center gap-1.5">
                <span class="font-mono text-xs font-semibold">{{ item.label }}</span>
                <span
                  v-if="item.isContainer"
                  class="rounded bg-zinc-200/50 px-1.5 py-0.5 text-[10px] font-bold text-zinc-800 dark:bg-zinc-700/50 dark:text-zinc-200"
                  >()</span
                >
              </span>
            </template>
          </Chip>
          <span v-if="bank.length === 0" class="w-full py-2 text-center text-sm text-zinc-300 italic">
            Все параметры использованы
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-start pt-2">
        <Button
          v-if="isFinished && status !== 'success' && status !== 'showing_answer'"
          label="Показать ответ"
          icon="pi pi-eye"
          severity="secondary"
          variant="text"
          size="small"
          @click="showAnswer"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Show Answer Animation */
.animating-answer :deep(.method-node) {
  animation: slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
/* Stagger the inner components slightly */
.animating-answer :deep(.method-node .method-node) {
  animation-delay: 0.1s;
}
.animating-answer :deep(.method-node .method-node .method-node) {
  animation-delay: 0.2s;
}

@keyframes slide-up-fade {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
