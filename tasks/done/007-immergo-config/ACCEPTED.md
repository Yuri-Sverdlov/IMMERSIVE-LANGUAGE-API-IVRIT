# ACCEPTED — вердикт архитектора

- **Дата:** 2026-06-22
- **Задание:** TASK-007 — `app/immergo.config.json` (языки, session limit, VAD).
- **Вердикт:** **ПРИНЯТО.** Commit `f60c7df` = origin/main.

## Что проверено объективно

- `app/immergo.config.json` — RU/HE, 420s, 2000ms.
- `GET /api/config` → 200, поля совпадают с JSON.
- `POST /api/auth` → `session_time_limit: 420` (из config, не только .env).
- `config_utils.load_immergo_config()` — дефолты + merge, WARNING при битом JSON.
- `view-missions.js` — async `/api/config` для дефолтов языков без localStorage.
- `view-chat.js` + `geminilive.setSilenceDurationMs()` — VAD из config перед connect.
- `git ls-files` — `app/.env` не в индексе.
- Push: `12bc273..f60c7df main -> main`.

## Остаётся пользователю

- Голосовой тест: сменить `silence_duration_ms` (напр. 3000) и проверить паузу.
- Сменить `target_language: "English"` в инкогнито — дефолт to-lang.
