# TASK — активное задание (архитектор -> кодер)

> Ровно ОДНО активное задание. После приёмки архивируется в `tasks/done/`.
> Кодер выполняет только то, что здесь описано. Заполняй `tasks/REPORT.md` по ходу.

## Заголовок (задание 008)

Скорость воспроизведения речи ИИ: `speech_playback_rate` 0,7–1,5 через `immergo.config.json`.

## Контекст

Пользователь хочет **менять темп озвучки ответа модели** (не скорость «начала ответа» после паузы —
это уже `silence_duration_ms` из TASK-007).

Архитектор проверил код и Gemini Live API:

| Механизм | Вывод |
|---|---|
| `SpeechConfig` в setup (`geminilive.js`) | Только `voice_name` и язык. **Поля скорости речи в Live API нет.** |
| `silence_duration_ms` | Пауза VAD до ответа — **не** скорость речи. Не трогать. |
| `AudioPlayer` + `playback.worklet.js` | PCM 24 kHz, очередь буферов, **без изменения темпа**. Только `setVolume()`. |

**Решение:** настраивать темп **на клиенте при воспроизведении** PCM, значение — из `immergo.config.json`
→ `GET /api/config` → `AudioPlayer`.

Работаем из `app/`. Windows + PowerShell. Файлы UTF-8. **Коммит/push НЕ делать** (нет git-задания).

Подробный черновик архитектора — раздел «План TASK-008» в `CONTEXT.md`.

## Что сделать

### 1. Config — `app/immergo.config.json`

Добавить поле (дефолт «как сейчас»):

```json
"speech_playback_rate": 1.0
```

Допустимый диапазон: **0,7 … 1,5** (`1.0` = без изменений; меньше — медленнее, больше — быстрее).

### 2. Backend — `app/server/config_utils.py`

В словарь `defaults` в `load_immergo_config()` добавить:

```python
"speech_playback_rate": 1.0
```

После merge с файлом — **clamp** значение в `[0.7, 1.5]`. Если поле не число — оставить дефолт `1.0`
(не падать; залогировать warning при желании, print только ASCII).

### 3. Backend — `app/server/main.py`

В ответ `GET /api/config` добавить поле:

```python
"speech_playback_rate": ...
```

(из `IMMERGO_CONFIG`, уже clamped).

### 4. Frontend — playback worklet — `app/public/audio-processors/playback.worklet.js`

Сейчас worklet копирует сэмплы 1:1 из очереди. Нужно воспроизводить с переменным темпом:

- Добавить `playbackRate` (дефолт `1.0`).
- Принимать из main thread сообщение вида `{ type: "setPlaybackRate", rate: number }`
  (или эквивалент — главное, не ломать существующие `"interrupt"` и `Float32Array`).
- В `process()`: для каждого выходного сэмпла читать из очереди с **дробным индексом**,
  шаг `+= playbackRate`; между соседними сэмплами — **линейная интерполяция**.
- При `"interrupt"` — очистить очередь **и** сбросить дробный read-index.
- Цель: без щелчков/разрывов на стыках чанков; `interrupt` по-прежнему мгновенно обрывает звук.

> Pitch: при resample темпа pitch слегка меняется (эффект «магнитофона»). Для диапазона 0,7–1,5
> это допустимо. Phase-vocoder / WSOLA **не нужны** — не усложнять.

### 5. Frontend — `app/src/lib/gemini-live/mediaUtils.js` (`AudioPlayer`)

- Поле `playbackRate = 1.0`.
- Метод `setPlaybackRate(rate)`:
  - clamp `0.7 … 1.5`;
  - сохранить в `this.playbackRate`;
  - если worklet уже создан — `postMessage` в worklet.
- В `init()` после создания `AudioWorkletNode` — применить текущий `this.playbackRate`.
- `setPlaybackRate` должен работать **до** и **после** `init()` (если до — запомнить, применить при init).

### 6. Frontend — `app/src/components/view-chat.js`

Расширить существующий блок fetch config (около строк 605–614, перед connect):

```javascript
const configResponse = await fetch('/api/config');
const config = await configResponse.json();
// silence_duration_ms — как сейчас
// + speech_playback_rate -> this.audioPlayer.setPlaybackRate(...)
```

Вызвать `setPlaybackRate` **до** `await this.audioPlayer.init()` (строка ~654), чтобы rate попал в worklet
при инициализации. Один fetch — на оба поля; не дублировать запрос.

### 7. Документация — `QUICK_START.md`

В таблицу «Ограничения (важно знать)» добавить строку:

| Скорость озвучки ответа ИИ | **1,0** (нормально) | `app/immergo.config.json` → `speech_playback_rate` (0,7–1,5; обновить страницу `Ctrl+F5`) |

Кратко пояснить: это **темп речи модели**, не пауза перед ответом (`silence_duration_ms`).

## Что НЕ делать (вне scope)

- Не менять голос (`Puck`), промпт («говори медленнее»), Gemini setup.
- Не трогать `silence_duration_ms`, языки, session limit (007).
- Не добавлять UI-слайдер — только config-файл.
- Не коммитить/push без отдельного git-задания.
- Не редактировать `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`.

## Проверка

### Автоматически

Из `app/`:

```
npm run build
```

Должно пройти без ошибок.

### Backend (если поднят)

```
curl http://localhost:8000/api/config
```

В JSON должно быть `"speech_playback_rate": 1.0` (или значение из config после clamp).

### Вручную в браузере

1. Запуск: `start-immergo.bat` или backend + `npm run dev`.
2. **Baseline:** `speech_playback_rate: 1.0` — голос как раньше, без артефактов.
3. **Медленнее:** поставить `0.7`, `Ctrl+F5`, начать миссию — речь ИИ заметно медленнее.
4. **Быстрее:** поставить `1.5`, `Ctrl+F5` — речь быстрее.
5. **Clamp:** поставить `2.0` или `0.3` — в `/api/config` и на слух должно быть как `1.5` / `0.7`.
6. **Interrupt:** во время речи ИИ нажать mic/stop — воспроизведение обрывается (как раньше).

Если полноценный голосовой тест невозможен (нет ключа) — описать в REPORT, что проверено build + `/api/config` + код review worklet.

## Критерии приёмки (DoD)

- [ ] `app/immergo.config.json` содержит `speech_playback_rate: 1.0`.
- [ ] `load_immergo_config()` — дефолт + clamp `[0.7, 1.5]`.
- [ ] `GET /api/config` возвращает `speech_playback_rate`.
- [ ] `AudioPlayer.setPlaybackRate()` + worklet меняют темп воспроизведения.
- [ ] `view-chat.js` читает rate из `/api/config` (один fetch с VAD).
- [ ] `interrupt` по-прежнему очищает очередь.
- [ ] `npm run build` — OK.
- [ ] `QUICK_START.md` — новая строка в таблице ограничений.
- [ ] `tasks/REPORT.md` заполнен: что сделано, как проверено, известные ограничения (pitch).

## Ограничения

- Консольный `print` — только ASCII.
- Минимальный diff: не рефакторить `mediaUtils.js` / worklet beyond необходимого.
- Файлы — UTF-8.
