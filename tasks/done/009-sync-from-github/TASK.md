# TASK — 009 sync с GitHub (компьютер 2 -> ПК1)

Подтянуть с GitHub все коммиты с «компьютера 2» и проверить, что приложение запускается.

Remote был на 5 коммитов впереди (`42c9ee4` -> `b642136`).

Ключевое с remote: `app/immergo.config.json`, `speech_playback_rate`, облачные md, архивы tasks/done/.

**`app/.env` с ключом — локальный, не коммитить.**

Этапы: backup `.env` -> stash local docs -> `git pull` -> проверить config -> `/api/status` 200.

Push/commit не делать.
