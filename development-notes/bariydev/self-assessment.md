# Self-assessment — Yuriy Barinov ([@bariydev](https://github.com/bariydev))

**PR:** [Link](https://github.com/konfuzz/rss-tandem/pull/63)

**Репозиторий:** [konfuzz/rss-tandem](https://github.com/konfuzz/rss-tandem)

## 1. Таблица фич

| Фича | Реализация | PR | Баллы |
| - | - | - | - |
| **Complex Component** (+25 × 5) | **Poll + Multiple choice** — одна линейка похожих виджетов выбора (один / несколько вариантов); **Code analysis**; **Method Builder**; **Экран итогов (Summary)**; **Widget wrapper** | [#39](https://github.com/konfuzz/rss-tandem/pull/39) (виджеты), [#33](https://github.com/konfuzz/rss-tandem/pull/33) (Method Builder), [#46](https://github.com/konfuzz/rss-tandem/pull/46) (summary), [#55](https://github.com/konfuzz/rss-tandem/pull/55) (Widget wrapper) | **125** |
| **Rich UI Screen** (+20) | Лидерборд | [#53](https://github.com/konfuzz/rss-tandem/pull/53) | **20** |
| **Drag & Drop** (+10) | Перетаскивание и сборка метода в Method Builder | [#33](https://github.com/konfuzz/rss-tandem/pull/33) | **10** |
| **Leaderboard** (+5) | Таблица лидеров | [#53](https://github.com/konfuzz/rss-tandem/pull/53) | **5** |
| **Responsive** (+5) | - | - | **5** |
| **Theme Switcher** (+10) | Светлая/тёмная тема | [#43](https://github.com/konfuzz/rss-tandem/pull/43) | **10** |
| **Vue** (+5) | Vue 3 в перечисленных компонентах | - | **5** |
| **State Manager** (+10) | Pinia (`useQuizStore` и др.) в виджетах и итогах | - | **10** |

**Сумма:** 125 + 20 + 10 + 5 + 5 + 10 + 5 + 10 = **190**  

## 2. Описание работы

В проекте **InterVue** я выполнил первоначальную настройку фронтенд-директории и отвечал за CI. Реализовал виджеты квиза: **Poll** и **Multiple choice** (выбор одного и нескольких вариантов), **Code analysis** (выбор строк кода), **Method Builder** (конструктор методов, drag-and-drop и клик по слотам). Реализовал **экран итогов** после квиза: `QuizSummaryCard.vue`. Сверстал и подключил **лидерборд** `LeaderboardView.vue` к эндпоинту. Добавил **переключение темы** `ThemeToggle.vue` и `useTheme.ts` под PrimeVue (`p-dark`). Доработал widget wrapper. Участвовал в наполнении и правках банка вопросов.

## 3. Два личных Feature Component

### 1. `LeaderboardView.vue` — Таблица лидеров

**Задача:** отобразить рейтинг пользователей по трём метрикам: стрик, завершённые квизы, средний балл.

**Реализация:**
- Загрузка данных с бекенда
- Три вкладки для переключения между метриками
- Таблица с сортировкой по рангу, подсветка строки текущего пользователя
- Мотивационный текст для пользователей вне топ-10 с персонализированным текстом под каждую метрику

---

### 2. `QuizSummaryCard.vue` — Экран итогов квиза

**Задача:** показать пользователю статистику пройденной попытки после завершения квиза.

**Реализация:**
- Отображение баллов
- Прогресс-бар с цветовой индикацией: красный (<40%), жёлтый (<70%), зелёный (≥70%)
- Теги по категориям со средним баллом
- Три карточки метрик: баллы, идеальные ответы, количество тем
- Кнопки «Новый квиз» (рестарт) и «Завершить» (переход на dashboard)
