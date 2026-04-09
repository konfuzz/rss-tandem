<div align="center">

# 🧩 InterVue

**Интерактивная платформа для подготовки к техническим собеседованиям в формате квиза.**

[![Deploy Link](https://img.shields.io/badge/Live_Demo-🚀-blueviolet?style=for-the-badge)](https://intervue.makesimple.website/)

---

</div>

## 🌟 О проекте

**InterVue** — это не просто квиз, а комплексный тренажер для разработчиков. Мы объединили классическое тестирование с современными AI-технологиями и интерактивными механиками, чтобы сделать процесс подготовки эффективным и эффектным.

### ✨ Ключевые возможности

Квиз с интерактивными виджетами:

* **🤖 AI-интервьюер** — отвечайте на открытые вопросы и получайте мгновенный фидбэк и оценку от нейросети.
* **🏗️ Конструктор методов** — оттачивайте знание синтаксиса с помощью интуитивного **drag-and-drop** интерфейса.
* **🔍 Анализ кода** — практические задачи по поиску ошибок.
* **✅ Выбор ответов** — классические вопросы с одиночным или множественным выбором.

А также:
* **📊 Дашборд с аналитикой** для отслеживания прогресса.
* **🏆 Лидерборд** для оценки своих результатов в сравнении с другими участниками.


![](frontend/public/dashboard.webp)

---

## 🛠 Технологический стек

<p align="left">
  <img src="https://img.shields.io/badge/Vue%203-%2342b883.svg?style=flat&logo=vuedotjs&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Pinia-%23ffe066.svg?style=flat&logo=pinia&logoColor=black" alt="Pinia">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/SQLite-07405E?style=flat&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/OpenAI_API-412991?style=flat&logo=openai&logoColor=white" alt="OpenAI">
</p>

* **Frontend:** Vue 3 (Composition API), PrimeVue (UI компоненты).
* **Backend:** Node.js с интеграцией OpenAI API для анализа ответов, SQLite для хранения данных.
* **State Management:** Pinia.

---

## 🚀 Локальный запуск

Для запуска проекта локально выполните следующие шаги:

### 1. Клонирование репозитория
```bash
git clone https://github.com/konfuzz/rss-tandem.git
cd rss-tandem
```

### 2. Настройка Backend
1. Перейдите в директорию `backend`:
   ```bash
   cd backend
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Создайте файл `.env` на основе примера (`.env.example`)

4. В файле `.env` укажите:
   - `JWT_SECRET` — секретный ключ для авторизации (любая строка).
   - `OPENROUTER_API_KEY` — API-ключ OpenRouter. **Если ключ не указан, AI-интервьюер будет работать в демо-режиме с заглушкой.**
5. Сгенерируйте миграции, примените их и наполните базу данных:
   ```bash
   npm run db:generate
   npm run db:up
   ```
6. Запустите сервер:
   ```bash
   npm run dev
   ```

### 3. Настройка Frontend
1. В новом терминале перейдите в директорию `frontend`:
   ```bash
   cd frontend
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Запустите клиентское приложение:
   ```bash
   npm run dev
   ```
   Приложение будет доступно по адресу [http://localhost:5173](http://localhost:5173).

---
## 💪 Чем гордимся

**Ключевые достижения:**

Результативность в сжатые сроки: За короткий цикл разработки реализовано полнофункциональное масштабируемое приложение.

Адаптивность и антихрупкость: Когда на критическом этапе (4-я неделя) команда сократилась на треть, мы успешно перераспределили нагрузку и завершили проект вдвоем, не потеряв в качестве.

Быстрое освоение стека: Весь проект реализован на базе новых для команды инструментов, что подтверждает нашу способность к быстрому обучению и внедрению технологий «с колес».

**Сильные стороны:**

Высокий уровень личной ответственности и вовлеченности.

Умение эффективно действовать и принимать решения в условиях неопределенности и дефицита ресурсов.

Навык доведения сложных продуктов до финального релиза в строгом соответствии с дедлайнами.

---

## 👥 Команда проекта

| Разработчик | Роль | GitHub | Diary
| :--- | :--- | :--- | :--- |
| **Andrei Pushchayenka** | Fullstack Developer, Team Lead | [@konfuzz](https://github.com/konfuzz) | [Link](https://github.com/konfuzz/rss-tandem/tree/main/development-notes/konfuzz) |
| **Yuriy Barinov** | Fontend Developer | [@bariydev](https://github.com/bariydev) | [Link](https://github.com/konfuzz/rss-tandem/tree/main/development-notes/bariydev) |
| **Ekaterina Golosova** | Frontend Developer | [@roguestone](https://github.com/roguestone) | [Link](https://github.com/konfuzz/rss-tandem/tree/main/development-notes/roguestone) |

---

## 📂 Документация и отчеты

### 📝 Meeting Notes
* 📅 [26 февраля 2026](/meeting-notes/meeting-2026-02-26.md)
* 📅 [06 марта 2026](/meeting-notes/meeting-2026-03-06.md)
* 📅 [27 марта 2026](/meeting-notes/meeting-2026-03-27.md)

### 📺 Видеопрезентации
* 🎥 [Демонстрация работы приложения, Week 7 Checkpoint](https://www.youtube.com/watch?v=cR69Lja8EEs)
* 🎥 [Week 5 Checkpoint Video](https://link.storjshare.io/raw/jvfvlz4gh3e3mec62us7qxmepn5a/screenshots/chrome_2026-03-22_19-51-41.mp4)

### 📄 Kanban Board
[Link](https://github.com/users/konfuzz/projects/2/views/1)
![](https://link.storjshare.io/raw/jvfvlz4gh3e3mec62us7qxmepn5a/screenshots/firefox_2026-04-06_22-25-53.jpg)

### 📄 Лучшие PR
[PR 1](https://github.com/konfuzz/rss-tandem/pull/23) | [PR 2](https://github.com/konfuzz/rss-tandem/pull/47) | [PR 3](https://github.com/konfuzz/rss-tandem/pull/46) | [PR 4](https://github.com/konfuzz/rss-tandem/pull/39) | 

---

<div align="center">
  <sub>Built with ❤️ by InterVue Team during RS School course.</sub>
</div>