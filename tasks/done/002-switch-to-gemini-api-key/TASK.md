# TASK — активное задание (архитектор -> кодер)

> Ровно ОДНО активное задание. После приёмки архивируется в `tasks/done/`.
> Кодер выполняет только то, что здесь описано. Заполняй `tasks/REPORT.md` по ходу.

## Заголовок (задание 002)

Перевести бэкенд Immergo с Vertex AI на Gemini Developer API (аутентификация по API-ключу) и запустить локально.

## Контекст и зачем

Пользователь не использует Google Cloud / Vertex AI. Переходим на **Gemini API key** из Google AI Studio.
`google-genai` SDK поддерживает оба режима: `genai.Client(vertexai=True, project=..., location=...)`
и `genai.Client(api_key=...)`. Нам нужен второй. Имя live-модели для developer-API —
`gemini-3.1-flash-live-preview` (зашитая в репо `gemini-live-2.5-flash-native-audio` — Vertex-имя, устарела).

Среда — Windows + PowerShell, консоль cp1252 (в `print`/echo только ASCII; файлы — UTF-8).
gcloud НЕ нужен и НЕ ставится. Работаем из `app/`.

## ВАЖНО: блокер и порядок

- Этапы 1–3 (правки кода/конфига) делаются **сразу**, ключ для них не требуется.
- Этап 4 (живой запуск) требует **GEMINI_API_KEY** (его даёт пользователь). Нет ключа -> дойти до этапа 4,
  остановиться, пометить в REPORT «заблокировано: нужен GEMINI_API_KEY», ключи НЕ выдумывать.
- Git: свои коммиты/push НЕ делать.

## Что сделать (по этапам)

### Этап 1. Бэкенд: поддержать режим API-ключа — `app/server/gemini_live.py`
В `GeminiLive.__init__` сейчас жёстко:
`self.client = genai.Client(vertexai=True, project=project_id, location=location)`
1. Добавить в `__init__` необязательный параметр `api_key: Optional[str] = None`.
2. Сделать ветвление (обратно совместимо, Vertex-путь не ломаем):
   ```python
   if api_key:
       self.client = genai.Client(api_key=api_key)
   else:
       self.client = genai.Client(vertexai=True, project=project_id, location=location)
   ```
3. В диагностическом `print(...)` (если печатается в консоль) — только ASCII; ключ НЕ печатать.

### Этап 2. Бэкенд: прокинуть ключ и модель — `app/server/main.py`
1. Рядом с чтением env (там, где `MODEL = os.getenv(...)`, ~стр.54-64) добавить:
   `GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")`
2. Сменить дефолт модели на developer-API live-модель:
   `MODEL = os.getenv("MODEL", "gemini-3.1-flash-live-preview")`
3. В месте создания `GeminiLive(...)` (~стр.254) добавить аргумент `api_key=GEMINI_API_KEY`.
4. Если `get_project_id()`/`google.auth` мешают в API-режиме — НЕ удалять, просто убедиться,
   что при заданном `GEMINI_API_KEY` код не падает без ADC (project_id остаётся, но клиент его не использует).

### Этап 3. Конфиг + косметика
1. В `app/.env` заменить блок на developer-режим:
   ```
   GEMINI_API_KEY=<вставит пользователь>
   MODEL=gemini-3.1-flash-live-preview
   DEV_MODE=true
   ```
   (строки `PROJECT_ID`/`LOCATION` можно оставить — в API-режиме не используются.)
2. Косметика из задания 001: в `app/src/components/view-missions.js` переименовать переменные
   `frenchOption` -> `hebrewOption`, `englishOption` -> `russianOption` (логику не менять).
3. Проверить сборку фронта: `npm run build` — должна остаться зелёной.

### Этап 4. Запуск (требует GEMINI_API_KEY — см. блокер)
1. Вписать реальный ключ в `app/.env` (`GEMINI_API_KEY=...`).
2. Backend: `.\venv\Scripts\Activate.ps1` затем `python -m uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload`.
3. Frontend (отдельный терминал): `npm run dev`, открыть `http://localhost:5173`.
4. Проверить: дефолты в UI — "I speak" = Russian, "I want to learn" = Hebrew; иврит есть в обоих списках.
5. Начать любую миссию, проверить что ИИ отвечает голосом на иврите. Если ошибка модели/квоты —
   зафиксировать точный текст в REPORT (возможна замена имени модели или требование billing на ключе).

## Критерии приёмки (Definition of Done)

- [ ] `gemini_live.py`: `__init__` принимает `api_key` и при его наличии создаёт `genai.Client(api_key=...)`.
- [ ] `main.py`: читается `GEMINI_API_KEY`, дефолт `MODEL=gemini-3.1-flash-live-preview`, ключ прокинут в `GeminiLive`.
- [ ] `.env` переведён на developer-режим (есть `GEMINI_API_KEY`, `MODEL`, `DEV_MODE=true`).
- [ ] Переменные в `view-missions.js` переименованы (Hebrew/Russian), `npm run build` зелёный.
- [ ] Этап 4 либо выполнен (приложение поднялось, ИИ говорит на иврите), либо честно помечен
      «заблокировано: нет GEMINI_API_KEY» / задокументирована ошибка модели/квоты.

## Ограничения

- Не выходить за scope. Не трогать Vertex-логику кроме добавления ветки. Не делать RTL-верстку, не менять миссии.
- Консольный вывод — ASCII; файлы — UTF-8. Ключ НЕ печатать в консоль и НЕ коммитить.
- Git: коммиты/push НЕЛЬЗЯ.

## Как проверить

- Грепом подтвердить: `api_key` в `gemini_live.py`, `GEMINI_API_KEY` и новая `MODEL` в `main.py`.
- `npm run build` зелёный.
- Если есть ключ — реальный диалог на иврите в браузере (скрин/описание в REPORT).
