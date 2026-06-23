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

**Фаза 1 слияния завершена** (2026-06-22, коммит `12bc273` на main).

- Локально: иврит/русский, `start-immergo.bat`, `GEMINI_API_KEY`, `[TOKENS]`
- Облако: инструкции в корне (`КАК-ПОЛЬЗОВАТЬСЯ...`, `ОБЛАКО-Immergo...`)
- GitHub: https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT

**Локальный запуск на ПК2:** подтверждён пользователем (2026-06-22) — RU/HE, голос, `[TOKENS]`.

**TASK-007 принят** (2026-06-22, commit `f60c7df`): `app/immergo.config.json`, `GET /api/config`,
языки/VAD/session limit из config.

**TASK-008 принят** (2026-06-23): `speech_playback_rate` 0,7–1,5 — код на диске, **commit pending** (TASK-008-GIT).

**Активное задание:** TASK-008-GIT (commit/push) + TASK-009 (mission.template + HOW-TO-ADD-QUEST) — см. `tasks/TASK.md`.

Запуск: `start-immergo.bat` или `DEPLOY.md` / `QUICK_START.md`.

---

## ~~План TASK-008~~ — **сделано (2026-06-23)**

> Запрос пользователя 2026-06-22: **скорость ответа ИИ в диапазоне 0,7 … 1,5**
> (1,0 = как сейчас; меньше — медленнее, больше — быстрее).
> Реализовано: `speech_playback_rate` в `immergo.config.json`, clamp на backend,
> resample в `playback.worklet.js`. Архив: `tasks/done/008-speech-playback-rate/`.

### Что пользователь имеет в виду

Речь о **темпе озвучки ответа модели**, а не о том, как быстро ИИ «начинает говорить» после паузы.
Последнее уже настраивается через `silence_duration_ms` (VAD) в `immergo.config.json`.

### Что проверили в коде и API

| Механизм | Где | Вывод |
|----------|-----|-------|
| Gemini Live `SpeechConfig` | `geminilive.js` → setup | Есть только `voice_name` (сейчас `"Puck"`) и язык. **Поля `speaking_rate` / скорости речи в Live API нет.** |
| `silence_duration_ms` | config → `automaticActivityDetection` | Это **пауза до ответа** (VAD), не скорость речи. Не путать с TASK-008. |
| Воспроизведение PCM | `mediaUtils.js` → `AudioPlayer`, worklet `playback.worklet.js` | Аудио 24 kHz PCM16 → Float32, **без ускорения/замедления**. Есть только `setVolume()`. |

### Решение архитектора (зафиксировано для TASK-008)

1. **Не через Gemini API** — параметра скорости речи в setup нет; менять промпт («говори медленнее») ненадёжно.
2. **На клиенте при воспроизведении** — добавить в `immergo.config.json`:
   ```json
   "speech_playback_rate": 1.0
   ```
   Допустимый диапазон: **0,7 … 1,5** (clamp в коде).
3. **Реализация (черновик):** читать rate из `/api/config`; в `AudioPlayer` или playback worklet
   воспроизводить буфер быстрее/медленнее (resample / изменение effective sample rate / очередь с другим темпом).
   Точный способ — на усмотрение кодера; главное — без артефактов и без изменения pitch (желательно).
4. **Backend:** прокинуть поле в `GET /api/config` и дефолт в `load_immergo_config()`.
5. **Документация:** строка в `QUICK_START.md` (таблица «Ограничения»).

### Вне scope TASK-008

- Смена голоса (`Puck` → другой) — отдельно, если понадобится.
- Скорость **распознавания** пользователя — не настраивается.

---

## План следующих сессий (008+)

### 1. ~~Единый config-файл~~ — **сделано (007)**

`app/immergo.config.json` + `/api/config`. Языки, 7 мин, VAD.

### 2. ~~Скорость воспроизведения~~ — **сделано (008)**

### 3. Шаблон и инструкция для новых квестов — **TASK-009**

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

### Порядок работ (рекомендация архитектора)

1. ~~immergo.config.json~~ (007).
2. speech_playback_rate 0,7–1,5 (008).
3. mission.template.json + HOW-TO-ADD-QUEST.md (009).
4. ~~QUICK_START.md~~ (готов).
5. Redeploy Cloud Run с config в образе (фаза 2).

### Грабли проекта (для памяти)
- Windows-консоль cp1252: эмодзи в `print()` апстрима роняли сессию. Фикс — `sys.stdout.reconfigure(utf-8)`.
- developer-API НЕ принимает поле `proactivity` в setup для этой модели (Vertex принимал) -> не слать.
