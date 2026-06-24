# TASK — активное задание (архитектор -> кодер)

> Ровно ОДНО активное задание. Git: **commit + push РАЗРЕШЁН** (явное git-задание).
> После push заполни `tasks/REPORT.md`.

## Заголовок (задание 011 — git: commit/push TASK-010)

Закоммитить и запушить на GitHub результат **TASK-010** (шаблон квеста + инструкция) и связанные документы приёмки.

## Контекст

- Локальный `main` сейчас = `origin/main` на **`b642136`** (до 010).
- TASK-010 **принят** архитектором; файлы на диске, **на remote ещё нет**.
- **`app/.env` и любые секреты — НЕ коммитить.**

## Что включить в commit

### Обязательно (суть 010)

| Путь | Зачем |
|------|--------|
| `app/src/data/mission.template.json` | шаблон квеста |
| `docs/HOW-TO-ADD-QUEST.md` | инструкция пользователя |
| `QUICK_START.md` | ссылки + таблица «Полезные файлы» |
| `tasks/done/010-quest-template/` | архив TASK/REPORT/ACCEPTED |

### Документы приёмки (уже изменены архитектором — в тот же commit)

| Путь | Зачем |
|------|--------|
| `CONTEXT.md` | фокус: 010 принят |
| `PROJECT_LOG.md` | запись приёмки 010 |

### Архив 009 (локально не был на GitHub — включить)

| Путь | Зачем |
|------|--------|
| `tasks/done/009-sync-from-github/` | приёмка sync ПК1 |

### Сброс активной задачи

| Путь | Зачем |
|------|--------|
| `tasks/TASK.md` | «нет активного задания» |
| `tasks/REPORT.md` | пустой шаблон |

## Что НЕ коммитить (явный exclude)

- `app/.env`, `app/.env.backup`
- `new` (посторонний файл в корне)
- `tasks/done/007-quick-start-git/` (устаревший дубликат ПК1; на remote уже другие архивы)

Перед `git add` проверь: `git status` — в staged **нет** `.env` / backup / `new`.

## Шаги

### 1. Проверка

Из корня проекта:

```
git status
git diff --stat
```

### 2. Stage (выборочно)

Добавить **только** файлы из таблиц выше. Пример (PowerShell):

```
git add app/src/data/mission.template.json docs/HOW-TO-ADD-QUEST.md QUICK_START.md CONTEXT.md PROJECT_LOG.md tasks/done/010-quest-template tasks/done/009-sync-from-github tasks/TASK.md tasks/REPORT.md
```

Проверка staged:

```
git diff --cached --stat
git diff --cached --name-only | Select-String "\.env|/new$|007-quick-start"
```

Вторая команда **не должна** ничего вывести.

### 3. Commit

Стиль репо — Conventional Commits. Сообщение (один commit):

```
docs: add mission template and HOW-TO-ADD-QUEST for custom quests
```

Тело (опционально, через `-m` второй строкой или HEREDOC):

```
TASK-010: mission.template.json, docs/HOW-TO-ADD-QUEST.md, QUICK_START links.
Archive tasks/done/010-quest-template and 009-sync-from-github; PROJECT_LOG update.
```

### 4. Push

```
git push origin main
```

При ошибке auth — PAT через Windows Credential Manager (HTTPS remote). **Не** `--force`.

### 5. Верификация

```
git rev-parse HEAD
git rev-parse origin/main
git status -sb
```

HEAD = origin/main, working tree чистый **кроме** намеренно untracked (`.env.backup`, `new`, `007-quick-start-git`).

## Критерии приёмки (DoD)

- [ ] На GitHub в `main` есть `app/src/data/mission.template.json` и `docs/HOW-TO-ADD-QUEST.md`.
- [ ] `git ls-remote origin refs/heads/main` = локальный `HEAD`.
- [ ] `app/.env` не в истории commit.
- [ ] `tasks/REPORT.md` заполнен: hash commit, push OK/ошибка.

## Ограничения

- **Один** commit (не несколько), если нет блокера.
- **Не** `git push --force` на main.
- **Не** менять `AGENTS.md`, `CLAUDE.md`, код приложения (010 уже без кода).
- Консольный вывод — только ASCII.
