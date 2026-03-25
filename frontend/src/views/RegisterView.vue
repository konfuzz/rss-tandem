<script setup lang="ts">
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
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

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(`${apiUrl}/auth/register`, {
      body: JSON.stringify({ password: password.value, username: username.value }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Ошибка регистрации');

    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      body: JSON.stringify({ password: password.value, username: username.value }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) throw new Error(loginData.error || 'Ошибка входа');

    auth.setUser(loginData.user.username, loginData.user.id, loginData.token);

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
  <div class="flex min-h-screen flex-col items-center justify-center gap-4">
    <h2 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Регистрация</h2>
    <form @submit.prevent="handleRegister" class="flex w-full max-w-sm flex-col gap-4">
      <FloatLabel variant="on">
        <InputText id="register-username" v-model="username" class="w-full" required />
        <label for="register-username">Логин</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Password
          id="register-password"
          v-model="password"
          class="w-full"
          :feedback="false"
          toggle-mask
          fluid
          required
        />
        <label for="register-password">Пароль</label>
      </FloatLabel>
      <Button type="submit" :disabled="loading" :label="loading ? 'Загрузка...' : 'Регистрация'" />
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </form>
    <RouterLink to="/login" class="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
      Я уже зарегистрирован. Хочу войти.
    </RouterLink>
  </div>
</template>
