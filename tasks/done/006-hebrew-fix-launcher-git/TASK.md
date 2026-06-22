# TASK — активное задание (архитектор -> кодер)

> Ровно ОДНО активное задание. После приёмки архивируется в `tasks/done/`.
> Это **git-задание** — commit/push РАЗРЕШён (разовое исключение).

## Заголовок (задание 006)

Фикс языка (French -> Hebrew), launcher BAT с очисткой портов, коммит и push в GitHub.

## Контекст

Архитектор уже внёс правки на диске (проверь diff, не переписывай молча). Пользователь подтвердил,
что после фикса всё работает. Нужно закоммитить и запушить в `origin/main`.

Remote: `https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT.git`

## Что должно быть в коммите (проверь diff)

### 1. Фикс языка — French больше не уходит в промпт

**`app/src/components/view-missions.js`:**
- Миграция: если `localStorage.immergo_language` содержит `French` — удалить ключ (сброс старого апстрим-дефолта).
- При первом заходе без сохранённого языка: дефолт Hebrew/Russian + сразу записать в `localStorage`.

**`app/src/components/view-chat.js`:**
- Fallback при старте микрофона НЕ `French`/`English`, а цепочка:
  `this._language || localStorage.getItem('immergo_language') || "🇮🇱 Hebrew"` (и аналогично Russian для from).
- Убедиться grep-ом: в `view-chat.js` нет `|| "French"` и `|| "English"` в блоке system instruction.

### 2. Launcher BAT + очистка портов

**Новые/обновлённые файлы (корень и app/):**
- `start-immergo.bat` — точка входа (двойной клик): сначала освобождает порты 8000/5173, затем
  два окна cmd (backend + frontend), затем браузер `http://localhost:5173/`.
- `app/run-backend.cmd` — venv + uvicorn :8000.
- `app/run-frontend.cmd` — npm run dev :5173.
- В `start-immergo.bat` очистка портов через PowerShell (`Get-NetTCPConnection` + `Stop-Process`).
  Переменная процесса — `$procId`, НЕ `$pid` (зарезервировано в PowerShell).

**`DEPLOY.md`:** раздел «Быстрый запуск (Windows)» про `start-immergo.bat`.

### 3. Журнал (опционально в коммите)

`PROJECT_LOG.md` и `CONTEXT.md` — архитектор обновил; включи в коммит, если есть изменения.

## Что НЕ коммитить

- **`app/.env`** (ключ `GEMINI_API_KEY`) — СТРОЖАЙШИЙ запрет. Страж перед коммитом обязателен.
- **`new`** — посторонний untracked файл в корне; НЕ добавлять (если неясно что это — пропустить).
- `tasks/REPORT.md` — можно не коммитить (рабочий отчёт); по желанию.

## Git (по шагам, из корня проекта)

```
git add start-immergo.bat app/run-backend.cmd app/run-frontend.cmd
git add app/src/components/view-missions.js app/src/components/view-chat.js
git add DEPLOY.md PROJECT_LOG.md CONTEXT.md
git status
git ls-files | Select-String -Pattern "\.env"    # только app/.env.example
git commit -m "Fix Hebrew default (drop stale French), add start-immergo.bat with port cleanup"
git push origin main
git ls-remote origin refs/heads/main
git rev-parse HEAD
```

Хэши remote и local HEAD должны совпадать.

## Критерии приёмки (DoD)

- [ ] Grep: в `view-chat.js` нет fallback `|| "French"` / `|| "English"` для языка миссии.
- [ ] Grep: в `view-missions.js` есть миграция `French` из localStorage.
- [ ] `start-immergo.bat` + `run-backend.cmd` + `run-frontend.cmd` в репозитории; bat освобождает 8000/5173.
- [ ] `app/.env` НЕ в индексе; `git grep` уникального фрагмента ключа по HEAD -> 0.
- [ ] Push успешен; `ls-remote main` = `rev-parse HEAD`.
- [ ] REPORT заполнен: хэш коммита, список файлов, результат стража.

## Ограничения

- Не менять логику beyond описанного. Не трогать `.env`. force-push НЕ делать.
- print в Python — ASCII; файлы — UTF-8.
