import { ref, watch } from 'vue';

const STORAGE_KEY = 'theme';
const DARK_CLASS = 'p-dark';

function getInitialDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const isDark = ref(getInitialDark());

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle(DARK_CLASS, dark);
}

applyTheme(isDark.value);

watch(isDark, (dark) => {
  applyTheme(dark);
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
});

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggle };
}
