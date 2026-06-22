# DEV-NOTES — заметки по среде разработки (общие для всех проектов)

> Файл-подсказка для всех текущих и будущих проектов на этом компьютере.
> Сюда складываются повторяющиеся «грабли» и договорённости, не привязанные к
> одному проекту. **Документ растёт** — добавляй новые пункты снизу.
>
> Расположение: `G:\_My_Programming\DEV-NOTES.md`
> Обновлено: 2026-06-21 (добавлен п.7: Gemini Live API + грабли .env/cp1252 на Windows)

---

## 1. Двухагентная схема: архитектор (чат) ↔ кодер (терминал)

Две модели работают через файлы в репозитории проекта:

- **Архитектор** — в чате (дорогая модель). Проектирует, пишет задания, проверяет,
  ведёт журнал. Код почти не пишет.
- **Кодер** — в терминале (дешёвая модель, напр. через Claude Code CLI). Пишет код,
  тестирует, заполняет отчёт.

**Канонический комплект файлов (спина системы):**

1. `AGENTS.md` — устав кодера: правила, запуск, запреты. Меняется редко.
2. `CONTEXT.md` — память проекта: суть, стек, роли, текущий фокус.
3. `tasks/TASK.md` — **одно** активное задание архитектор → кодер.
4. `tasks/REPORT.md` — **один** текущий отчёт кодер → архитектор.
5. `PROJECT_LOG.md` — append-only журнал всех сессий.

Вспомогательное: `CLAUDE.md` — тонкий редирект на `AGENTS.md` (Claude Code читает
его нативно); `tasks/done/` — архив принятых заданий (TASK+REPORT+ACCEPTED).

**Правило против рассинхрона:** «правда о состоянии» живёт только в `REPORT.md`
(что сейчас) и `PROJECT_LOG.md` (что было). Никаких параллельных STATUS/NOTES/NEXT.

**Цикл:** архитектор пишет `TASK.md` → кодер выполняет и заполняет `REPORT.md` →
архитектор объективно проверяет, архивирует в `tasks/done/`, обновляет журнал.

**Старт новой сессии в терминале:**
`Прочитай CONTEXT.md, затем AGENTS.md, затем tasks/TASK.md и выполни задание.`

---

## 2. Песочница чат-агента vs реальный компьютер (host / mount)

Чат-агент (режим Claude Cowork) работает через **Linux-песочницу**, в которую
смонтированы папки с диска Windows. Это даёт расхождения:

- **Файловые инструменты (Read/Write/Edit) пишут в host** (реальные файлы Windows).
  **bash работает в mount** (смонтированная копия). Обычно они синхронны.
- **Но иногда mount кэширует устаревшую/обрезанную копию файла.** Реальный случай:
  `text_layout.py` — host 287 строк (целый), mount 236 строк (обрезан) → повторный
  прогон в песочнице ложно падал. Лечение: если bash-проверка противоречит Read —
  сверить `wc -l` / `inspect.getsource` (mount) против Read (host); **верить host**.
- **mount НЕ может писать git-lock-файлы** (`.git/index.lock`, `.git/config.lock`):
  ошибка `Operation not permitted`. Поэтому любые git-операции записи (commit, push,
  даже удаление lock-файла) делаются **на стороне Windows**, не из песочницы.

Вывод: тяжёлую правку файлов и git делает терминальный агент на реальном диске;
чат-агент проверяет результат через host-Read и read-only команды.

---

## 3. GitHub: режим Claude-коворк vs режим терминала

- **Чат (Cowork) НЕ умеет надёжно коммитить/пушить:** mount блокирует git-локи, и у
  чат-агента нет твоих GitHub-кредов. Доступно только **read-only**: `git status`,
  `git ls-remote` (для проверки, что пуш долетел).
- **Терминал (Claude Code на Windows) умеет git полностью:** нативная ФС, доступ к
  Windows Credential Manager / SSH. Поэтому **коммит и push выполняет кодер в терминале**.
- **Аутентификация:** если remote по **HTTPS** (`https://github.com/...`) — нужен
  **Personal Access Token** (хранится в Windows Credential Manager), а НЕ SSH-ключ.
  SSH-ключ нужен только если remote в форме `git@github.com:...`.
- **Рабочий паттерн:** архитектор (чат) готовит файлы и пишет git-задание → кодер
  (терминал) делает commit/push → архитектор проверяет результат через
  `git ls-remote origin refs/heads/main` (сверка хэша).
- Коммит — это **явное исключение** из правила «кодер не коммитит»: разрешать только
  в специальном git-задании.

---

## 4. Кодировка консоли (Windows, cp1252)

- Терминальная консоль на этом ПК — **cp1252**. Кириллица и спецсимволы
  (`→`, `≤`, фигурные кавычки/апострофы `'`) в `print()` дают `UnicodeEncodeError`.
- **Правило:** в консольный вывод (`print`) пиши только ASCII (`->`, `<=`, `'`).
  Сами файлы — всегда **UTF-8**, в них Unicode корректен (PIL, тексты, JSON — ок).
- Это не баг логики, а ограничение консоли. Не «чинить» молча подменой данных —
  менять только то, что печатается в терминал.

---

## 5. FFmpeg — установлен глобально (общий для всех проектов)

- **FFmpeg уже стоит и доступен из любой папки.** Бинарники: `C:\FFMpeg\`
  (`ffmpeg.exe`, `ffprobe.exe`, `ffplay.exe` + DLL). Путь `C:\FFMpeg` прописан в
  **User PATH** (постоянно, для учётки Yuri) -> команды `ffmpeg`/`ffprobe`/`ffplay`
  работают глобально. Ставить через winget/scoop НЕ нужно.
- Сборка полнофункциональная (gpl/version3): есть `libass`, `libfreetype`, `libharfbuzz`,
  `libfribidi` (рендер/вшивание субтитров, в т.ч. RTL-иврит), `cuda`/`ffnvcodec`
  (ускорение на NVIDIA), `whisper`, `libx264`/`libx265`.
- В Machine PATH НЕ добавлен (только User). Делать общесистемным нужно лишь при наличии
  других учёток Windows (требует прав администратора).
- Проверка: `ffmpeg -version` (первая строка) и `Get-Command ffmpeg`.

---

## 6. Markdown -> Word (.docx) через pandoc

- **Конвертер:** `pandoc` (ставится `winget install --id JohnMacFarlane.Pandoc -e --scope user`).
  Бинарь обычно в `C:\Users\<user>\AppData\Local\Pandoc\pandoc.exe` (после установки PATH
  обновляется только в НОВЫХ сессиях терминала -> в текущей вызывай по полному пути).
- **Базовая команда** (GitHub-flavored MD, с оглавлением):
  `pandoc <src.md> -f gfm -o <out.docx> --toc --toc-depth=2`
- **Грабли с кириллицей в консоли (cp1252, см. п.4):** кириллические ИМЕНА ФАЙЛОВ в команде
  превращаются в `???` и путь не находится. Обход: не печатать кириллицу в команде, а найти
  файл по ASCII-признаку и передавать pandoc объект `FileInfo.FullName`:
  ```
  $md = Get-ChildItem *.md | ? { Select-String $_.FullName -Pattern 'UNIQUE_ASCII' -SimpleMatch -Quiet } | select -First 1
  $docx = [IO.Path]::ChangeExtension($md.FullName,'.docx')
  & 'C:\Users\<user>\AppData\Local\Pandoc\pandoc.exe' $md.FullName -f gfm -o $docx --toc --toc-depth=2
  ```
  Признак (`UNIQUE_ASCII`) выбирай так, чтобы он встречался ТОЛЬКО в нужном файле
  (проверено: слишком общий признак цепляет лишние .md).
- **Проверка результата** (python-docx): число paragraphs/tables/headings.
  `python -m pip install python-docx -q` затем читать `Document(file)`.
- На этом ПК нет MS Word (COM недоступен) и не было pandoc до 2026-06-19 — теперь pandoc стоит.

---

## 7. Gemini Live API (голосовой ИИ) + грабли .env/кодировки на Windows

Опыт проекта IMMERSIVE-LANGUAGE-API (форк Immergo, иммерсивный иврит). Полезно для любого
проекта на Gemini Live API / google-genai на этом ПК.

**7.1. Vertex AI vs Gemini Developer API (ключ).** `google-genai` умеет оба режима одним SDK:
- Vertex: `genai.Client(vertexai=True, project=..., location=...)` — требует GCP-проект, billing,
  `gcloud auth application-default login`. Бюрократия.
- Developer API: `genai.Client(api_key=...)` — один ключ из https://aistudio.google.com, без GCP.
  Для личных проектов проще. Нейросеть та же; отличается только вход/оплата/квоты.
- Ключ нового формата AI Studio начинается с `AQ.A...` (классические были `AIza...`).

**7.2. Имя live-модели зависит от режима.** На developer-API актуальна `gemini-3.1-flash-live-preview`.
Vertex-имя `gemini-live-2.5-flash-native-audio` на developer-API устарело/не то. Модель задаётся
на сервере (`client.aio.live.connect(model=...)`), не на фронте.

**7.3. Поле `proactivity` не принимается developer-API.** Конфиг с `proactivity` (proactive audio)
валиден для Vertex, но на developer-API даёт `1007 Invalid JSON ... Unknown name "proactivity" at 'setup'`
и рвёт WebSocket -> голоса нет. Лечение: не слать это поле в setup. (Если Google отвергает ещё
какое-то поле — тот же `1007 Unknown name "X"`, убрать X аналогично.) На разговор proactivity не влияет.

**7.4. .env ДОЛЖЕН быть ASCII (Windows).** `starlette.Config(env_file=".env")` читает файл в кодировке
cp1252 -> кириллический комментарий в `.env` даёт `UnicodeDecodeError: 'charmap' ... byte 0x81` при
старте сервера. Правило: в `.env` и `.env.example` — только ASCII (комментарии по-английски).
Важно: `sys.stdout.reconfigure(utf-8)` тут НЕ спасает (он про вывод, а не про чтение env-файла при импорте).

**7.5. Эмодзи в print() стороннего кода (расширение п.4).** Многие Google/чужие модули печатают эмодзи
(`⚡️`,`🔧`,`💰`) в `print()`. На cp1252-консоли это `UnicodeEncodeError`, который может уронить
рабочий поток (напр. live-сессию). Не правя десятки print, лечится в начале своего main-модуля:
```python
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")
```
(или запуск с `PYTHONUTF8=1`). Это влияет только на вывод; данные/файлы не трогаем.

**7.6. Лимит длительности сессии.** В Immergo сессия жёстко обрывается по `SESSION_TIME_LIMIT`
(env, default 180с) через `asyncio.wait_for(run_session(), timeout=...)`. Это «обрыв по таймеру»,
а НЕ по токенам (лимита токенов в коде нет — он на стороне Google/квоты ключа). Расход токенов виден
только если включить логирование `response.usage_metadata` (печатает строку с числом токенов в консоль сервера).

---

## Как расширять

Новый пункт = новый раздел `## N. …` снизу, обновить дату вверху. Держи формулировки
короткими и проверенными на практике (фиксируй реальные грабли, а не теорию).
