# TASK — активное задание (архитектор -> кодер)

> Ровно ОДНО активное задание. После приёмки архивируется в `tasks/done/`.
> Кодер выполняет только то, что здесь описано. Заполняй `tasks/REPORT.md` по ходу.

## Заголовок

Установить Immergo (immersive-language-learning-with-live-api) в `app/` и настроить на иврит (родной — русский).

## Контекст

Апстрим: https://github.com/ZackAkil/immersive-language-learning-with-live-api
Цель: локальный запуск приложения, где по умолчанию **учим иврит**, **родной язык — русский**.
Стек и места правок описаны в `CONTEXT.md`. Команды запуска — в `AGENTS.md`.
Среда — Windows + PowerShell, консоль cp1252 (в `print`/echo только ASCII; файлы — UTF-8).

## ВАЖНО: блокер и порядок

- Этапы 1–4 (клон, установка, правка языков, сборка) выполняются **сразу**, они не требуют интернет-кредов.
- Этап 5 (живой запуск с Gemini) требует **Google Cloud**: проект с включённым Vertex AI и
  `gcloud auth application-default login`. Если кредов/проекта нет — **дойди до этапа 5, остановись,
  опиши это в REPORT** как «заблокировано: нужен GCP PROJECT_ID + ADC», и НЕ выдумывай ключи.
- Git: только клон апстрима в `app/`. **Свои коммиты/push НЕ делать** (нет git-задания).

## Что сделать (по этапам)

### Этап 1. Клонировать репозиторий в `app/`
1. Из корня проекта: `git clone https://github.com/ZackAkil/immersive-language-learning-with-live-api.git app`
2. Проверить, что появилась папка `app/` с `package.json`, `requirements.txt`, `server/`, `src/`.

### Этап 2. Установить зависимости (всё из `app/`)
1. `npm install`
2. `python -m venv venv`
3. `.\venv\Scripts\Activate.ps1`
4. `pip install -r requirements.txt`
   - Если какой-то пакет не ставится на Windows — зафиксируй точную ошибку в REPORT, не подменяй версии молча.

### Этап 3. Добавить иврит и выставить дефолты — файл `app/src/components/view-missions.js`
В этом файле есть общий список языков в переменной `options` (строка с `<option>`-элементами,
сейчас содержит `🇷🇺 Russian`, но НЕ содержит иврит) и блок дефолтов в `connectedCallback`.

1. **Добавить иврит** в список `options` (рядом с остальными), пунктом:
   `🇮🇱 Hebrew`
   (используем английское имя "Hebrew" — оно уходит в системный промпт Gemini; флаг — для UI).
2. **Дефолт изучаемого языка** (to-lang): сейчас при отсутствии сохранённого значения выбирается French
   (`options.find(o => o.text.includes('French'))`). Заменить поиск на `'Hebrew'`, чтобы по умолчанию стоял иврит.
3. **Дефолт родного языка** (from-lang): сейчас English (`...includes('English')`). Заменить на `'Russian'`.
4. Не трогать остальную логику (режимы Teacher/Immersive, localStorage-ключи).

> Примечание про RTL/старый localStorage: на этом этапе НЕ занимаемся версткой RTL и не чистим localStorage —
> это возможные будущие задачи. Сейчас только список + дефолты.

### Этап 4. Проверить сборку фронта
1. Из `app/`: `npm run build`
2. Сборка должна пройти без ошибок. Вывод (хвост) приложить в REPORT.

### Этап 5. Конфиг и запуск (требует GCP — см. блокер выше)
1. Скопировать `.env.example` -> `.env`, заполнить `PROJECT_ID`, `LOCATION` (напр. `us-central1`),
   `MODEL=gemini-live-2.5-flash-native-audio`, `DEV_MODE=true`.
   - **PROJECT_ID архитектор/пользователь должен дать.** Нет значения -> стоп, отметь в REPORT.
2. `gcloud auth application-default login` (если gcloud не установлен — отметь в REPORT).
3. Запустить backend: `python -m uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload`
4. В отдельном терминале фронт: `npm run dev`, открыть `http://localhost:5173`.
5. Убедиться, что на экране выбора по умолчанию: "I speak" = Russian, "I want to learn" = Hebrew,
   и что иврит присутствует в обоих выпадающих списках.

## Критерии приёмки (Definition of Done)

- [ ] `app/` содержит клон апстрима (есть `package.json`, `server/main.py`, `src/`).
- [ ] `npm install` и `pip install -r requirements.txt` прошли (или ошибки задокументированы в REPORT).
- [ ] В `app/src/components/view-missions.js` в списке языков есть `🇮🇱 Hebrew`.
- [ ] Дефолт to-lang = Hebrew, дефолт from-lang = Russian (видно в коде `connectedCallback`).
- [ ] `npm run build` проходит без ошибок.
- [ ] Этап 5 либо выполнен (приложение поднялось, дефолты видны в UI), либо честно помечен
      «заблокировано: нет GCP PROJECT_ID / ADC / gcloud».

## Ограничения

- Не выходить за scope. Не делать RTL-верстку, не менять миссии, не править бэкенд-логику.
- Консольный вывод — ASCII; файлы — UTF-8.
- Git: только `git clone` апстрима. Свои коммиты/push НЕЛЬЗЯ.

## Как проверить

- `app/` существует и содержит проект; `npm run build` зелёный.
- В `view-missions.js` грепом подтверждается `Hebrew` в `options` и в дефолтах.
- Скрин/текст экрана выбора (если дошли до этапа 5).
