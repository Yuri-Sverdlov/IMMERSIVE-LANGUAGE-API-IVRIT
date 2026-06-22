# ACCEPTED — вердикт архитектора

- **Дата:** 2026-06-21
- **Задание:** Перевести бэкенд с Vertex AI на Gemini Developer API (ключ) и запустить.
- **Вердикт:** код-часть (этапы 1–3) **ПРИНЯТА**. Связка ключ -> модель -> иврит-промпт
  подтверждена живым логом (соединение с Gemini устанавливается, промпт содержит
  «🇮🇱 Иврит» / «🇷🇺 Русские»). Финальный голосовой тест НЕ прошёл из-за двух рантайм-багов,
  которые вынесены в отдельное задание 003 (не дефект миграции).

## Что проверено объективно

- `gemini_live.py`: ветка `api_key` -> `genai.Client(api_key=...)`.
- `main.py`: `GEMINI_API_KEY` читается, дефолт `MODEL=gemini-3.1-flash-live-preview`, ключ прокинут.
- `.env`: developer-режим, ключ присутствует, `DEV_MODE=true`.
- `view-missions.js`: переменные переименованы; `npm run build` зелёный.
- Доп-фикс reCAPTCHA (gRPC-клиент только при ключе) — корректен.
- Запуск: backend `:8000` = 200; лог `GeminiLive init: model=gemini-3.1-flash-live-preview, mode=api_key`.

## Выявленные рантайм-баги (-> задание 003)

1. **cp1252-краш на эмодзи в print** (`gemini_live.py`/`simple_tracker.py`): на Windows-консоли
   `UnicodeEncodeError` убивал сессию. Временно обойдено запуском с `PYTHONUTF8=1` (архитектор).
   Нужен постоянный фикс в коде.
2. **`proactivity` не принимается developer-API** для `gemini-3.1-flash-live-preview`:
   `1007 Unknown name "proactivity" at 'setup'`. Бэкенд не должен слать это поле.
