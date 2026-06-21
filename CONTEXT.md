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

Задания 001-003 приняты: установка, иврит, переход на Gemini API key, фиксы живого голоса.
**Голос на иврите работает** (подтверждено пользователем). Сейчас задание 004 (git):
публикация всего проекта в репо пользователя
https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT для развёртывания на другом ПК.
Чужой `app/.git` убран (проект «сплющен»); корневой `.gitignore` защищает `.env`/ключ; есть `DEPLOY.md`.

### Грабли проекта (для памяти)
- Windows-консоль cp1252: эмодзи в `print()` апстрима роняли сессию. Фикс — `sys.stdout.reconfigure(utf-8)`.
- developer-API НЕ принимает поле `proactivity` в setup для этой модели (Vertex принимал) -> не слать.
