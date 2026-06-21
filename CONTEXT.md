# CONTEXT.md — память проекта

> Краткая, медленно меняющаяся память проекта. Суть, стек, роли, текущий фокус.
> Обновляет архитектор. Подробная история — в `PROJECT_LOG.md`.

## Проект

- **Название:** IMMERSIVE-LANGUAGE-API
- **Путь:** `G:\___Planning_Life_Sphere\IVRIT\IMMERSIVE-LANGUAGE-API`
- **Суть:** Иммерсивное изучение языка через голосовой роле-плей с ИИ (Google Gemini Live API).
  Берём готовый репозиторий [ZackAkil/immersive-language-learning-with-live-api](https://github.com/ZackAkil/immersive-language-learning-with-live-api)
  (приложение "Immergo") и настраиваем под наш кейс.
- **Наш кейс:** родной язык — **русский**, язык изучения — **иврит**.
- **Раскладка:** код приложения — в подпапке `app/` (клон репо). Оркестрация
  (AGENTS/CONTEXT/PROJECT_LOG/tasks/DEV-NOTES) — в корне проекта.

## Стек (из апстрим-репо)

- **Frontend:** Vanilla JS, Vite, Web Components, Web Audio API, WebSocket.
- **Backend:** Python, FastAPI, Uvicorn, `google-genai` SDK.
- **ИИ:** Google Gemini Live API. **Наш режим — Gemini Developer API по ключу** (НЕ Vertex):
  `genai.Client(api_key=...)`, модель `gemini-3.1-flash-live-preview`.
  (Апстрим по умолчанию на Vertex с `gemini-live-2.5-flash-native-audio` — мы это переключаем, задание 002.)
- **Внешний сервис (обязателен для запуска):** ключ `GEMINI_API_KEY` из Google AI Studio
  (aistudio.google.com). GCP-проект / gcloud / Vertex НЕ нужны.
- Опционально (прод): Redis (rate-limit), reCAPTCHA, BigQuery. Локально не нужны (`DEV_MODE=true`).

## Где настраивается язык (ключевое)

- `app/src/components/view-missions.js` — жёстко заданный список языков (`options`) и
  дефолты: "I speak" (from) и "I want to learn" (to). **Иврита в списке нет — добавляем.**
- Значение языка = текст выбранной опции; оно прокидывается в системный промпт Gemini.
- Системный промпт собирается на фронте (`app/src/components/view-chat.js`),
  бэкенд (`server/gemini_live.py`) его только передаёт в Live API.

## Роли

- **Архитектор** (чат): проектирование, задания, проверка, журнал.
- **Кодер** (терминал): реализация, тесты, отчёт.

## Окружение (см. DEV-NOTES.md)

- Консоль Windows — cp1252: `print` только ASCII, файлы UTF-8.
- FFmpeg установлен глобально (`C:\FFMpeg`, в User PATH).
- pandoc установлен (Markdown -> .docx).
- Git: коммит/push делает кодер по заданию; HTTPS-remote требует PAT.

## Текущий фокус

Задания 001-005 приняты: установка, иврит, Gemini API key, фиксы голоса, публикация в GitHub,
лимит сессии 7 мин (`SESSION_TIME_LIMIT=420`), логирование токенов (`[TOKENS] ...` в консоли бэкенда).
**Голос на иврите работает.** Репозиторий https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT
(main, коммит 338a6de), ключ не утёк. **Активных заданий нет.**

Запуск пользователем в своём терминале (для просмотра логов/токенов): см. команды в `DEPLOY.md`/`AGENTS.md`.
Возможные следующие темы: кастомные квесты, регулятор уровня иврита, доступ с телефона по локальной сети.

### Грабли проекта (для памяти)
- Windows-консоль cp1252: эмодзи в `print()` апстрима роняли сессию. Фикс — `sys.stdout.reconfigure(utf-8)`.
- developer-API НЕ принимает поле `proactivity` в setup для этой модели (Vertex принимал) -> не слать.
