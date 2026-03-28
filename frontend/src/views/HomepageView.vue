<script setup lang="ts">
import { RouterLink } from 'vue-router';

const yearCurrent = new Date().getFullYear();

const team = [
  { github: 'https://github.com/konfuzz', name: 'Andrei Pushchayenka' },
  { github: 'https://github.com/bariydev', name: 'Yuriy Barinov' },
  { github: 'https://github.com/roguestone', name: 'Ekaterina Golosova' },
];
</script>

<template>
  <div class="min-h-screen scroll-smooth bg-white dark:bg-zinc-950">
    <header class="relative overflow-hidden px-6 py-16 lg:px-12 lg:py-24 xl:px-24">
      <div class="mx-auto flex max-w-7xl flex-col-reverse items-center gap-12 lg:flex-row">
        <div class="flex-1 space-y-8 text-center lg:text-left">
          <h1 class="text-4xl leading-tight font-extrabold tracking-tight text-zinc-900 md:text-6xl dark:text-white">
            Стань профессионалом <br />
            <span class="bg-linear-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent"
              >в технических интервью</span
            >
          </h1>
          <p class="max-w-2xl text-xl text-zinc-600 md:text-2xl dark:text-zinc-400">
            Интерактивная платформа для подготовки к техническим собеседованиям в формате квиза
          </p>
          <div class="flex flex-col justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
            <RouterLink
              to="/login"
              class="rounded-2xl bg-zinc-900 px-8 py-4 text-center font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Начать подготовку
            </RouterLink>
            <a
              href="#features"
              class="rounded-2xl border border-zinc-200 bg-white px-8 py-4 text-center font-bold text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              Узнать больше
            </a>
          </div>
        </div>
        <div class="relative flex flex-1 items-center justify-center">
          <div
            class="absolute h-[120%] w-[120%] rounded-full bg-radial from-emerald-500/15 via-transparent to-transparent blur-3xl"
          ></div>
          <img
            src="/mascot.webp"
            alt="Mascot"
            class="relative z-10 w-full max-w-sm drop-shadow-2xl transition-transform duration-500 hover:scale-105 md:max-w-md"
          />
        </div>
      </div>
    </header>

    <section id="features" class="bg-zinc-50 px-6 py-20 dark:bg-zinc-900/50">
      <div class="mx-auto max-w-7xl">
        <h2 class="font-display mb-16 text-center text-3xl font-bold text-zinc-900 md:text-5xl dark:text-white">
          Разнообразные виджеты для каждого раунда квиза
        </h2>

        <div class="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div
            class="group rounded-3xl border border-zinc-100 bg-white p-8 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl dark:border-zinc-700/50 dark:bg-zinc-800/50"
          >
            <div
              class="mb-6 flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 transition-colors group-hover:bg-zinc-200 dark:border-zinc-700 dark:group-hover:bg-zinc-700"
            >
              <img src="/polls.webp" alt="Виджет Выбор ответа" class="h-full w-full object-contain" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-zinc-800 dark:text-zinc-100">Выбор ответа</h3>
            <p class="text-zinc-600 dark:text-zinc-400">
              Интерактивные вопросы с выбором правильного ответа и пояснениями.
            </p>
          </div>
          <div
            class="group rounded-3xl border border-zinc-100 bg-white p-8 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl dark:border-zinc-700/50 dark:bg-zinc-800/50"
          >
            <div
              class="mb-6 flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 transition-colors group-hover:bg-zinc-200 dark:border-zinc-700 dark:group-hover:bg-zinc-700"
            >
              <img src="/code-analysis.webp" alt="Виджет Анализ кода" class="h-full w-full object-contain" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-zinc-800 dark:text-zinc-100">Анализ кода</h3>
            <p class="text-zinc-600 dark:text-zinc-400">Найдите ошибки в коде в режиме реального времени.</p>
          </div>
          <div
            class="group rounded-3xl border border-zinc-100 bg-white p-8 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl dark:border-zinc-700/50 dark:bg-zinc-800/50"
          >
            <div
              class="mb-6 flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 transition-colors group-hover:bg-zinc-200 dark:border-zinc-700 dark:group-hover:bg-zinc-700"
            >
              <img src="/method-builder.webp" alt="Виджет Конструктор методов" class="h-full w-full object-contain" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-zinc-800 dark:text-zinc-100">Конструктор методов</h3>
            <p class="text-zinc-600 dark:text-zinc-400">
              Оттачивайте знания синтаксиса при помощи drag-and-drop конструктора методов.
            </p>
          </div>
          <div
            class="group rounded-3xl border border-zinc-100 bg-white p-8 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl dark:border-zinc-700/50 dark:bg-zinc-800/50"
          >
            <div
              class="mb-6 flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 transition-colors group-hover:bg-zinc-200 dark:border-zinc-700 dark:group-hover:bg-zinc-700"
            >
              <img src="/ai-reviewer.webp" alt="Виджет AI-интервьюер" class="h-full w-full object-contain" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-zinc-800 dark:text-zinc-100">AI-интервьюер</h3>
            <p class="text-zinc-600 dark:text-zinc-400">
              Отвечайте на вопросы и получайте оценку и фидбэк от AI-интервьюера.
            </p>
          </div>
        </div>

        <div
          class="relative flex flex-col items-center gap-12 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl md:p-12 lg:flex-row dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
          <div class="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"></div>

          <div class="relative z-10 flex-1 space-y-6">
            <h3 class="text-3xl font-bold text-zinc-900 dark:text-white">Дашборд с аналитикой</h3>
            <p class="text-lg text-zinc-600 dark:text-zinc-400">
              Отслеживайте свой прогресс в режиме реального времени. Мы анализируем ваши ответы и даем
              персонализированные рекомендации.
            </p>
            <ul class="space-y-4">
              <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <i class="pi pi-check-circle text-xl text-emerald-500"></i>
                <span>Индивидуальная статистика прогресса</span>
              </li>
              <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <i class="pi pi-check-circle text-xl text-emerald-500"></i>
                <span>Персональные рекомендации</span>
              </li>
            </ul>
          </div>
          <div
            class="relative z-10 flex h-64 w-full flex-1 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 lg:h-80 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <img src="/dashboard.webp" alt="Дашборд приложения InterVue" class="h-full w-full object-contain" />
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-20">
      <div class="mx-auto max-w-4xl text-center">
        <h2 class="mb-8 text-3xl font-bold text-zinc-900 md:text-5xl dark:text-white">Технологии</h2>
        <div
          class="rounded-3xl border border-zinc-200 bg-white/70 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/60"
        >
          <p class="mb-10 text-xl leading-relaxed text-zinc-700 dark:text-zinc-300">
            Этот проект построен на следующем стеке технологий:
          </p>
          <div class="flex flex-wrap justify-center gap-4 opacity-80 md:gap-6">
            <div
              v-for="tech in [
                'Vue 3',
                'Vite',
                'Tailwind CSS',
                'PrimeVue',
                'Pinia',
                'TypeScript',
                'Node.js',
                'SQLite',
                'OpenAI API',
              ]"
              :key="tech"
              class="rounded-full border border-zinc-200 bg-zinc-100 px-6 py-3 text-base font-bold text-zinc-800 md:text-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {{ tech }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-zinc-50 px-6 py-20 dark:bg-zinc-900/50">
      <div class="mx-auto max-w-7xl">
        <h2 class="mb-16 text-center text-3xl font-bold text-zinc-900 md:text-5xl dark:text-white">Команда</h2>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <a
            v-for="member in team"
            :key="member.name"
            :href="member.github"
            target="_blank"
            class="group flex flex-col items-center rounded-3xl border border-zinc-100 bg-white p-8 text-center transition-all hover:shadow-xl dark:border-zinc-700/50 dark:bg-zinc-800/40"
          >
            <div
              class="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-zinc-200 shadow-inner transition-transform duration-300 group-hover:scale-105 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <i class="pi pi-user text-4xl text-zinc-400 dark:text-zinc-500"></i>
            </div>
            <h3 class="mb-1 text-xl font-bold text-zinc-800 dark:text-zinc-100">{{ member.name }}</h3>
            <div
              class="flex items-center gap-2 bg-linear-to-r from-emerald-500 to-blue-500 bg-clip-text font-medium text-transparent"
            >
              <i class="pi pi-github"></i>
              <span>GitHub Profile</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="px-6 py-24 text-center">
      <div
        class="relative mx-auto max-w-4xl overflow-hidden rounded-[3rem] bg-linear-to-r from-emerald-500 to-blue-500 p-12 text-white shadow-2xl md:p-20"
      >
        <div class="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

        <h2 class="relative z-10 mb-8 text-4xl font-black md:text-6xl">Готовы к новому вызову?</h2>
        <p class="relative z-10 mx-auto mb-12 max-w-2xl text-xl text-white/90 md:text-2xl">
          Присоединяйтесь к разработчикам, которые уже оттачивают свои навыки на нашей платформе.
        </p>
        <RouterLink
          to="/login"
          class="relative z-10 inline-block rounded-full bg-white px-10 py-5 text-xl font-bold text-emerald-600 shadow-lg transition-all hover:scale-105 hover:bg-zinc-100 active:scale-95"
        >
          Начать бесплатно
        </RouterLink>
      </div>
    </section>

    <footer class="border-t border-zinc-200 bg-white px-6 py-12 dark:border-zinc-800 dark:bg-zinc-950">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <p class="font-medium text-zinc-500 dark:text-zinc-400">&copy; {{ yearCurrent }} InterVue.</p>

        <div class="flex items-center gap-6">
          <a
            href="https://github.com/konfuzz/rss-tandem"
            target="_blank"
            class="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            aria-label="GitHub Repository"
          >
            <i class="pi pi-github text-2xl"></i>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
