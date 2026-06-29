# Cloud Shell Deploy — развертывание Immergo в Cloud Run

> Инструкция для обновления облачного сервиса Immergo без установки `gcloud` на локальный ПК.
> Deploy выполняется в **Google Cloud Shell** (терминал в браузере).

## Зачем

Обновить облачный сервис до актуальной версии с GitHub:
- Русский/иврит по умолчанию
- Панель управления сессией (скорость диалога + микрофон)
- `immergo.config.json` (7 минут, VAD, playback rate)
- Шаблон квестов

## Где

1. Откройте браузер: https://console.cloud.google.com
2. Убедитесь, что выбран проект **`immergo-hebrew`** (выпадающий список вверху)
3. Нажмите иконку **Cloud Shell** (`>_`) в правом верхнем углу консоли
4. Откроется терминал внизу экрана

## Перед deploy

Откройте на своём ПК файл `app/.env` и скопируйте значение `GEMINI_API_KEY`.

**Важно:** ключ не показывайте никому и не коммитьте в репозиторий.

## Команды для Cloud Shell

Скопируйте и вставьте блок команд ниже в Cloud Shell.

**Замените `PASTE_YOUR_KEY_HERE`** на ваш реальный ключ из `app/.env`.

```bash
# Установить текущий проект
gcloud config set project immergo-hebrew

# Клонировать наш репозиторий
git clone https://github.com/Yuri-Sverdlov/IMMERSIVE-LANGUAGE-API-IVRIT.git immergo-ivrit
cd immergo-ivrit/app

# Проверить, что Dockerfile копирует config
grep immergo.config.json Dockerfile || { echo "ERROR: Dockerfile missing config copy"; exit 1; }

# Установить переменную окружения с ключом API (не коммитить!)
export GEMINI_API_KEY='PASTE_YOUR_KEY_HERE'

# Deploy в Cloud Run
gcloud run deploy immergo \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --quiet \
  --set-env-vars "MODEL=gemini-3.1-flash-live-preview,DEV_MODE=true,PROJECT_ID=immergo-hebrew,LOCATION=us-central1,GEMINI_API_KEY=${GEMINI_API_KEY}"

# Показать URL сервиса
echo "Deploy done. Service URL:"
gcloud run services describe immergo --region us-central1 --format='value(status.url)'
```

## После deploy

1. Скопируйте URL из вывода (строка `https://immergo-....run.app`)
2. Откройте URL в браузере Chrome
3. Разрешите доступ к микрофону (HTTPS-сайт)
4. Проверьте:
   - Языки по умолчанию: Russian / Hebrew
   - Панель под описанием миссии: скорость диалога ▲/▼, микрофон вкл/выкл
   - Короткий голосовой диалог на иврите

## Если ошибка

- **Billing / API disabled**: скопируйте текст ошибки, сообщите архитектору
- **Build failed**: проверьте логи Cloud Build в консоли
- **Deploy timeout**: повторите команду `gcloud run deploy ...`

## Повторный deploy (при обновлении кода)

```bash
cd ~/immergo-ivrit
git pull
cd app
export GEMINI_API_KEY='ваш_ключ'
gcloud run deploy immergo \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --quiet \
  --set-env-vars "MODEL=gemini-3.1-flash-live-preview,DEV_MODE=true,PROJECT_ID=immergo-hebrew,LOCATION=us-central1,GEMINI_API_KEY=${GEMINI_API_KEY}"
```

---

**Примечание:** этот deploy использует **Gemini Developer API** (`GEMINI_API_KEY` из AI Studio), а не Vertex AI. GCP Billing нужен только для Cloud Run (хостинг), не для Gemini.
