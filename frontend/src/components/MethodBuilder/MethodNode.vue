<script lang="ts">
export default {
  name: 'MethodNode',
};
</script>

<script setup lang="ts">
import Chip from 'primevue/chip';

export interface CaretPosition {
  containerId: string;
  index: number;
}
export interface NodeItem {
  children?: NodeItem[];
  id: string;
  isContainer: boolean;
  label: string;
}

defineProps<{
  caret?: CaretPosition | null;
  disabled?: boolean;
  isRoot?: boolean;
  node: NodeItem;
  selectedId?: null | string;
}>();

const emit = defineEmits<{
  (e: 'chip-click', payload: { event: MouseEvent; id: string }): void;
  (e: 'chip-dragend'): void;
  (e: 'chip-dragstart', payload: { event: DragEvent; id: string }): void;
  (e: 'zone-click', payload: { containerId: string; event: MouseEvent }): void;
  (e: 'zone-dragover', payload: { containerId: string; event: DragEvent }): void;
  (e: 'zone-drop', payload: { containerId: string; event: DragEvent }): void;
  (e: 'zone-mousemove', payload: { containerId: string; event: MouseEvent }): void;
}>();
</script>

<template>
  <span class="method-node inline-flex shrink-0 items-center select-none">
    <!-- Root label -->
    <Chip
      v-if="isRoot"
      :label="node.label"
      class="inline-flex shrink-0 items-center rounded-lg! border! border-slate-200! bg-slate-100! px-4! py-1.5! font-mono! text-[13px]! font-bold! text-slate-900! shadow-sm dark:border-slate-700! dark:bg-slate-800! dark:text-slate-100!"
    />

    <!-- Non-root: draggable chip -->
    <Chip
      v-else
      :label="node.label"
      class="inline-flex cursor-grab items-center rounded-lg! border! border-slate-200! bg-slate-100! px-3! py-1! font-mono! text-[13px]! font-semibold! text-slate-800! transition-all duration-200 active:cursor-grabbing dark:border-slate-700! dark:bg-slate-800! dark:text-slate-200!"
      :class="{
        'scale-105 ring-2 ring-sky-500/40': selectedId === node.id,
        'cursor-default opacity-60': disabled,
      }"
      :draggable="!disabled"
      @dragstart.stop="emit('chip-dragstart', { event: $event, id: node.id })"
      @dragend.stop="emit('chip-dragend')"
      @click.stop="!disabled && emit('chip-click', { event: $event, id: node.id })"
    />

    <!-- Container: ( children ) -->
    <template v-if="node.isContainer">
      <span class="mx-0.5 font-mono text-lg leading-none font-bold text-slate-800 dark:text-slate-200">(</span>

      <span
        class="drop-zone relative inline-flex min-h-9 min-w-14 flex-wrap items-center gap-1 rounded-lg border border-transparent px-1.5 py-1 transition-colors"
        @click.stop="!disabled && emit('zone-click', { containerId: node.id, event: $event })"
        @dragover.prevent.stop="emit('zone-dragover', { containerId: node.id, event: $event })"
        @drop.prevent.stop="emit('zone-drop', { containerId: node.id, event: $event })"
        @mousemove.stop="!disabled && selectedId && emit('zone-mousemove', { containerId: node.id, event: $event })"
      >
        <!-- Caret before first child -->
        <span v-if="caret && caret.containerId === node.id && caret.index === 0" class="caret" />

        <template v-for="(child, idx) in node.children" :key="child.id">
          <MethodNode
            :node="child"
            :is-root="false"
            :selected-id="selectedId"
            :caret="caret"
            :disabled="disabled"
            @chip-click="emit('chip-click', $event)"
            @chip-dragstart="emit('chip-dragstart', $event)"
            @chip-dragend="emit('chip-dragend')"
            @zone-click="emit('zone-click', $event)"
            @zone-dragover="emit('zone-dragover', $event)"
            @zone-drop="emit('zone-drop', $event)"
            @zone-mousemove="emit('zone-mousemove', $event)"
          />

          <!-- Separator + caret after this child -->
          <span
            v-if="idx < (node.children?.length ?? 0) - 1"
            class="font-mono text-sm font-semibold text-slate-400 dark:text-slate-600"
            >,
          </span>

          <span v-if="caret && caret.containerId === node.id && caret.index === idx + 1" class="caret" />
        </template>

        <!-- Placeholder when empty -->
        <span
          v-if="!node.children?.length && !(caret && caret.containerId === node.id)"
          class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-[10px] whitespace-nowrap text-slate-400 italic dark:text-slate-500"
        >
          {{ disabled ? '…' : 'сюда' }}
        </span>
      </span>

      <span class="mx-0.5 font-mono text-lg leading-none font-bold text-slate-800 dark:text-slate-200">)</span>
    </template>
  </span>
</template>

<style scoped>
.caret {
  display: inline-block;
  width: 2px;
  height: 1.25rem;
  background: rgba(14, 165, 233, 0.5); /* sky-500 with opacity */
  border-radius: 999px;
  margin: 0 1px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
  pointer-events: none;
}
</style>
