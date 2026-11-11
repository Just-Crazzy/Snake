---

description: "Task list for feature implementation: Поэкранная прокрутка лендинга на desktop"
---

# Tasks: Поэкранная прокрутка лендинга на desktop

**Input**: Design documents from `specs/005-fullpage-scroll/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: автотестов нет (plan, Testing); проверка — сценарии [quickstart.md](./quickstart.md).

**Organization**: каркас хука → колесо и тачпад (MVP) → ссылки и адрес → клавиатура → mobile; задачи сгруппированы по user stories из spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно (разные файлы, нет зависимости от незавершённых задач)
- **[Story]**: к какой user story относится задача (US1–US4)
- Во всех файлах: без комментариев и `console.log` (constitution, принцип III)
- Большая часть задач правит один файл `src/shared/lib/useFullpageScroll.ts`, поэтому внутри него задачи идут строго по порядку

---

## Phase 1: Setup

Отдельной настройки не нужно: `gsap` 3.15 уже в `package.json`, плагины импортируются из пакета как `import { Observer } from 'gsap/Observer'` и `import { ScrollToPlugin } from 'gsap/ScrollToPlugin'` (типы `node_modules/gsap/types/Observer.d.ts` и `scroll-to-plugin.d.ts` есть, опции `ignoreCheck` и `autoKill` в них объявлены).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: экраны находятся по `id`, хук подключён к странице и умеет вычислять остановки и делать переход

**⚠️ CRITICAL**: задачи US1–US4 опираются на функции из T002–T004

- [X] T001 [P] В `src/pages/Hero/Hero.tsx` добавить `id="hero"` на корневой `<section className={cls.page}>` (contract §1). Больше ничего в файле не менять
- [X] T002 Создать `src/shared/lib/useFullpageScroll.ts` — каркас (research R12; contract §2):
  - `gsap.registerPlugin(Observer, ScrollToPlugin)` на уровне модуля;
  - константы `SCREEN_IDS = ['hero', 'team', 'benefits', 'join']` (порядок из data-model «Screen»), `DURATION = 0.8`, `QUIET = 0.3`, `EASE = 'power2.inOut'`;
  - тип `UseFullpageScrollOptions = { isEnabled?: boolean }`, сигнатура `useFullpageScroll({ isEnabled = true }: UseFullpageScrollOptions = {})`, ничего не возвращает;
  - `const { lang } = useParams<{ lang: Lang }>()`;
  - `useEffect` с зависимостями `[lang, isEnabled]`: `const mm = gsap.matchMedia()`; `mm.add({ desktop: '(min-width: 1025px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {…})`; внутри колбэка — выход, если `!ctx.conditions?.desktop`; `duration = ctx.conditions?.reduce ? 0 : DURATION`; колбэк возвращает функцию очистки; cleanup эффекта — `mm.revert()`;
  - внутри колбэка сохранить прежние `document.documentElement.style.scrollBehavior` и `history.scrollRestoration`, поставить `'auto'` и `'manual'` (research R6, R9), в функции очистки вернуть прежние значения
- [X] T003 В `src/shared/lib/useFullpageScroll.ts` добавить чистые функции остановок (research R3; data-model «Stop» — правила цитатой):
  - `getStops(): Stop[]`, где `type Stop = { y: number; screenId: string; kind: 'top' | 'bottom' }`. Для каждого `id` из `SCREEN_IDS`, у которого `document.getElementById(id)` существует: «У каждого экрана есть остановка `top`: `y = section.offsetTop`». «Если `section.offsetHeight > innerHeight + 1`, есть остановка `bottom`: `y = offsetTop + offsetHeight − innerHeight`». «Список отсортирован по `y`; `y` ограничен `0 … scrollHeight − innerHeight`»;
  - `getNearestIndex(stops)`: «Текущая остановка — ближайшая к `window.scrollY`»;
  - `getScreenTopIndex(stops, screenId)`: индекс остановки `top` нужного экрана или `-1`
- [X] T004 В `src/shared/lib/useFullpageScroll.ts` внутри колбэка `mm.add` добавить блокировку и переход (research R5, R13; data-model «TransitionLock», «Состояния»):
  - `let isLocked = false`; `const quietTimer = gsap.delayedCall(QUIET, () => { isLocked = false }).pause()`;
  - `isBlocked()`: `!isEnabled || isLocked || Boolean(document.querySelector('dialog[open]'))` (FR-014, research R7);
  - `goToIndex(index, instant = false)`: взять `getStops()`; выйти, если индекс вне `0 … stops.length − 1` (FR-006); при `!instant` выйти ещё и если индекс совпадает с `getNearestIndex(stops)`; `isLocked = true`; `gsap.to(window, { scrollTo: { y: stops[index].y, autoKill: false }, duration: instant ? 0 : duration, ease: EASE, onComplete })`; в `onComplete` — `quietTimer.restart(true)`;
  - `goToStep(step: 1 | -1)`: `if (isBlocked()) return`; `goToIndex(getNearestIndex(getStops()) + step)`;
  - `extendQuiet()`: если `isLocked` и переход уже завершён (таймер запущен) — `quietTimer.restart(true)`
- [X] T005 В `src/pages/Home/Home.tsx` импортировать `useFullpageScroll` из `./useFullpageScroll` и вызвать `useFullpageScroll()` в начале `Home` (contract §2). Разметку не менять. Зависит от T002

**Checkpoint**: `yarn build` проходит; на desktop поведение страницы пока не изменилось, кроме отключённой плавности `scroll-behavior`

---

## Phase 3: User Story 1 — Один шаг колеса переключает ровно один экран (Priority: P1) 🎯 MVP

**Goal**: колесо и тачпад перемещают окно ровно на одну остановку; высокий экран (Multi-tasks, 904px) имеет две остановки; инерция не делает второй переход

**Independent Test**: quickstart, сценарии 1, 2, 3

- [X] T006 [US1] В `src/shared/lib/useFullpageScroll.ts` внутри колбэка `mm.add` создать Observer (research R4, R7): `Observer.create({ target: window, type: 'wheel,touch', wheelSpeed: -1, tolerance: 10, preventDefault: true, ignoreCheck, onUp: () => goToStep(1), onDown: () => goToStep(-1), onChange: extendQuiet })`. `ignoreCheck(event)` возвращает `true`, если есть открытый `dialog[open]` и `event.target` — потомок этого диалога, но не сам диалог (тогда форма прокручивается сама, а затемнение — нет). В функции очистки `observer.kill()`, `quietTimer.kill()`. Зависит от T004
- [X] T007 [US1] Проверить направление на реализации (research R4): колесо вниз → `onUp` → следующая остановка. Если направление обратное — поменять местами `onUp` и `onDown` в `src/shared/lib/useFullpageScroll.ts`
- [X] T008 [US1] В `src/shared/lib/useFullpageScroll.ts` выравнивание при изменении размеров (FR-022; research R10): функция `align()` — если `!isLocked`, `goToIndex(getNearestIndex(getStops()), true)`; `ResizeObserver` на `document.body` и слушатель `resize` на `window` вызывают `align()`; при входе в колбэк `mm.add` один раз вызвать `align()` (US4 сценарий 3). В функции очистки `disconnect()` и `removeEventListener`

**Checkpoint**: сценарии 1, 2, 3 из quickstart проходят — это MVP

---

## Phase 4: User Story 2 — Ссылки и якоря открывают нужный экран (Priority: P2)

**Goal**: ссылки шапки, «Scroll to top» и прямые ссылки с якорем открывают нужный экран с той же анимацией; адрес показывает текущий экран

**Independent Test**: quickstart, сценарии 5 и 6

- [X] T009 [P] [US2] Создать `src/shared/lib/screenNavigation.ts` (contract §3; research R8): `const SCREEN_REQUEST = 'screen:request'`; `requestScreen(id: string)` — `const event = new CustomEvent(SCREEN_REQUEST, { detail: { id }, cancelable: true })`; `if (window.dispatchEvent(event))` — нативно: `document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })`. Экспорт `export { requestScreen, SCREEN_REQUEST };`
- [X] T010 [US2] Экспортировать `requestScreen` и `SCREEN_REQUEST` из `src/shared/lib/index.ts`. Зависит от T009
- [X] T011 [US2] В `src/widgets/Footer/Footer.tsx` заменить `onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}` на `onClick={() => requestScreen('hero')}`, импорт `requestScreen` из `@/shared/lib` (FR-010). Зависит от T010
- [X] T012 [US2] В `src/shared/lib/useFullpageScroll.ts` функция `goToScreen(screenId)`: `if (isBlocked()) return`; `const stops = getStops()`; `const index = getScreenTopIndex(stops, screenId)`; при `index >= 0` — `goToIndex(index)`. Слушатель `SCREEN_REQUEST` на `window`: если экран из `detail.id` есть в `SCREEN_IDS` — `event.preventDefault()` и `goToScreen(detail.id)` (contract §3, шаг 3). Удалить слушатель в очистке. Зависит от T010
- [X] T013 [US2] В `src/shared/lib/useFullpageScroll.ts` делегированный `click` на `document` (contract §4; research R9): `const link = (event.target as Element).closest('a[href^="#"]')`; выйти, если `link` нет; `hash = link.getAttribute('href')`; `'#'` и `'#hero'` → `'hero'`; `'#team'`, `'#benefits'`, `'#join'` → id без `#`; для них `event.preventDefault()` и `goToScreen(id)`; всё остальное, включая `'#joinUs'`, не трогать (FR-015). Удалить слушатель в очистке
- [X] T014 [US2] В `src/shared/lib/useFullpageScroll.ts` обновление адреса (FR-013; contract §5): функция `syncHash()` — хеш экрана текущей остановки (`screenId === 'hero'` → `''`, иначе `'#' + screenId`); если отличается от `location.hash` — `history.replaceState(null, '', location.pathname + location.search + hash)`. Вызывать в `onComplete` перехода из T004. Новые записи в историю не добавлять
- [X] T015 [US2] В `src/shared/lib/useFullpageScroll.ts` загрузка с якорем (FR-011; research R9, R10; data-model `pendingHash`): при входе в колбэк `mm.add` прочитать `location.hash`; если это `#team`, `#benefits` или `#join` — `pendingHash = id`; в `align()` из T008 сначала: если `pendingHash` и секция есть в DOM — `goToIndex(getScreenTopIndex(getStops(), pendingHash), true)` и `pendingHash = null`; неизвестный хеш → обычное выравнивание (Hero). Зависит от T008

**Checkpoint**: сценарии 5 и 6 из quickstart проходят, сценарии 1–3 не сломались

---

## Phase 5: User Story 3 — Клавиатура переключает экраны (Priority: P3)

**Goal**: стрелки, PageUp/PageDown, Space, Shift+Space, Home, End работают как колесо; поля формы не перехватываются

**Independent Test**: quickstart, сценарий 4

- [X] T016 [US3] В `src/shared/lib/useFullpageScroll.ts` слушатель `keydown` на `window` (FR-007, FR-008; research R11):
  - пропустить, если `document.querySelector('dialog[open]')`, или `event.target` подходит под `input, textarea, select, [contenteditable]`, или (для Space) под `button, a`;
  - `ArrowDown`, `PageDown`, `' '` без Shift → `goToStep(1)`; `ArrowUp`, `PageUp`, `' '` с Shift → `goToStep(-1)`; `Home` → `goToIndex(0)`; `End` → `goToIndex(getStops().length − 1)`; для `Home`/`End` сначала `if (isBlocked()) return`;
  - для обработанных клавиш — `event.preventDefault()`, чтобы не было нативной прокрутки;
  - удалить слушатель в очистке

**Checkpoint**: сценарий 4 из quickstart проходит

---

## Phase 6: User Story 4 — На mobile обычная прокрутка (Priority: P4)

**Goal**: на ширине ≤ 1024px режима нет; пересечение границы на лету без следов

**Independent Test**: quickstart, сценарий 7

- [X] T017 [US4] Проверить по `src/shared/lib/useFullpageScroll.ts`, что всё созданное в колбэке `mm.add` (Observer, `quietTimer`, `ResizeObserver`, слушатели `resize`, `click`, `keydown`, `SCREEN_REQUEST`, стили `scrollBehavior` и `scrollRestoration`) удаляется в его функции очистки, а активный `gsap.to(window, …)` создан внутри контекста и тоже отменяется (FR-017). Пройти quickstart, сценарий 7

**Checkpoint**: сценарий 7 из quickstart проходит

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: язык, «уменьшить движение», качество

- [ ] T018 Пройти quickstart, сценарии 8 (смена языка, FR-019) и 9 (`prefers-reduced-motion`, FR-018). Если при смене языка переход делается дважды — проверить зависимость `[lang, isEnabled]` в `src/shared/lib/useFullpageScroll.ts`
- [X] T019 [P] `yarn lint` без ошибок; проверить, что в `src/shared/lib/useFullpageScroll.ts`, `src/shared/lib/screenNavigation.ts` и изменённых файлах нет комментариев и `console.log` (принцип III)
- [X] T020 [P] `yarn build` без ошибок
- [ ] T021 Lighthouse desktop на `yarn preview` (SC-007; research R14): Performance ≥ 75; Accessibility, Best Practices, SEO ≥ 90. Если Best Practices < 90 из-за non-passive wheel — записать результат и решение в `specs/005-fullpage-scroll/research.md`, R14
- [ ] T022 Полный прогон `specs/005-fullpage-scroll/quickstart.md`, сценарии 1–10

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)** → все истории
- **US1 (Phase 3)** → MVP; US2 использует `align()` из T008 (для T015)
- **US2 (Phase 4)**, **US3 (Phase 5)**, **US4 (Phase 6)** — после US1, между собой независимы, но правят один файл, поэтому идут по очереди
- **Polish (Phase 7)** — после всех историй

### Within Each Phase

- T002 → T003 → T004 (один файл), T005 после T002
- T006 → T007 → T008
- T009 → T010 → T011 и T012; T012 → T013 → T014 → T015
- T016 после T004
- T017 после всех задач в `useFullpageScroll.ts`

### Parallel Opportunities

- Phase 2: T001 параллельно с T002–T004 (разные файлы)
- Phase 4: T009 можно начать сразу после Phase 2, параллельно с US1 (отдельный файл в `shared/lib`)
- Phase 7: T019 и T020

---

## Parallel Example: Phase 2 + US2

```bash
Task: "T001 Добавить id=\"hero\" в src/pages/Hero/Hero.tsx"
Task: "T002 Создать каркас src/shared/lib/useFullpageScroll.ts"
Task: "T009 Создать src/shared/lib/screenNavigation.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 2: T001–T005
2. Phase 3: T006–T008
3. **STOP and VALIDATE**: quickstart, сценарии 1–3 (колесо, тачпад, высокий экран)

### Incremental Delivery

1. MVP → коммит
2. US2: T009–T015 → сценарии 5–6 → коммит
3. US3: T016 → сценарий 4 → коммит
4. US4: T017 → сценарий 7 → коммит
5. Polish: T018–T022

---

## Notes

- Коммиты по схеме `${feature part} ${action}`, например `hook useFullpageScroll add`, `lib screenNavigation add`, `widget Footer update`
- Вёрстку экранов не менять (FR-020)
- Если на реализации `ignoreCheck` не даёт прокручивать форму (research R7) — зафиксировать в research и решить до T016

### Открыто после реализации (2026-11-10, см. research R14, R15)

- T018: смена языка возвращает на Hero — `LangSwitcher` перезагружает страницу без хеша (FR-019 не выполнен, нужна правка `src/widgets/HeaderNav/LangSwitcher.tsx`); `prefers-reduced-motion` в браузере не проверялся
- T021: SEO 83 < 90 из-за отсутствующего `meta description` и невалидного `robots.txt`, не связано с фичей; Best Practices 100, Accessibility 96
- T022: проверено синтетическими событиями в Chrome; нужен ручной прогон на настоящем тачпаде (сценарий 2) и с `prefers-reduced-motion` (сценарий 9)

### Изменение после реализации (2026-11-10)

- [X] T023 [US1] Убрать вторую остановку у высоких экранов в `src/shared/lib/useFullpageScroll.ts`: у каждого экрана одна остановка — верх секции. Удалены остановка `bottom` и поле `kind` у `Stop`; `getScreenStops` → `getScreenStop`, `getScreenTopIndex` → `getScreenIndex`. Документация: spec.md (Clarifications, US1 сценарии 7–8, Edge Cases, FR-002, FR-003; FR-022 и SC-008 удалены), research.md R2 и R3, data-model.md «Stop», quickstart.md сценарий 3. Описания T003 и T008 выше отражают первую версию
- Следствие: часть экрана ниже окна не видна; у Multiply with us это футер с «Scroll to top» на окнах ниже 724px (1440) и ниже 887px (1025) — research R2
