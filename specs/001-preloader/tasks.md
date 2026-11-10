---

description: "Task list for feature implementation: Прелоадер лендинга CPA"
---

# Tasks: Прелоадер лендинга CPA

**Input**: Design documents from `specs/001-preloader/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: автотестов нет (research R11); каждая фаза проверяется сценариями из [quickstart.md](./quickstart.md).

**Organization**: задачи сгруппированы по user stories из spec.md; номера историй совпадают со spec (US1–US5), фазы идут по приоритету: P1 → P2 → P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно (разные файлы, нет зависимости от незавершённых задач)
- **[Story]**: к какой user story относится задача (US1–US5)
- Во всех новых файлах: без комментариев и `console.log` (constitution, принцип III); размеры только в px, rem, em, % (принцип V)

---

## Phase 1: Setup

**Purpose**: каркас виджета, чтобы импорты и сборка работали с первого шага

- [X] T001 Создать каркас виджета: `src/widgets/Preloader/Preloader.tsx` (компонент `Preloader` с пропсами `lang: Lang`, `images: string[]`, `onDone: () => void` из [contracts/preloader-ui.md](./contracts/preloader-ui.md), пока возвращает `null`), `src/widgets/Preloader/index.ts` (`export { Preloader } from './Preloader';`, как в `src/widgets/Background/index.ts`) и добавить `export { Preloader } from './Preloader';` в `src/widgets/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: сетевой кэш и локальные тексты, на которые опираются все истории

**⚠️ CRITICAL**: работа над историями начинается только после этой фазы

- [X] T002 [P] Добавить в `src/shared/api/request.ts` необязательное поле `signal?: AbortSignal` в `RequestOptions` и передавать его в `fetch` (research R3, [contracts/content-prefetch.md](./contracts/content-prefetch.md))
- [X] T003 Создать `src/shared/api/contentCache.ts`: `Map` промисов по ключу `` `${lang}/${section}` `` и `Map` уже полученных данных; функция `loadContent(lang, section, signal?)` — возвращает промис из кэша или делает `getContent`, при ошибке удаляет ключ из кэша (data-model: «Промис с ошибкой удаляется из кэша; успешный остаётся до перезагрузки страницы»); функция `getCachedContent(lang, section)` — синхронно возвращает данные или `null`; функция `prefetchContent(lang, signal?)` — `Promise<void>`, ждёт `loadContent` для `'benefits'`, `'tasks'`, `'multiply'` (research R1, R2). Зависит от T002
- [X] T004 Переписать `src/shared/api/useContent.ts`: начальное состояние берётся из `getCachedContent(lang, section)` (если данные есть — `{ data, error: null, loading: false }`), запрос идёт через `loadContent` вместо `getContent`; возвращаемый объект `{ data, error, loading }` не меняется. Зависит от T003
- [X] T005 Экспортировать `prefetchContent` из `src/shared/api/index.ts`. Зависит от T003
- [X] T006 [P] Создать `src/shared/config/preloaderTexts.ts`: тип `PreloaderTexts = { loading: string; error: string; retry: string }` и `preloaderTexts: Record<Lang, PreloaderTexts>` для en (`'Loading'`, `'The server is not responding. Please try again.'`, `'Retry'`) и ru (`'Загрузка'`, `'Сервер не отвечает. Попробуйте ещё раз.'`, `'Повторить'`); экспортировать `preloaderTexts` и тип из `src/shared/config/index.ts` (research R10)

**Checkpoint**: `yarn build` проходит; сайт работает как раньше (секции получают данные через кэш)

---

## Phase 3: User Story 1 — Ожидание при холодном старте сервера (Priority: P1) 🎯 MVP

**Goal**: на экранах от 576px первым кадром виден прелоадер, линия и число плавно растут к 90%, после готовности ресурсов и данных — 100%, растворение и первый экран целиком с данными

**Independent Test**: quickstart, сценарии 1 и 7

- [X] T007 [P] [US1] Свёрстать `src/widgets/Preloader/Preloader.module.scss` по [mockup/preloader.png](./mockup/preloader.png) (макет 1440×900): корень `position: fixed; inset: 0`, `z-index` выше шапки (у `.header` в `src/pages/Home/Home.module.scss` — 100), прозрачный фон (под ним `Background`, research R7), содержимое по центру; логотип в той же позиции, что логотип шапки (отступ `rem(48)` и `max-width: rem($maxWidth)`, как у `.header`); число процентов шрифтом Halvar Breitschrift по макету; дорожка линии шириной 576px из 1440 (≈40% экрана), высотой ~20px, светлая, со скруглёнными краями; заполнение жёлтое, со скруглёнными краями, `min-width` равен высоте линии (жёлтая точка на 0% по макету)
- [X] T008 [P] [US1] Создать `src/widgets/Preloader/useProgressLine.ts` (research R5, R9): принимает ref-ы корня, заполнения и числа; держит прокси `{ value: 0 }`; все твины внутри `gsap.context()`, `ctx.revert()` в cleanup; `startWaiting()` — твин `value → 90`, `duration: 40`, `ease: 'power3.out'`; `finish(onComplete)` — убивает твин ожидания, твин `value → 100` за 0,4 с, затем `opacity` корня → 0 за 0,3 с, затем `onComplete`; в `onUpdate` напрямую через ref: ширина заполнения `${value}%`, текст `${Math.round(value)}%` и атрибут `aria-valuenow` (только когда округлённое значение изменилось); значение только растёт (data-model: «Только растёт (FR-006); в `loading` не больше 90 (FR-005); 100 только в `finishing`»); при `prefers-reduced-motion: reduce` все длительности 0
- [X] T009 [P] [US1] Создать `src/widgets/Preloader/usePreloaderStatus.ts` (data-model: PreloaderStatus, LoadReadiness; research R3, R4): принимает `lang` и `images`; `assetsReady` — `document.fonts.ready` и загрузка каждого URL из `images` через `new Image()`, где ошибка загрузки тоже считается готовностью; `contentReady` — `prefetchContent(lang, controller.signal)`, при ошибке до дедлайна новая попытка через 3 с; статус `'loading'` → `'finishing'`, когда обе готовности `true`; при размонтировании отменить `AbortController` и таймеры; возвращает `{ status }`
- [X] T010 [US1] Реализовать разметку в `src/widgets/Preloader/Preloader.tsx`: корень с `role="progressbar"`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-label={preloaderTexts[lang].loading}`, `aria-busy="true"` (FR-016); логотип — декоративный `@public/icons/mask.svg?react` с `aria-hidden`, а не `Logo` из `shared/ui` (тот — ссылка и получал бы фокус); число и линия с `aria-hidden`; при монтировании удалить `document.getElementById('preloader-shell')`; подключить `usePreloaderStatus` и `useProgressLine`: на монтировании `startWaiting()`, при статусе `'finishing'` — `finish(onDone)`. Зависит от T007, T008, T009
- [X] T011 [P] [US1] Добавить в `src/pages/Home/Home.module.scss` класс скрытого контента с `visibility: hidden` (research R7)
- [X] T012 [US1] Подключить прелоадер в `src/pages/Home/Home.tsx`: `showPreloader` вычислить один раз при первом рендере через `useState(() => window.matchMedia('(min-width: 576px)').matches)` (Edge Cases: решение по ширине в момент открытия); состояние `isDone`; шапку, секции и `ApplicationModal` обернуть в контейнер с классом из T011, пока `showPreloader && !isDone`, а `Background` оставить вне обёртки; рендерить `<Preloader lang={lang} images={[snakeHero]} onDone={() => setIsDone(true)} />`, где `snakeHero` — `@public/img/snake-hero.png`, а `lang` — из `useParams`; если `showPreloader === false`, в эффекте удалить `#preloader-shell`. Зависит от T010, T011
- [X] T013 [P] [US1] Добавить статичную оболочку в `src/index.html` (research R6): внутри `<body>` до `#root` блок `<div id="preloader-shell">` с инлайн-стилями — `position: fixed; inset: 0`, тот же `z-index`, что у прелоадера, фон `linear-gradient(111deg, #DC8400 -5%, #560080 50%, #220032 95%)`, по центру «0%» и пустая дорожка в размерах из T007; в `<style>` в `<head>` правило `@media (max-width: 575.98px) { #preloader-shell { display: none; } }`; `<link rel="preload" as="font" type="font/woff2" crossorigin>` на начертание Halvar Breitschrift, которым набрано число (путь проверить в `dist/fonts` после `yarn build`)

**Checkpoint**: сценарии 1 и 7 из quickstart проходят — это MVP

---

## Phase 4: User Story 2 — Быстрая загрузка без мигания (Priority: P2)

**Goal**: при прогретом сервере прелоадер виден не меньше 1 секунды, а линия доходит до 100% одним плавным движением

**Independent Test**: quickstart, сценарий 2

- [X] T014 [US2] В `src/widgets/Preloader/useProgressLine.ts` запомнить время старта и в `finish()` отложить твин к 100% до 0,6 с от показа (`gsap.delayedCall` на оставшееся время), чтобы 0,6 + 0,4 с давали минимум 1 с до растворения (FR-008, research R5); твин к 100% идёт от текущего значения, без скачка

**Checkpoint**: сценарий 2 проходит, US1 не сломалась

---

## Phase 5: User Story 3 — Защита страницы под прелоадером (Priority: P2)

**Goal**: пока прелоадер виден, страница не прокручивается, ничего под ним не нажимается и не выделяется

**Independent Test**: quickstart, сценарий 3

- [X] T015 [US3] В `src/widgets/Preloader/Preloader.tsx` при монтировании ставить `document.documentElement.style.overflow = 'hidden'` и восстанавливать прежнее значение в cleanup эффекта (FR-010)
- [X] T016 [P] [US3] В `src/widgets/Preloader/Preloader.module.scss` добавить на корень `user-select: none` и `-webkit-user-select: none`, на изображения и SVG — `-webkit-user-drag: none` и `pointer-events: none` (FR-011)

**Checkpoint**: сценарий 3 проходит

---

## Phase 6: User Story 5 — Сервер так и не ответил (Priority: P2)

**Goal**: если за 60 секунд нет ответа, видно сообщение и кнопка «Повторить»; повтор продолжает загрузку без отката линии

**Independent Test**: quickstart, сценарии 5 и 6

- [X] T017 [US5] В `src/widgets/Preloader/usePreloaderStatus.ts` добавить дедлайн 60 с от монтирования: если к нему `contentReady` или `assetsReady` ещё `false` — отменить текущий `AbortController`, остановить повторы и перейти в `'error'`; добавить `retry()`: новый `AbortController`, новый дедлайн 60 с, статус `'loading'`, `assetsReady` не сбрасывается; возвращать `{ status, retry }` (FR-015, FR-015a; data-model: переходы `loading → error → loading`)
- [X] T018 [US5] В `src/widgets/Preloader/useProgressLine.ts` добавить `pause()`, которая убивает твин ожидания и оставляет `value` на месте; `startWaiting()` должна продолжать от текущего `value` к 90, а не с нуля (FR-006, FR-015a)
- [X] T019 [US5] В `src/widgets/Preloader/Preloader.tsx` при статусе `'error'` вызвать `pause()` и показать под линией текст `preloaderTexts[lang].error` с `role="alert"` и кнопку `Button` из `@/shared/ui` с текстом `preloaderTexts[lang].retry`, по нажатию `retry()` и `startWaiting()`; при появлении кнопки перевести на неё фокус через ref. Зависит от T017, T018
- [X] T020 [P] [US5] В `src/widgets/Preloader/Preloader.module.scss` стили сообщения и кнопки: по центру под линией, шрифт сайта (макета для ошибки нет — в стиле остальной типографики)

**Checkpoint**: сценарии 5 и 6 проходят

---

## Phase 7: User Story 4 — Переход по ссылке на якорь (Priority: P3)

**Goal**: после прелоадера страница открывается на секции из якоря ссылки

**Independent Test**: quickstart, сценарий 4

- [X] T021 [US4] В `src/pages/Home/Home.tsx` после `isDone === true` (эффект от `isDone`) прокрутить к секции якоря: `document.getElementById(window.location.hash.slice(1))?.scrollIntoView()`, если хэш есть (FR-012). `#joinUs` сюда не попадает: его на загрузке уже очищает `useHashModal`

**Checkpoint**: сценарий 4 проходит

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T022 Проверить, что в `src/widgets/Preloader/`, `src/shared/api/contentCache.ts`, `src/shared/config/preloaderTexts.ts` нет комментариев и `console.log`; `yarn lint` без ошибок
- [X] T023 `yarn build` без ошибок TypeScript
- [ ] T024 Пройти сценарии 8, 9, 10 из [quickstart.md](./quickstart.md) (смена языка, «уменьшить движение», VoiceOver) и повторно 1–7
- [ ] T025 Lighthouse desktop на `yarn preview` при прогретом сервере: Performance ≥ 75; Accessibility, Best Practices, SEO ≥ 90 (SC-006); если Performance ниже — сократить растворение и фазу завершения в `src/widgets/Preloader/useProgressLine.ts` (research R8)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **US1 (Phase 3)**
- **US2, US3, US5 (Phases 4–6)** зависят от US1: дорабатывают те же файлы виджета; между собой независимы, но правят общие `useProgressLine.ts` и `Preloader.tsx`, поэтому удобнее по очереди
- **US4 (Phase 7)** зависит только от US1 (`Home.tsx`)
- **Polish (Phase 8)** — после всех историй

### Within User Story 1

- T007, T008, T009, T011, T013 — параллельно
- T010 после T007, T008, T009
- T012 после T010 и T011

### Parallel Opportunities

- Phase 2: T002 и T006
- Phase 3: T007, T008, T009, T011, T013
- Phase 5: T016 параллельно с T015
- Phase 6: T020 параллельно с T017–T019
- Phase 7 можно делать сразу после US1, параллельно с Phases 4–6

---

## Parallel Example: User Story 1

```text
Task: "T007 Свёрстать src/widgets/Preloader/Preloader.module.scss по макету"
Task: "T008 Создать src/widgets/Preloader/useProgressLine.ts"
Task: "T009 Создать src/widgets/Preloader/usePreloaderStatus.ts"
Task: "T011 Класс скрытого контента в src/pages/Home/Home.module.scss"
Task: "T013 Статичная оболочка в src/index.html"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2
2. Phase 3 (US1)
3. **STOP and VALIDATE**: quickstart, сценарии 1 и 7
4. Коммит

### Incremental Delivery

1. US1 → сценарии 1, 7 → коммит
2. US2 → сценарий 2 → коммит
3. US3 → сценарий 3 → коммит
4. US5 → сценарии 5, 6 → коммит
5. US4 → сценарий 4 → коммит
6. Polish → lint, build, Lighthouse

---

## Notes

- [P] — разные файлы, нет зависимостей от незавершённых задач
- Коммиты в ветке `feature/preloader` по схеме `${часть фичи} ${действие}`, например `preloader widget add`
- После каждой фазы — её сценарий из quickstart
