---
description: "Task list for feature 007-multitasks-animation"
---

# Tasks: Анимация экрана Multi-tasks

**Input**: Design documents from `specs/007-multitasks-animation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/multitasks-animation.md](./contracts/multitasks-animation.md), [quickstart.md](./quickstart.md)

**Tests**: Автотестов нет. Каждая фаза проверяется сценариями из [quickstart.md](./quickstart.md) вручную.

**Organization**: Задачи сгруппированы по историям из spec.md. В конце каждой фазы — `yarn lint` и `yarn build`, затем стоп до подтверждения.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно — другой файл, нет зависимости от незавершённых задач
- **[Story]**: история из spec.md (US1, US2, US3)
- Во всех файлах кода — без комментариев и `console.log` (constitution III)
- В `tsconfig.app.json` включён `noUnusedLocals`: функция или константа без использования ломает `yarn build`. Поэтому каждая константа и функция добавляется в той задаче, где её сразу используют

---

## Phase 1: Setup (разметка для анимации)

**Purpose**: data-атрибуты по контракту. Поведение и вид экрана не меняются.

**Проверка**: quickstart, сценарий 1, пункт 7 (экран выглядит как `mockup/multitasks.png` и как до изменений); сценарий 13.

- [X] T001 В `src/pages/MultiTasks/MultiTasks.tsx` добавить атрибуты (contract, «Data-атрибуты»; research R3): `data-mt="title"` на `<h2 className={cls.title}>`, `data-mt-group="snake"` на `<div className={cls.intro}>`, `data-mt="card"` на каждый `<article className={cls.card}>`. Классы, тексты, порядок и разметку не менять
- [X] T002 `yarn lint` и `yarn build` без новых ошибок; открыть `/en` на 1440 и 375, сравнить экран Multi-tasks с `specs/007-multitasks-animation/mockup/multitasks.png` — ничего не сдвинулось. **Стоп, ждать подтверждения**

**Checkpoint**: разметка готова, экран выглядит и работает как раньше

---

## Phase 2: Foundational (каркас хука и подключение)

**Purpose**: хук `useMultitasksAnimation` с `matchMedia`, `playedRef` и очисткой; `MultiTasks` его вызывает. Анимаций пока нет, блоки видны на всех ширинах.

**⚠️ CRITICAL**: фазы US1–US3 не начинаются, пока эта фаза не закончена.

**Проверка**: quickstart, сценарий 7, пункт 2 (на 375 всё на местах), сценарий 8, пункт 1 (смена языка без ошибок в консоли), сценарий 13; на 1440 экран Multi-tasks выглядит как до изменений.

- [X] T003 Создать `src/shared/lib/useMultitasksAnimation.ts` (contract `useMultitasksAnimation(scopeRef, isReady)`; data-model «Состояние хука»; research R6, R7, R12, R13):
  - импорты: `useLayoutEffect`, `useRef` из `react`; `useParams` из `react-router-dom`; `gsap` из `gsap`; `ScrollTrigger` из `gsap/ScrollTrigger`; `import type { Lang } from '@/shared/config'`; `import type { RefObject } from 'react'`;
  - `gsap.registerPlugin(ScrollTrigger)`;
  - константы условий: `INTRO_QUERY = '(min-width: 577px) and (prefers-reduced-motion: no-preference)'`, `EXIT_QUERY = '(min-width: 1025px) and (prefers-reduced-motion: no-preference)'`, `STILL_QUERY = '(max-width: 576px), (prefers-reduced-motion: reduce)'`;
  - сигнатура `(scopeRef: RefObject<HTMLElement | null>, isReady: boolean) => void`; `const { lang } = useParams<{ lang: Lang }>()`; `const playedRef = useRef(false)`;
  - `useLayoutEffect` с зависимостями `[lang, isReady, scopeRef]`: `const scope = scopeRef.current`; при `!isReady || !scope` — выход; `const mm = gsap.matchMedia()`; `mm.add({ intro: INTRO_QUERY, exit: EXIT_QUERY, still: STILL_QUERY }, () => { playedRef.current = true; }, scope)`; cleanup `() => mm.revert()`.
  Хук именно `useLayoutEffect`: в US1 начальное скрытое состояние ставит timeline появления, и оно должно примениться до первой отрисовки (research R6)
- [X] T004 В `src/shared/lib/index.ts` добавить `export { useMultitasksAnimation } from './useMultitasksAnimation';` после экспорта `useMarquee`, в алфавитном порядке с остальными. Зависит от T003
- [X] T005 В `src/pages/MultiTasks/MultiTasks.tsx` (contract, «Изменения в компонентах»; research R12): импорт `useRef` из `react` и `useMultitasksAnimation` из `@/shared/lib`; `const sectionRef = useRef<HTMLElement>(null)`; `useMultitasksAnimation(sectionRef, Boolean(data))` сразу после `useContent('tasks')`, до `if (loading) return null`; `ref={sectionRef}` на `<section id="team">`. Зависит от T004
- [X] T006 `yarn lint` и `yarn build` без новых ошибок; проверить сценарии фазы из `specs/007-multitasks-animation/quickstart.md`. **Стоп, ждать подтверждения**

**Checkpoint**: каркас работает, ошибок нет, экран как раньше

---

## Phase 3: User Story 1 — Блоки появляются при переходе на экран (Priority: P1) 🎯 MVP

**Goal**: при первом входе на Multi-tasks блок со змеёй прилетает слева вместе с проявлением заголовка, затем справа колонки карточек сверху вниз; один раз за загрузку; ≤ 1,5 с; по якорю — без появления; переход во время появления доводит его до конца

**Independent Test**: quickstart, сценарии 1, 2, 5, 6 (пункт 1), 9, 11

- [X] T007 [US1] В `src/shared/lib/useMultitasksAnimation.ts` добавить константы появления (research R5): `INTRO_DURATION = 0.5`, `INTRO_STAGGER = 0.1`, `INTRO_OVERLAP = 0.2`, `INTRO_OFFSET = 80`, `INTRO_EASE = 'power3.out'`, `ENTER_START = 'top 75%'`; селекторы `TITLE = '[data-mt="title"]'`, `SNAKE = '[data-mt-group="snake"]'`, `CARD = '[data-mt="card"]'`; и функцию `getCardColumns(scope: HTMLElement): HTMLElement[][]` (research R3; data-model CardColumns): взять `scope.querySelectorAll<HTMLElement>(CARD)`, сгруппировать в `Map` по `offsetLeft`, колонки отсортировать по возрастанию ключа (слева направо), карточки внутри колонки — по возрастанию `offsetTop` (сверху вниз). Не использовать `getBoundingClientRect` и индекс в разметке. Функция группировки перенесена сюда из фазы 2: без использования она нарушает `noUnusedLocals`
- [X] T008 [US1] В `src/shared/lib/useMultitasksAnimation.ts` функция `createIntro(scope: HTMLElement, onComplete: () => void)` (data-model IntroTimeline; research R4, R5): `gsap.timeline({ paused: true, onComplete })`; `.fromTo(SNAKE, { x: -INTRO_OFFSET, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: INTRO_DURATION, ease: INTRO_EASE }, 0)`; `.fromTo(TITLE, { autoAlpha: 0 }, { autoAlpha: 1, duration: INTRO_DURATION }, 0)`; затем для каждой колонки из `getCardColumns(scope)` по порядку `.fromTo(column, { x: INTRO_OFFSET, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: INTRO_DURATION, stagger: INTRO_STAGGER, ease: INTRO_EASE }, \`>-${INTRO_OVERLAP}\`)`. Появление меняет только `autoAlpha` и `x`; `immediateRender` не отключать — так скрытое состояние ставится сразу (research R6). Итог: 1,4 с на desktop (FR-006)
- [X] T009 [US1] В `createIntro` в `src/shared/lib/useMultitasksAnimation.ts` запуск при входе (research R2; data-model EnterTrigger): `const enter = ScrollTrigger.create({ trigger: scope, start: ENTER_START, once: true, onEnter: () => intro.play() })`; сразу после создания `if (enter.progress > 0) intro.play()` (FR-001; контент мог загрузиться, когда посетитель уже на экране)
- [X] T010 [US1] В `createIntro` в `src/shared/lib/useMultitasksAnimation.ts` наблюдатель досрочного завершения (research R9; data-model ExitWatcher): `const watcher = ScrollTrigger.create({ trigger: scope, start: 'top top', end: 'bottom top', onUpdate: (self) => { if (self.progress > 0 && intro.isActive()) intro.progress(1); } })`; сразу после создания `if (watcher.progress > 0) intro.progress(1)` (FR-010)
- [X] T011 [US1] В callback `matchMedia` в `src/shared/lib/useMultitasksAnimation.ts` заменить безусловное `playedRef.current = true`: функция `markPlayed = () => { playedRef.current = true; }`; если `ctx.conditions?.intro && !playedRef.current` — `createIntro(scope, markPlayed)`, иначе `markPlayed()`. Callback принимает `(ctx)`; сложность callback ≤ 5 (правило ESLint `complexity`), поэтому логика остаётся в `createIntro`
- [X] T012 [US1] Открытие по якорю в `src/shared/lib/useMultitasksAnimation.ts` (research R8; FR-011): импорт `useState` из `react` и `SCREENS` из `@/shared/config`; `const [initialHash] = useState(() => window.location.hash.slice(1))`; константа `SCREEN_ID = 'team'`; в начале `useLayoutEffect` после проверки `isReady`: если `SCREENS.indexOf(initialHash) >= SCREENS.indexOf(SCREEN_ID)` — `playedRef.current = true`. Пустой `hash` даёт `-1`, появление остаётся. Проверить quickstart 6, пункт 1
- [ ] T013 [US1] Проверить quickstart, сценарий 9: до появления у заголовка, блока со змеёй и карточек `visibility: hidden`, в DevTools → Accessibility их нет; в DevTools → Performance со скриншотами нет кадра, где блоки видны до начала появления (FR-002, FR-017; research R6). Исправления — в `src/shared/lib/useMultitasksAnimation.ts`
- [X] T014 [US1] `yarn lint` и `yarn build` без новых ошибок; проверить `specs/007-multitasks-animation/quickstart.md`, сценарии 1, 2, 5, 6 (пункт 1), 9, 11. **Стоп, ждать подтверждения**

**Checkpoint**: появление работает и проверяется отдельно — это MVP

---

## Phase 4: User Story 2 — Уход и возврат при переходе на следующий экран (Priority: P2)

**Goal**: от 1025px заголовок и блоки улетают вверх синхронно с переходом на следующий экран и возвращаются при обратном переходе; при переходе вверх на Hero не двигаются

**Independent Test**: quickstart, сценарии 3, 4, 6 (пункты 2–3), 10

- [X] T015 [US2] В `src/shared/lib/useMultitasksAnimation.ts` константы ухода (research R10; data-model AnimationTargets): `EXIT_TITLE = { yPercent: -300 }`, `EXIT_BLOCK = { yPercent: -100 }`; и функция `createExit(scope: HTMLElement)`: `gsap.timeline({ scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: true }, defaults: { ease: 'none' } })`; `.to(TITLE, EXIT_TITLE, 0)`; `.to(\`${SNAKE}, ${CARD}\`, EXIT_BLOCK, 0)`. Уход меняет только `yPercent` (research R4; FR-007, FR-008). `src/shared/lib/useFullpageScroll.ts` не трогать
- [X] T016 [US2] В callback `matchMedia` в `src/shared/lib/useMultitasksAnimation.ts` первой строкой: если `ctx.conditions?.exit` — `createExit(scope)`; уход создаётся независимо от `playedRef` (data-model ExitTimeline). Проверка появления остаётся после
- [ ] T017 [US2] Проверить quickstart, сценарии 3, 4 и 6 (пункты 2–3): уход и возврат синхронны с переходом, при переходе вверх на Hero блоки не двигаются (FR-009), открытие `/en#join` → подъём на Multi-tasks даёт опускание без появления. Если границы ScrollTrigger неверны после загрузки контента (уход начинается не с начала перехода), вызвать `ScrollTrigger.refresh()` после создания timeline в `src/shared/lib/useMultitasksAnimation.ts`
- [ ] T018 [US2] Проверить quickstart, сценарий 10 на 1025, 1280, 1440, 1920 и подобрать значения `EXIT_TITLE` и `EXIT_BLOCK` по виду (research R10), правки в `src/shared/lib/useMultitasksAnimation.ts`. Если появилась горизонтальная прокрутка — найти источник, `src/pages/MultiTasks/MultiTasks.module.scss` менять только с записью причины в research R11 (FR-012)
- [X] T019 [US2] `yarn lint` и `yarn build` без новых ошибок; проверить `specs/007-multitasks-animation/quickstart.md`, сценарии 3, 4, 6 (пункты 2–3), 10. **Стоп, ждать подтверждения**

**Checkpoint**: US1 и US2 работают вместе, уход проверяется отдельно

---

## Phase 5: User Story 3 — Без анимаций там, где они мешают (Priority: P3)

**Goal**: до 576px и при «уменьшить движение» всё сразу на местах; от 577 до 1024px только появление одной колонкой; смена языка и ширины не повторяет появление и не оставляет следов

**Independent Test**: quickstart, сценарии 7 и 8

- [X] T020 [US3] Проверить ветку `still` в callback `matchMedia` в `src/shared/lib/useMultitasksAnimation.ts`: при `ctx.conditions.still` не создаётся ни timeline, ни ScrollTrigger, вызывается только `markPlayed()`; `exit` при `still` не срабатывает, потому что условия взаимоисключающие (research R13; FR-014, FR-016)
- [ ] T021 [US3] Проверить quickstart, сценарий 7, пункты 1–3 (800, 375, reduce): на 800 `getCardColumns` даёт одну колонку, все карточки прилетают справа сверху вниз после блока со змеёй, ухода нет; на 375 и при reduce ничего не двигается (FR-014, FR-015, FR-016). Исправления — в `src/shared/lib/useMultitasksAnimation.ts`
- [ ] T022 [US3] Проверить quickstart, сценарий 8 и сценарий 7, пункт 4: смена языка и сужение окна 1440 → 800 → 375 → 1440 не повторяют появление, блоки на местах. Если появление повторяется — проверить, что `playedRef` выставляется до `mm.revert()` и что `useContent` при смене языка не размонтирует `MultiTasks` целиком, в `src/shared/lib/useMultitasksAnimation.ts` и `src/pages/MultiTasks/MultiTasks.tsx` (research R7, R12; FR-013, FR-018, FR-019)
- [X] T023 [US3] `yarn lint` и `yarn build` без новых ошибок; проверить `specs/007-multitasks-animation/quickstart.md`, сценарии 7 и 8. **Стоп, ждать подтверждения**

**Checkpoint**: все истории работают и проверены отдельно

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lighthouse, полный прогон и чистота кода

**Проверка**: quickstart, сценарии 1–13

- [ ] T024 Замер Lighthouse (quickstart, сценарий 12; research R14): `yarn build`, `yarn preview`, Desktop, Navigation, `/en`. Записать Performance, Accessibility, Best Practices, SEO в R14 `specs/007-multitasks-animation/research.md`. Если ниже порогов — найти причину и исправить в `src/shared/lib/useMultitasksAnimation.ts`, решение записать в R14
- [ ] T025 Прогнать `specs/007-multitasks-animation/quickstart.md`, сценарии 1–11 подряд на итоговой сборке; найденные расхождения исправить в файлах из задач выше и перепроверить сценарий
- [X] T026 Проверить отсутствие комментариев и `console.log` в `src/shared/lib/useMultitasksAnimation.ts`, `src/shared/lib/index.ts`, `src/pages/MultiTasks/MultiTasks.tsx` (constitution III)
- [X] T027 `yarn lint` и `yarn build` без новых ошибок (`specs/007-multitasks-animation/quickstart.md`, сценарий 13). **Стоп, ждать подтверждения**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: без зависимостей
- **Foundational (Phase 2)**: после Setup — хуку нужны data-атрибуты
- **US1 (Phase 3)**: после Foundational
- **US2 (Phase 4)**: после Foundational; от US1 по логике не зависит, но правит тот же файл `src/shared/lib/useMultitasksAnimation.ts`, поэтому делается после US1
- **US3 (Phase 5)**: после US1 и US2 — проверяет, что их ветки корректно выключаются
- **Polish (Phase 6)**: после всех историй

### Within Each Phase

- T003 → T004 → T005: экспорт нужен до импорта в `MultiTasks`
- Задачи внутри US1, US2, US3 — по порядку: все правят `src/shared/lib/useMultitasksAnimation.ts`

### Parallel Opportunities

- Параллельных задач нет. Фаза 1 — один файл; в фазе 2 файлы разные, но идут цепочкой (создание хука → экспорт → импорт); в фазах 3–6 логика живёт в одном файле `src/shared/lib/useMultitasksAnimation.ts`

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup → стоп
2. Phase 2: Foundational → стоп
3. Phase 3: US1 → стоп, проверить появление (quickstart 1, 2, 5, 6.1, 9, 11) — это MVP

### Incremental Delivery

1. Setup + Foundational → экран как раньше, каркас готов
2. US1 → появление
3. US2 → уход и возврат
4. US3 → mobile, reduce, смена языка и ширины
5. Polish → Lighthouse и полный прогон

Каждая фаза заканчивается `yarn lint`, `yarn build` и остановкой до подтверждения.
