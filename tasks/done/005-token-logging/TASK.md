# TASK — активное задание (архитектор -> кодер)

> Ровно ОДНО активное задание. После приёмки архивируется в `tasks/done/`.

## Заголовок (задание 005)

Включить логирование расхода токенов в консоль + закоммитить накопленные правки (ASCII-фикс .env.example, DEV-NOTES, 7-мин лимит уже в .env).

## Контекст

Пользователь хочет видеть расход токенов Live API в логе бэкенда (в терминале, не в браузере).
Сейчас логирование закомментировано в `app/server/gemini_live.py`. Также в репозитории есть
накопленные НЕзакоммиченные правки от архитектора, их надо отправить на GitHub.
Это **git-задание** — commit/push РАЗРЕШён (разовое исключение). Работаем из корня и из `app/`.
Среда Windows, файлы UTF-8, но в консольный вывод (print) — ТОЛЬКО ASCII (cp1252; см. DEV-NOTES п.4/7).

## Что сделать

### Этап 1. Включить логирование токенов — `app/server/gemini_live.py`
Найти закомментированный блок в `receive_loop` (примерно):
```python
# uncomment for token usage
# if response.usage_metadata:
#     print("💰 Usage metadata:", response.usage_metadata)
```
Заменить его на РАБОЧИЙ, но с **ASCII-выводом** (без эмодзи, чтобы гарантированно не упасть):
```python
if response.usage_metadata:
    um = response.usage_metadata
    print(f"[TOKENS] total={getattr(um, 'total_token_count', None)} "
          f"prompt={getattr(um, 'prompt_token_count', None)} "
          f"response={getattr(um, 'response_token_count', None)}")
```
(Если поля называются иначе в установленной версии SDK — взять реально существующие из `usage_metadata`,
зафиксировать фактические имена в REPORT.)

### Этап 2. Проверить, что бэкенд стартует и логирует
1. Из `app/`: `.\venv\Scripts\Activate.ps1` затем `python -m uvicorn server.main:app --host 0.0.0.0 --port 8000`.
2. Backend должен стартовать (порт 8000). `GET /api/status` = 200.
3. Если есть возможность — кратко проверить, что при сессии в логе появляется строка `[TOKENS] ...`
   (полноценный голосовой тест сделает пользователь). После проверки backend можно остановить.

### Этап 3. Коммит и пуш накопленных правок
Закоммитить и запушить в `origin/main` следующие изменения (они уже на диске или из этапа 1):
- `app/server/gemini_live.py` (логирование токенов, этап 1);
- `app/.env.example` (комментарии переведены в ASCII + добавлен `SESSION_TIME_LIMIT`);
- `DEV-NOTES.md` (добавлен п.7).
Шаги:
```
git add -A
git status
git ls-files | Select-String -Pattern "\.env"   # СТРАЖ: должно быть только app/.env.example
git commit -m "Логи токенов в консоль; ASCII-фикс .env.example; DEV-NOTES п.7"
git push origin main
git ls-remote origin refs/heads/main             # сверить хэш с git rev-parse HEAD
```

## ГЛАВНОЕ ПРАВИЛО БЕЗОПАСНОСТИ

`app/.env` (с ключом `GEMINI_API_KEY`) **НЕ коммитить.** Перед коммитом проверить стражем
(`git ls-files | Select-String "\.env"` -> только `.env.example`). Если виден `app/.env` -> СТОП, сообщить.

## Критерии приёмки (DoD)

- [ ] В `gemini_live.py` логирование токенов раскомментировано, вывод ASCII (`[TOKENS] ...`).
- [ ] Backend стартует, `/api/status` = 200; (по возможности) в логе видна строка `[TOKENS]`.
- [ ] Коммит создан и запушен; `git ls-remote origin refs/heads/main` = локальному `HEAD`.
- [ ] Страж подтвердил: `app/.env` НЕ в индексе (только `.env.example`).
- [ ] В REPORT: новый хэш коммита, фактические имена полей usage_metadata.

## Ограничения

- Scope: только логирование токенов + коммит указанных файлов. Не менять модель, промпты, лимиты.
- print — ASCII; файлы — UTF-8; `.env` — ASCII (не трогать). Ключ не печатать, не коммитить.
- force-push НЕ делать, git config НЕ менять.
