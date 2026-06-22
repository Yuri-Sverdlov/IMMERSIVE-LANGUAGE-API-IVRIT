# CONTEXT.md — память проекта

> Краткая, медленно меняющаяся память проекта. Суть, стек, роли, текущий фокус.
> Обновляет архитектор. Подробная история — в `PROJECT_LOG.md`.

## Проект

- **Название:** IMMERSIVE-LANGUAGE-API
- **Путь:** `G:\Projects_Life_planning\IVRIT\IMMERSIVE-ROLE-PLAYING-DIALOGUES`
- **Суть:** Иммерсивное изучение языка через голосовой роле-плей с ИИ (Google Gemini Live API).
  Берём готовый репозиторий [ZackAkil/immersive-language-learning-with-live-api](https://github.com/ZackAkil/immersive-language-learning-with-live-api)
  (приложение "Immergo") и настраиваем под наш кейс.
- **Наш кейс:** родной язык — **русский**, язык изучения — **иврит**.
- **Раскладка:** код приложения — в подпапке `app/` (клон репо). Оркестрация
  (AGENTS/CONTEXT/PROJECT_LOG/tasks/DEV-NOTES) — в корне проекта.
- **Облако (опционально):** Cloud Run в GCP-проекте `immergo-hebrew` (сервис `immergo`,
  регион `us-central1`). URL: https://immergo-581555965916.us-central1.run.app
  Развёртывание и управление — см. `ОБЛАКО-Immergo-инструкция.md`.

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
  дефолты: "I speak" (from) и "I want to learn" (to). Иврит и русский уже в списке и установлены как дефолты.
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

Задания 001-006 приняты и в архиве. Система работает: иврит/русский, `start-immergo.bat`,
голос, `[TOKENS]` в логе backend. Репозиторий: https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT
(main, коммит `1df6231`). **Активного задания для кодера нет** — см. план ниже.

Запуск: двойной клик `start-immergo.bat` или `DEPLOY.md`.

---

## План следующей сессии (задание 007 — для архитектора + кодера)

> Запрос пользователя 2026-06-21. На старте сессии архитектор превращает это в `tasks/TASK.md`.

### 1. Единый config-файл настроек пользователя

**Цель:** менять языки и параметры сессии **без правки JS-кода**.

Сейчас разбросано:
- языки — `view-missions.js` + `localStorage` + fallback в `view-chat.js`;
- длительность сессии — `SESSION_TIME_LIMIT` в `app/.env` (420 = 7 мин);
- пауза тишины (VAD) — `silence_duration_ms: 2000` в `view-chat.js` (setup Gemini).

**Предложение архитектора (уточнить на старте):**
- Файл **`app/immergo.config.json`** (или `app/config/user.json`) — коммитится в репо с дефолтами
  для этого проекта; секреты (`GEMINI_API_KEY`) остаются только в `.env`.
- Поля (пример):
  ```json
  {
    "native_language": "Russian",
    "target_language": "Hebrew",
    "session_time_limit_seconds": 420,
    "silence_duration_ms": 2000
  }
  ```
- Пример смены кейса пользователем: родной **русский**, изучаю **английский** — достаточно поменять
  `target_language` / `native_language` (и соответствующие метки в UI, если нужны флаги).
- Backend читает `session_time_limit_seconds` (вместо или поверх `.env`).
- Frontend читает языки + `silence_duration_ms` при старте миссии (API-эндпоинт `/api/config` или
  статический import JSON).
- **Важно:** `.env` и config — только **ASCII** в комментариях (грабля cp1252, DEV-NOTES п.7.4).

### 2. Настраиваемая длительность сессии

- Сейчас: 7 мин (`SESSION_TIME_LIMIT=420` в `.env`).
- Следующая сессия: вынести в config (п.1), `.env.example` документировать fallback.
- UI (опционально, если успеем): показывать оставшееся время — не обязательно в 007.

### 3. Настраиваемое время тишины (VAD)

- Сейчас: 2 секунды — пользователю **достаточно**, но хочет возможность увеличить/уменьшить.
- Следующая сессия: значение из config -> `realtime_input_config.automatic_activity_detection.silence_duration_ms`
  в setup, который уходит в Gemini Live.

### 4. Шаблон и инструкция для новых квестов

**Цель:** пользователь сам добавляет сценарии «по желанию» (напр. «учу внука играть в шашки»).

**Предложение (два файла):**
| Файл | Назначение |
|---|---|
| `app/src/data/mission.template.json` | **Шаблон одной миссии** — скопировать, вставить в `missions.json`, заполнить поля |
| `docs/HOW-TO-ADD-QUEST.md` | **Инструкция**: что значит каждое поле, пример «шашки с внуком», как перезапустить/обновить страницу |

Поля миссии (как сейчас в `missions.json`): `id`, `title`, `difficulty`, `desc`, `target_role`.
Difficulty сейчас **косметическая** (не влияет на ИИ) — указать в инструкции честно.

### 5. Quick Start для новичка

**Файл:** **`QUICK_START.md`** в корне проекта (рядом с `DEPLOY.md`). **Сделано** (2026-06-21).

~~**Содержание (черновик оглавления):~~ см. файл.

`DEPLOY.md` — для **технического** развёртывания; `QUICK_START.md` — для **пользователя**, без лишней DevOps-лексики.

### Порядок работ в следующей сессии (рекомендация архитектора)

1. Спроектировать `immergo.config.json` + чтение backend/frontend.
2. Подключить session limit и silence из config.
3. Добавить mission.template.json + HOW-TO-ADD-QUEST.md.
4. Написать QUICKSTART.md.
5. Проверка + git-задание (коммит/push).

### Грабли проекта (для памяти)
- Windows-консоль cp1252: эмодзи в `print()` апстрима роняли сессию. Фикс — `sys.stdout.reconfigure(utf-8)`.
- developer-API НЕ принимает поле `proactivity` в setup для этой модели (Vertex принимал) -> не слать.
