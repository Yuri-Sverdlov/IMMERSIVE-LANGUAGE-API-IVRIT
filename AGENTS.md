# AGENTS.md — устав кодера (терминальный агент)

> Правила для агента-кодера, работающего в терминале (дешёвая модель, напр. Claude Code CLI).
> Меняется редко. «Правда о состоянии» живёт в `tasks/REPORT.md` и `PROJECT_LOG.md`.

## Роли

- **Архитектор** (чат) — проектирует, пишет `tasks/TASK.md`, проверяет результат, ведёт `PROJECT_LOG.md`. Код почти не пишет.
- **Кодер** (терминал, ты) — пишешь код, тестируешь, заполняешь `tasks/REPORT.md`. НЕ проектируешь и НЕ меняешь устав.

## Старт сессии

Каждую новую сессию начинай так:

1. Прочитай `CONTEXT.md` — суть проекта, стек, текущий фокус.
2. Прочитай этот файл `AGENTS.md` — правила.
3. Прочитай `tasks/TASK.md` — текущее активное задание.
4. Выполни задание, тестируй, заполни `tasks/REPORT.md`.

## Правила

- Выполняй **только** то, что описано в `tasks/TASK.md`. Не расширяй scope без задания.
- Все исходные файлы — **UTF-8**.
- **Консольный вывод (`print`) — только ASCII** (`->`, `<=`, `'`). Консоль на этом ПК — cp1252,
  кириллица и спецсимволы (`→`, `≤`, фигурные кавычки) дают `UnicodeEncodeError`.
  Сами файлы при этом всегда UTF-8 — там Unicode корректен. См. DEV-NOTES.md, п.4.
- Кириллические **имена файлов** в командах ломаются в cp1252 (`???`). Находи файлы по ASCII-признаку,
  передавай объект `FileInfo.FullName`. См. DEV-NOTES.md, п.6.
- После работы заполняй `tasks/REPORT.md` честно: что сделано, что не сделано, как проверено.

## Запреты

- **НЕ коммитить и НЕ пушить** без явного git-задания в `tasks/TASK.md`. Это единственное исключение.
- НЕ редактировать `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md` без задания.
- НЕ создавать параллельные STATUS/NOTES/NEXT — состояние только в `REPORT.md` и `PROJECT_LOG.md`.
- НЕ удалять и НЕ переписывать `tasks/done/` (архив принятых заданий).

## Git (только по заданию)

- Remote по HTTPS -> Personal Access Token (Windows Credential Manager). SSH-ключ только для `git@github.com:...`.
- Коммит/push выполняет кодер на реальной ФС Windows. Архитектор проверяет через `git ls-remote origin refs/heads/main`.

## Запуск / тесты (приложение в `app/`, Windows + PowerShell)

Bash-скрипты репо (`scripts/install.sh`, `scripts/dev.sh`) под Windows напрямую не идут —
выполняем эквивалент вручную из `app/`:

- **Установка фронта:** `npm install`
- **Backend venv:** `python -m venv venv` -> `.\venv\Scripts\Activate.ps1` -> `pip install -r requirements.txt`
- **Конфиг (режим Gemini API key, НЕ Vertex):** в `.env` задать `GEMINI_API_KEY=...`,
  `MODEL=gemini-3.1-flash-live-preview`, `DEV_MODE=true`. GCP/gcloud НЕ нужны.
- **Запуск backend (порт 8000):** `python -m uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload`
- **Запуск frontend (Vite, ~5173):** `npm run dev`
- **Ключ:** `GEMINI_API_KEY` из Google AI Studio (aistudio.google.com). Не печатать в консоль, не коммитить.
- Тестов в репо нет; проверка — сборка `npm run build` и ручной прогон в браузере.
