import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const userName = ref<null | string>(null);
  const userId = ref<null | number>(null);

  const isAuthenticated = computed(() => !!token.value);

  function setUser(user: string, id: number, token: string) {
    userName.value = user;
    userId.value = id;
    setToken(token);
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function logout() {
    token.value = null;
    userName.value = null;
    localStorage.removeItem('token');
  }

  return { isAuthenticated, logout, setUser, token, userId, userName };
});
