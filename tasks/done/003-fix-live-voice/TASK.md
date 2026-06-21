# TASK — активное задание (архитектор -> кодер)

> Ровно ОДНО активное задание. После приёмки архивируется в `tasks/done/`.
> Кодер выполняет только то, что здесь описано. Заполняй `tasks/REPORT.md` по ходу.

## Заголовок (задание 003)

Починить живой голосовой диалог: убрать неподдерживаемое поле `proactivity` и сделать UTF-8-вывод постоянным.

## Контекст (что выяснил архитектор по логам)

Миграция на Gemini API key (задание 002) работает: соединение с Gemini устанавливается,
системный промпт содержит иврит/русский. Но голосового ответа нет из-за ДВУХ багов:

1. **cp1252-краш (DEV-NOTES п.4).** Апстрим печатает эмодзи (`⚡️`, `🔧`, `🚀`) через `print()`.
   На Windows-консоли (cp1252) это `UnicodeEncodeError`, который убивал сессию. Временно
   обойдено запуском с `PYTHONUTF8=1`, но нужно постоянное решение в коде.
2. **`proactivity` отвергается developer-API.** В логе:
   `Error in Gemini session: received 1007 ... Unknown name "proactivity" at 'setup': Cannot find field.`
   Бэкенд шлёт в setup поле `proactivity`, которого нет в схеме модели `gemini-3.1-flash-live-preview`
   на developer-API -> Google рвёт соединение (1007) -> звука нет.

Работаем из `app/`. Windows + PowerShell. Файлы UTF-8. Свои коммиты/push НЕЛЬЗЯ.

## Что сделать

### Этап 1. Постоянный UTF-8-вывод — `app/server/main.py`
В самом начале файла (сразу после `import`-ов, ДО первого логирования/print) добавить:
```python
import sys
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
```
Это делает эмодзи-вывод безопасным при ЛЮБОМ способе запуска (без зависимости от `PYTHONUTF8`).

### Этап 2. Не слать `proactivity` — `app/server/gemini_live.py`
В `start_session`, в разборе `setup_config`, есть блок:
```python
if "proactivity" in setup_config:
    try:
        proactive_audio = setup_config["proactivity"].get("proactiveAudio", False)
        config_args["proactivity"] = types.ProactivityConfig(proactive_audio=proactive_audio)
    except (AttributeError, TypeError):
        pass
```
Этот блок добавляет в конфиг поле, которое отвергает developer-API. **Отключить отправку**:
закомментировать/удалить присвоение `config_args["proactivity"] = ...` (или обернуть весь блок
так, чтобы proactivity НЕ попадал в `config_args`). Остальной конфиг (response_modalities=AUDIO,
speech_config, system_instruction, tools, транскрипции) НЕ трогать.

### Этап 3. Перезапуск и проверка
1. Backend (порт 8000):
   `.\venv\Scripts\Activate.ps1` затем `python -m uvicorn server.main:app --host 0.0.0.0 --port 8000`
   (благодаря этапу 1 префикс `PYTHONUTF8` уже не обязателен).
2. Frontend: `npm run dev` (должен встать на 5173).
3. В браузере `http://localhost:5173/` начать миссию «Скажи привет», сказать фразу.
4. **Проверить лог бэкенда:** строки `Error in Gemini session: ... 1007 ... proactivity` быть НЕ должно;
   соединение должно оставаться открытым, должны пойти аудио-ответы.

> Если после удаления `proactivity` Google отвергнет ДРУГОЕ поле (снова `1007 Unknown name "X"`),
> зафиксируй имя поля `X` в REPORT и аналогично убери его отправку из `config_args`.
> Голосовой тест с микрофоном завершит пользователь — кодеру достаточно убедиться, что 1007 пропал
> и сессия не закрывается на setup.

## Критерии приёмки (Definition of Done)

- [ ] `main.py`: в начале есть `sys.stdout/stderr.reconfigure(encoding="utf-8", ...)`.
- [ ] `gemini_live.py`: `proactivity` больше НЕ добавляется в `config_args`.
- [ ] После перезапуска в логе при старте миссии НЕТ ошибки `1007 ... proactivity`, соединение держится.
- [ ] (Если всплыло) другие отвергнутые поля задокументированы/убраны.
- [ ] REPORT заполнен; финальный голосовой тест оставлен пользователю.

## Ограничения

- Scope: только эти два фикса. Не менять модель, не трогать иврит-настройки, не делать RTL.
- Консоль — ASCII в НОВЫХ print (если будешь добавлять); файлы — UTF-8. Ключ не печатать, не коммитить.
- Git: коммиты/push НЕЛЬЗЯ.

## Как проверить

- Grep: `reconfigure` в `main.py`; отсутствие `config_args["proactivity"]` в `gemini_live.py`.
- Лог бэкенда при старте миссии без `1007 ... proactivity`.
