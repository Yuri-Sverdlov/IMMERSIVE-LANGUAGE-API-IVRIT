# TASK — активное задание (ARCHIVED)

**От:** архитектор (чат)  
**Кому:** кодер (терминал)  
**Дата:** 2026-06-22  
**Статус:** ACCEPTED

## Цель

Проверить, что локальная среда разработки на этом ПК готова к работе над Immergo,
и зафиксировать базовую линию в `tasks/REPORT.md`.

## Шаги

1. Прочитать `CONTEXT.md` и `AGENTS.md`.
2. Из корня репозитория выполнить:
   - `node --version` и `python --version` — записать в отчёт
   - `npm install` — зафиксировать успех/ошибку
   - `pip install -r requirements.txt` — зафиксировать успех/ошибку
3. Если `.env` отсутствует — скопировать из `.env.example` и выставить:
   - `PROJECT_ID=immergo-hebrew`
   - `LOCATION=us-central1`
   - `MODEL=gemini-live-2.5-flash-native-audio`
   - `DEV_MODE=true`
4. Попробовать запустить бэкенд:
   ```
   python -m uvicorn server.main:app --host 127.0.0.1 --port 8000
   ```
   Подождать старта (~5 с), проверить `http://127.0.0.1:8000` (или health/root если есть).
   Остановить процесс. Зафиксировать результат.
5. **Не** запускать полный `dev.sh` и **не** деплоить в облако.
6. Заполнить `tasks/REPORT.md` полностью.

## Критерии приёмки

- [x] `npm install` и `pip install` выполнены или описана блокирующая ошибка
- [x] `.env` существует с корректным PROJECT_ID
- [x] Попытка старта uvicorn задокументирована (успех или точный traceback)
- [x] `REPORT.md` заполнен по шаблону

## Вне scope

- Git init / commit
- Изменения в исходном коде
- Деплой Cloud Run
- Настройка gcloud ADC (только отметить, есть ли credentials)
