<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';

import ThemeToggle from './components/ThemeToggle.vue';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const auth = useAuthStore();

const handleLogout = () => {
  auth.logout();
};

watch(
  () => auth.token,
  (newToken) => {
    if (!newToken) {
      router.push({ name: 'login' });
    }
  },
);
</script>

<template>
  <nav
    class="flex flex-row items-center justify-center gap-3 border-b border-zinc-200 py-4 dark:border-zinc-700 dark:bg-zinc-950"
  >
    <RouterLink to="/" class="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
      Главная
    </RouterLink>
    <template v-if="!auth.isAuthenticated">
      <RouterLink to="/login" class="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
        Вход
      </RouterLink>
    </template>
    <template v-else>
      <RouterLink to="/dashboard" class="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
        Кабинет
      </RouterLink>
      <RouterLink to="/quiz" class="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
        Quiz
      </RouterLink>
      <button
        class="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-lg transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
        aria-label="Выйти"
        @click="handleLogout"
      >
        <i
          class="pi pi-sign-out text-zinc-700 transition-transform duration-200 group-hover:scale-110 dark:text-zinc-300"
        />
      </button>
    </template>
    <ThemeToggle />
  </nav>

  <main class="bg-white dark:bg-zinc-950">
    <RouterView />
  </main>
</template>
