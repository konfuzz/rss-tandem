<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const { isDark, toggle } = useTheme();
</script>

<template>
  <button
    class="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-lg transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
    @click="toggle"
    aria-label="Toggle theme"
  >
    <Transition name="theme-icon" mode="out-in">
      <i
        v-if="isDark"
        key="moon"
        class="pi pi-moon text-zinc-300 transition-transform duration-200 group-hover:scale-110"
      />
      <i v-else key="sun" class="pi pi-sun text-yellow-500 transition-transform duration-200 group-hover:scale-110" />
    </Transition>
  </button>
</template>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>
