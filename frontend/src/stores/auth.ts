import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useQuizStore } from './quiz';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<null | string>(null);
    const userName = ref<null | string>(null);
    const userId = ref<null | number>(null);

    const isAuthenticated = computed(() => !!token.value);

    function setUser(user: string, id: number, newToken: string) {
      userName.value = user;
      userId.value = id;
      token.value = newToken;
    }

    function logout() {
      const quiz = useQuizStore();

      quiz.resetQuiz();
      token.value = null;
      userName.value = null;
      userId.value = null;
    }

    return { isAuthenticated, logout, setUser, token, userId, userName };
  },
  { persist: true },
);
