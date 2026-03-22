<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '../stores/auth';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();
const auth = useAuthStore();

const apiUrl = import.meta.env.VITE_API_URL;

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      body: JSON.stringify({ password: password.value, username: username.value }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Ошибка входа');

    auth.setUser(data.user.username, data.user.id, data.token);
    router.push({ name: 'dashboard' });
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Произошла неизвестная ошибка';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-form">
    <h2>Вход</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="username" type="text" placeholder="Логин" required />
      <input v-model="password" type="password" placeholder="Пароль" required />
      <button type="submit" :disabled="loading">Войти</button>
      <p v-if="error" style="color: red">{{ error }}</p>
    </form>
  </div>
</template>
