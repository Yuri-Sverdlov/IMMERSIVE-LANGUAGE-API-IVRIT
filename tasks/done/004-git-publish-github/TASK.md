# TASK — активное задание (архитектор -> кодер)

> Ровно ОДНО активное задание. После приёмки архивируется в `tasks/done/`.

## Заголовок (задание 004 — ИСКЛЮЧЕНИЕ: git-задание)

Инициализировать git в КОРНЕ проекта и запушить всё в репозиторий пользователя на GitHub.

## Контекст

Это **явное git-задание** — тебе РАЗРЕШено commit/push (обычный запрет снят только для этой задачи).
Remote (HTTPS): `https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT.git` (репозиторий пустой).
Архитектор уже подготовил: убран чужой `app/.git`, создан корневой `.gitignore`, `DEPLOY.md`,
обновлён `app/.env.example`. Работаем из КОРНЯ проекта (`G:\___Planning_Life_Sphere\IVRIT\IMMERSIVE-LANGUAGE-API`).

## ГЛАВНОЕ ПРАВИЛО БЕЗОПАСНОСТИ

**Ключ `GEMINI_API_KEY` (файл `app/.env`) НЕ должен попасть в коммит.** Перед коммитом обязательно
проверить, что `.env` не застейджен. Если `.env` виден в `git status`/`git ls-files` — СТОП, сообщить архитектору.

## Что сделать (по шагам, из корня проекта)

1. Инициализировать репозиторий и ветку main:
   ```
   git init
   git branch -M main
   git remote add origin https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT.git
   ```
2. Добавить файлы и проверить, что секрет НЕ попал:
   ```
   git add -A
   git status
   ```
   Затем проверка-страж (должно вернуть ТОЛЬКО `.env.example`, НЕ `app/.env`):
   ```
   git ls-files | Select-String -Pattern "\.env"
   ```
   - Если в списке есть `app/.env` (без `.example`) -> `git rm --cached app/.env`, перепроверить, и только потом дальше.
   - Дополнительно убедиться, что `app/node_modules/`, `app/venv/`, `app/dist/` НЕ застейджены.
3. Коммит (сообщение через HEREDOC-стиль или одной строкой):
   ```
   git commit -m "Initial commit: Immergo, настроенный на иврит (родной русский), на Gemini API key"
   ```
4. Запушить:
   ```
   git push -u origin main
   ```
   - Remote по HTTPS -> нужен Personal Access Token в Windows Credential Manager (НЕ SSH-ключ).
     Если push требует логин/падает на авторизации -> сообщить архитектору «нужен PAT», НЕ выдумывать креды.
5. Проверка, что долетело:
   ```
   git ls-remote origin refs/heads/main
   ```
   (должен вернуться хэш, совпадающий с локальным `git rev-parse HEAD`).

## Критерии приёмки (Definition of Done)

- [ ] В корне инициализирован git, remote = репозиторий пользователя, ветка `main`.
- [ ] `git ls-files` НЕ содержит `app/.env` (только `app/.env.example`); node_modules/venv/dist не в индексе.
- [ ] Коммит создан, `git push -u origin main` успешен.
- [ ] `git ls-remote origin refs/heads/main` возвращает хэш = локальному `HEAD`.
- [ ] В REPORT указать: хэш коммита, число файлов, результат проверки `.env`.

## Ограничения

- Это разовое git-разрешение. Менять git config НЕ нужно. force-push НЕ делать.
- Если что-то про безопасность ключа неясно — остановиться и спросить архитектора.

## Как проверить

- `git ls-remote origin refs/heads/main` (хэш) и отсутствие `app/.env` в `git ls-files`.
