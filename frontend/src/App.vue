<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useAuthStore } from './stores/auth';

const router = useRouter();

const auth = useAuthStore();

const handleLogout = () => {
  auth.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <nav class="flex flex-row items-center justify-center gap-2 py-5!">
    <RouterLink to="/">Главная</RouterLink>
    <template v-if="!auth.isAuthenticated">
      <RouterLink to="/login">Вход</RouterLink>
    </template>
    <template v-else>
      <RouterLink to="/dashboard">Кабинет</RouterLink>
      <RouterLink to="/quiz">Quiz</RouterLink>
      <button @click="handleLogout">Выйти</button>
    </template>
  </nav>

  <main>
    <RouterView />
  </main>
</template>
