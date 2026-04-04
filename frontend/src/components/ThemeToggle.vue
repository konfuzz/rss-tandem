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
    <Transition
      mode="out-in"
      enter-active-class="transition-[opacity,transform] duration-200 ease-out"
      enter-from-class="opacity-0 -rotate-90 scale-50"
      leave-active-class="transition-[opacity,transform] duration-200 ease-out"
      leave-to-class="opacity-0 rotate-90 scale-50"
    >
      <i
        v-if="isDark"
        key="moon"
        class="pi pi-moon text-zinc-300 transition-transform duration-200 group-hover:scale-110"
      />
      <i v-else key="sun" class="pi pi-sun text-yellow-500 transition-transform duration-200 group-hover:scale-110" />
    </Transition>
  </button>
</template>
