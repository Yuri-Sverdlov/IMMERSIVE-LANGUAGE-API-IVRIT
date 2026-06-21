# DEPLOY — развёртывание на другом компьютере

Иммерсивное изучение иврита (родной — русский) на базе Immergo
([апстрим](https://github.com/ZackAkil/immersive-language-learning-with-live-api)),
переключённого на **Gemini Developer API** (ключ из Google AI Studio, без Google Cloud/Vertex).

Приложение лежит в подпапке `app/`. Файлы `AGENTS.md`/`CONTEXT.md`/`tasks/` — это
двухагентная схема разработки (архитектор+кодер), для запуска приложения не нужны.

## Требования

- Node.js 18+
- Python 3.10+
- Ключ **GEMINI_API_KEY** (бесплатный): https://aistudio.google.com -> Get API key
- Интернет (ИИ Gemini работает в облаке Google; локально крутится только сервер+UI)

## Шаги (Windows + PowerShell)

```powershell
git clone https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT.git
cd IMMERSIVE-LANGUAGE-API-IVRIT\app

# 1) Конфиг: создать .env из шаблона и вписать свой ключ
Copy-Item .env.example .env
#   затем открыть .env и задать GEMINI_API_KEY=<ваш ключ>
#   (MODEL=gemini-3.1-flash-live-preview и DEV_MODE=true уже проставлены)

# 2) Фронтенд
npm install

# 3) Бэкенд (виртуальное окружение Python)
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Запуск (два терминала)

```powershell
# Терминал 1 — бэкенд (порт 8000)
cd app
.\venv\Scripts\Activate.ps1
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000

# Терминал 2 — фронтенд (порт 5173)
cd app
npm run dev
```

Открыть **http://localhost:5173/**. Дефолты: «I speak» = Russian, «I want to learn» = Hebrew.
Выбрать миссию, разрешить микрофон, говорить — ИИ отвечает голосом на иврите.

## Что уже зашито в этот форк (отличия от апстрима)

- Бэкенд работает по `GEMINI_API_KEY` (`genai.Client(api_key=...)`), модель `gemini-3.1-flash-live-preview`.
- В список языков добавлен иврит; дефолты — учить иврит / родной русский.
- `server/main.py`: `sys.stdout/stderr.reconfigure(utf-8)` — фикс краха на Windows-консоли (cp1252).
- `server/gemini_live.py`: убрано поле `proactivity` (developer-API его не принимает).
- `server/recaptcha_validator.py`: gRPC-клиент создаётся только при заданном reCAPTCHA-ключе.

## Безопасность

- `.env` с ключом **в репозиторий не попадает** (см. `.gitignore`). На каждой машине — свой `.env`.
- Если ключ всё же утёк в коммит — отозвать его в AI Studio и выпустить новый.
