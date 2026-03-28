<script setup lang="ts">
import type { ScriptableContext, TooltipItem } from 'chart.js';

import { CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { computed, onMounted, ref } from 'vue';
import { Line } from 'vue-chartjs';

import { useQuizStore } from '../stores/quiz';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

import { apiFetch } from '../utils/api';

interface UserData {
  stats: {
    avgScore: number;
    categories: { avgScore: number; category: string }[];
    recentHistory: { avgScore: number; date: string }[];
    streak: number;
    totalQuizzes: number;
  };
  user: {
    id: number;
    username: string;
  };
}

const data = ref<null | UserData>(null);
const loading = ref(true);
const quizState = useQuizStore();
const quizFinished = computed(() => quizState.isFinished);

onMounted(async () => {
  try {
    const response = await apiFetch('/user/stats');

    if (!response.ok) {
      throw new Error('Ошибка загрузки данных.');
    }

    data.value = (await response.json()) as UserData;
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    loading.value = false;
  }
});

const categoryStats = computed(() => {
  if (!data.value) return [];
  return [...data.value.stats.categories].sort((a, b) => b.avgScore - a.avgScore);
});

const topThemes = computed(() => categoryStats.value.filter((s) => s.avgScore > 9).slice(0, 5));
const weakThemes = computed(() =>
  [...categoryStats.value]
    .reverse()
    .filter((s) => s.avgScore < 5)
    .slice(0, 5),
);

function getCurrentStreak(dates: string[]): number {
  if (!dates.length) return 0;

  const DAY = 1000 * 60 * 60 * 24;
  const sorted = [...dates].sort();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = new Date(sorted[sorted.length - 1]!);
  const diffFromToday = (today.getTime() - last.getTime()) / DAY;

  if (diffFromToday > 1) return 0;

  let streak = 1;

  for (let i = sorted.length - 1; i > 0; i--) {
    const current = new Date(sorted[i]!);
    const previous = new Date(sorted[i - 1]!);

    if ((current.getTime() - previous.getTime()) / DAY !== 1) break;
    streak++;
  }

  return streak;
}

const streak = computed(() => {
  if (!data.value || data.value.stats.recentHistory.length === 0) return 0;
  const dates = data.value.stats.recentHistory.map((h) => h.date);

  return getCurrentStreak(dates);
});

const chartPoints = computed(() => data.value?.stats.recentHistory || []);

const chartData = computed(() => ({
  datasets: [
    {
      backgroundColor: (context: ScriptableContext<'line'>) => {
        const chart = context.chart;
        const { chartArea, ctx } = chart;
        if (!chartArea) return undefined;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        return gradient;
      },
      borderColor: '#6366f1',
      borderWidth: 3,
      data: chartPoints.value.map((p) => p.avgScore),
      fill: true,
      label: 'Средний балл',
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 8,
      pointRadius: 6,
      tension: 0.4,
    },
  ],
  labels: chartPoints.value.map((p) => p.date),
}));

const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#18181b',
      bodyFont: { family: 'sans-serif', weight: 'bold' },
      callbacks: {
        label: (context: TooltipItem<'line'>) => `Средний балл: ${context.parsed.y ? context.parsed.y.toFixed(1) : 0}`,
      },
      padding: 12,
      titleFont: { family: 'Inter, sans-serif', weight: 'normal' },
    },
  },
  responsive: true,
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        color: '#a1a1aa',
        font: { size: 10 },
      },
    },
    y: {
      beginAtZero: true,
      display: true,
      grid: {
        color: 'rgba(161, 161, 170, 0.1)',
      },
      ticks: {
        color: '#a1a1aa',
        font: { size: 10 },
        stepSize: 2,
      },
    },
  },
} as const;

function getDayWord(n: number) {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 p-6 lg:p-12 dark:bg-zinc-950">
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
    </div>

    <div v-else-if="data" class="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-7xl duration-500">
      <!-- Header -->
      <div class="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 class="bg-linear-to-r from-indigo-600 to-violet-500 bg-clip-text text-4xl font-black text-transparent">
            Дашборд
          </h1>
          <p class="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
            Добро пожаловать назад,
            <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ data.user.username }}</span
            >! Готов к новому вызову?
          </p>
          <RouterLink
            to="/quiz"
            class="mt-4 inline-block rounded-2xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95"
          >
            {{ quizFinished ? 'Начать новый квиз!' : 'Продолжить начатый квиз' }}
          </RouterLink>
        </div>
        <div class="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <span class="text-2xl">🔥</span>
          </div>
          <div>
            <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Текущий стрик</p>
            <p class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{{ streak }} {{ getDayWord(streak) }}</p>
          </div>
        </div>
      </div>

      <!-- Main Cards -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div
          class="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-zinc-900"
        >
          <div class="absolute -top-4 -right-4 text-8xl opacity-10 transition-transform group-hover:scale-110">📝</div>
          <p class="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Пройдено квизов</p>
          <h2 class="mt-2 text-5xl font-black text-zinc-900 dark:text-zinc-100">{{ data.stats.totalQuizzes }}</h2>
        </div>

        <div
          class="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-zinc-900"
        >
          <div class="absolute -top-4 -right-4 text-8xl opacity-10 transition-transform group-hover:scale-110">🎯</div>
          <p class="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Средний балл</p>
          <h2 class="mt-2 text-5xl font-black text-zinc-900 dark:text-zinc-100">{{ data.stats.avgScore }}</h2>
          <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              class="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
              :style="{ width: `${data.stats.avgScore}%` }"
            ></div>
          </div>
        </div>

        <div
          class="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-zinc-900"
        >
          <div class="absolute -top-4 -right-4 text-8xl opacity-10 transition-transform group-hover:scale-110">⚡</div>
          <p class="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Основной фокус</p>
          <h2 class="mt-2 truncate text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {{ categoryStats[0]?.category || 'Пока нет данных' }}
          </h2>
          <p class="mt-4 text-sm text-zinc-500 dark:text-zinc-400">В этом ты разбираешься лучше всего!</p>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="mt-8 rounded-3xl bg-white p-1 shadow-sm dark:bg-zinc-900">
        <div class="p-8">
          <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Визуальный прогресс</h3>
          <p class="text-sm text-zinc-500">Средний балл по дням</p>
        </div>

        <div class="px-8 pb-8">
          <div v-if="chartPoints.length > 1" class="h-62.5 w-full">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          <div v-else class="flex h-32 items-center justify-center text-zinc-400 italic">
            Нужно больше данных, чтобы показать прогресс
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Top Themes -->
        <div class="rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <div class="mb-6 flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl dark:bg-emerald-900/30"
            >
              💎
            </div>
            <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Темы, в которых ты разбираешься</h3>
          </div>
          <div class="space-y-4">
            <div v-if="topThemes.length === 0" class="text-zinc-500 italic">Пока нет тем с баллом больше 9</div>
            <div v-for="theme in topThemes" :key="theme.category" class="flex flex-col gap-2">
              <div class="flex justify-between text-sm font-medium">
                <span class="text-zinc-700 dark:text-zinc-300">{{ theme.category }}</span>
                <span class="text-emerald-500">{{ theme.avgScore.toFixed(1) }}/10</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${theme.avgScore * 10}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weak Themes -->
        <div class="rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-xl dark:bg-rose-900/30">
              ⚠️
            </div>
            <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Темы, на которые стоит обратить внимание</h3>
          </div>
          <div class="space-y-4">
            <div v-if="weakThemes.length === 0" class="text-zinc-500 italic">Отлично, нет тем с баллом ниже 5!</div>
            <div v-for="theme in weakThemes" :key="theme.category" class="flex flex-col gap-2">
              <div class="flex justify-between text-sm font-medium">
                <span class="text-zinc-700 dark:text-zinc-300">{{ theme.category }}</span>
                <span class="text-rose-500">{{ theme.avgScore.toFixed(1) }}/10</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div class="h-full rounded-full bg-rose-500" :style="{ width: `${theme.avgScore * 10}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Breakdown -->
      <div class="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-zinc-900">
        <div class="p-8 pb-0">
          <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Средний балл по всем темам</h3>
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th class="px-8 py-4 text-xs font-bold tracking-wider text-zinc-400 uppercase">Категория</th>
                <th class="px-8 py-4 text-xs font-bold tracking-wider text-zinc-400 uppercase">Статус</th>
                <th class="px-8 py-4 text-right text-xs font-bold tracking-wider text-zinc-400 uppercase">
                  Средний балл
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr
                v-for="theme in categoryStats"
                :key="theme.category"
                class="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
              >
                <td class="px-8 py-5 text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ theme.category }}</td>
                <td class="px-8 py-5">
                  <span
                    v-if="theme.avgScore >= 8"
                    class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  >
                    Эксперт
                  </span>
                  <span
                    v-else-if="theme.avgScore >= 5"
                    class="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                  >
                    Продвинутый
                  </span>
                  <span
                    v-else
                    class="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                  >
                    Начинающий
                  </span>
                </td>
                <td class="px-8 py-5 text-right text-sm font-black text-zinc-900 tabular-nums dark:text-zinc-100">
                  {{ theme.avgScore.toFixed(1) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div class="text-6xl">📭</div>
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Пока нет статистики</h2>
      <p class="max-w-xs text-zinc-500">Пройди первый квиз, чтобы увидеть свой прогресс!</p>
      <RouterLink
        to="/quiz"
        class="mt-4 rounded-2xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95"
      >
        Начать квиз!
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: slide-up 0.6s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
