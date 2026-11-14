---
description: "Task list for feature 008-multibenefits-animation"
---

# Tasks: Анимация экрана Multi-benefits

**Input**: Design documents from `specs/008-multibenefits-animation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/multibenefits-animation.md](./contracts/multibenefits-animation.md), [quickstart.md](./quickstart.md)

**Tests**: Автотестов нет. Каждая фаза проверяется сценариями из [quickstart.md](./quickstart.md) вручную.

**Organization**: Задачи сгруппированы по историям из spec.md. В конце каждой фазы — `yarn lint` и `yarn build`, затем стоп до подтверждения.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно — другой файл, нет зависимости от незавершённых задач
- **[Story]**: история из spec.md (US1, US2, US3)
- Во всех файлах кода — без комментариев и `console.log` (constitution III)
- В `tsconfig.app.json` включён `noUnusedLocals`: каждая константа и функция добавляется в той задаче, где её сразу используют

---

## Phase 1: Setup (разметка и переменные змеи)

**Purpose**: data-атрибуты и CSS-переменные змеи со значениями конечного состояния. Вид экрана не меняется.

**Проверка**: `specs/008-multibenefits-animation/quickstart.md`, сценарий 1, пункт 6 (вид как на макете и как до изменений); сценарий 13.

- [X] T001 [P] В `src/pages/MultiBenefits/MultiBenefits.tsx` добавить атрибуты (contract, «Data-атрибуты»; research R4): `data-mb="label"` на `<h2 className={cls.label}>`, `data-mb="snake"` на `<div className={cls.container__content}>`, `data-mb="title"` на `<h3 className={cls.title}>`, `data-mb="text"` на `<p className={cls.description}>`, `data-mb="card"` на каждый `<article className={cls.card}>`. Классы, тексты, `Marquee` и разметку не менять
- [X] T002 [P] В `src/pages/MultiBenefits/MultiBenefits.module.scss` (research R5; data-model SnakeVariables): у `.container__content` объявить `--snake-x: 0px;` и `--snake-opacity: 1;`; в `&::before` добавить `transform: translateX(var(--snake-x));` и `opacity: var(--snake-opacity);`. Положение и размеры змеи не менять
- [X] T003 `yarn lint` и `yarn build` без новых ошибок; проверить сценарии фазы из `specs/008-multibenefits-animation/quickstart.md`. **Стоп, ждать подтверждения**

---

## Phase 2: Foundational (каркас хука и подключение)

**Purpose**: хук `useMultibenefitsAnimation` с `matchMedia`, `playedRef` и очисткой; `MultiBenefits` его вызывает. Анимаций пока нет.

**⚠️ CRITICAL**: фазы US1 и US3 не начинаются, пока эта фаза не закончена.

**Проверка**: `specs/008-multibenefits-animation/quickstart.md`, сценарий 6, пункт 2 (на 375 всё на местах), сценарий 7, пункт 1 (без ошибок в консоли), сценарий 13.

- [X] T004 Создать `src/shared/lib/useMultibenefitsAnimation.ts` (contract; research R11): импорты `useLayoutEffect`, `useRef` из `react`, `useParams`, `gsap`, `ScrollTrigger` из `gsap/ScrollTrigger`, типы `Lang`, `RefObject`; `gsap.registerPlugin(ScrollTrigger)`; `INTRO_QUERY = '(min-width: 577px) and (prefers-reduced-motion: no-preference)'`, `STILL_QUERY = '(max-width: 576px), (prefers-reduced-motion: reduce)'`; сигнатура `(scopeRef: RefObject<HTMLElement | null>, isReady: boolean) => void`; `playedRef = useRef(false)`; `useLayoutEffect` `[lang, isReady, scopeRef]`: выход при `!isReady || !scope`, `mm.add({ intro: INTRO_QUERY, still: STILL_QUERY }, () => { playedRef.current = true; }, scope)`, cleanup `mm.revert()`
- [X] T005 В `src/shared/lib/index.ts` добавить `export { useMultibenefitsAnimation } from './useMultibenefitsAnimation';` в алфавитном порядке. Зависит от T004
- [X] T006 В `src/pages/MultiBenefits/MultiBenefits.tsx`: импорт `useRef` и `useMultibenefitsAnimation` из `@/shared/lib`; `const sectionRef = useRef<HTMLElement>(null)`; `useMultibenefitsAnimation(sectionRef, Boolean(data))` до `if (loading) return null`; `ref={sectionRef}` на `<section id="benefits">`. Зависит от T005
- [X] T007 `yarn lint` и `yarn build` без новых ошибок; проверить сценарии фазы из `specs/008-multibenefits-animation/quickstart.md`. **Стоп, ждать подтверждения**

---

## Phase 3: User Story 1 — Блоки появляются при переходе на экран (Priority: P1) 🎯 MVP

**Goal**: при первом входе — надпись и заголовок, текст, змея, карточки; ≤ 1,5 с; один раз; по якорю — без появления; переход в любую сторону доводит появление до конца

**Independent Test**: `specs/008-multibenefits-animation/quickstart.md`, сценарии 1, 2, 3, 4, 8, 11

- [X] T008 [US1] В `src/shared/lib/useMultibenefitsAnimation.ts` константы (research R7): `INTRO_DURATION = 0.5`, `TEXT_DELAY = 0.15`, `INTRO_OVERLAP = 0.2`, `INTRO_STAGGER = 0.1`, `INTRO_OFFSET = 80`, `INTRO_EASE = 'power3.out'`, `ENTER_START = 'top 75%'`; селекторы `LABEL`, `TITLE`, `TEXT`, `SNAKE`, `CARD` по `data-mb`; функция `createIntro(scope: HTMLElement, onComplete: () => void)`: `gsap.timeline({ paused: true, onComplete })` с `fromTo(LABEL, autoAlpha 0→1, 0)`, `fromTo(TITLE, x -80→0 + autoAlpha, 0)`, `fromTo(TEXT, x -80→0 + autoAlpha, TEXT_DELAY)`, `fromTo(SNAKE, { '--snake-x': '80px', '--snake-opacity': 0 } → { '--snake-x': '0px', '--snake-opacity': 1 }, '>-0.2')`, `fromTo(CARD, x 80→0 + autoAlpha, stagger, '>-0.2')` (data-model AnimationTargets; итог 1,45 с)
- [X] T009 [US1] В `createIntro` в `src/shared/lib/useMultibenefitsAnimation.ts` вход (research R3): `ScrollTrigger.create({ trigger: scope, start: ENTER_START, once: true, onEnter: () => intro.play() })`, после создания `if (enter.progress > 0) intro.play()`
- [X] T010 [US1] В `createIntro` в `src/shared/lib/useMultibenefitsAnimation.ts` два наблюдателя (research R6): вниз — `start: 'top top', end: 'bottom top'`, `onUpdate`: `progress > 0 && intro.isActive()` → `intro.progress(1)`, та же проверка после создания; вверх — `start: 'top bottom', end: 'top top'`, `onUpdate`: `direction < 0 && intro.isActive()` → `intro.progress(1)` (FR-008)
- [X] T011 [US1] В callback `matchMedia` в `src/shared/lib/useMultibenefitsAnimation.ts`: `markPlayed`; `ctx.conditions?.intro && !playedRef.current` → `createIntro(scope, markPlayed)`, иначе `markPlayed()`
- [X] T012 [US1] Якорь в `src/shared/lib/useMultibenefitsAnimation.ts` (research R3; FR-009): `SCREEN_ID = 'benefits'`, `isOpenedOnScreen` по `SCREENS` из `@/shared/config` через `findIndex`, `const [isAnchored] = useState(isOpenedOnScreen)`, `playedRef = useRef(isAnchored)`
- [ ] T013 [US1] Проверить `specs/008-multibenefits-animation/quickstart.md`, сценарий 8: до появления у `[data-mb]` (кроме `snake`) `visibility: hidden`, в дереве доступности их нет (FR-002, FR-018). Исправления — в `src/shared/lib/useMultibenefitsAnimation.ts`
- [X] T014 [US1] `yarn lint` и `yarn build` без новых ошибок; проверить `specs/008-multibenefits-animation/quickstart.md`, сценарии 1, 2, 3, 4, 8, 11. **Стоп, ждать подтверждения**

---

## Phase 4: User Story 2 — Фоновая анимация на экране (Priority: P2)

**Goal**: на desktop за Multi-benefits виден общий фон; сетка фона стоит при «уменьшить движение» и до 576px

**Independent Test**: `specs/008-multibenefits-animation/quickstart.md`, сценарии 5, 6 (пункты 3–4), 9, 10

- [X] T015 [P] [US2] Создать `src/shared/lib/useGridMeshAnimation.ts` (contract `useGridMeshAnimation(maskRef)`; research R9): перенести из `src/widgets/Background/GridMesh.tsx` массив позиций и бесконечный timeline по `--x`/`--y` без изменений значений; обернуть в `useEffect` с `gsap.matchMedia()` и условием `'(min-width: 577px) and (prefers-reduced-motion: no-preference)'`; cleanup `mm.revert()`
- [X] T016 [P] [US2] В `src/pages/MultiBenefits/MultiBenefits.module.scss` у `.page` базовый `background` заменить на `transparent`; градиент в `@include max-media(1024)` оставить (research R8; FR-010, FR-012)
- [X] T017 [US2] В `src/shared/lib/index.ts` добавить `export { useGridMeshAnimation } from './useGridMeshAnimation';` в алфавитном порядке. Зависит от T015
- [X] T018 [US2] В `src/widgets/Background/GridMesh.tsx` удалить `useEffect` с timeline и импорт `gsap`, вызвать `useGridMeshAnimation(maskRef)` из `@/shared/lib`; разметку, inline-стили и SVG не менять. Зависит от T017
- [ ] T019 [US2] Проверить `specs/008-multibenefits-animation/quickstart.md`, сценарии 5, 6 (пункты 3–4), 9, 10. Исправления — в `src/shared/lib/useGridMeshAnimation.ts` и `src/pages/MultiBenefits/MultiBenefits.module.scss`
- [X] T020 [US2] `yarn lint` и `yarn build` без новых ошибок; проверить `specs/008-multibenefits-animation/quickstart.md`, сценарии 5, 6 (пункты 3–4), 9, 10. **Стоп, ждать подтверждения**

---

## Phase 5: User Story 3 — Без анимаций там, где они мешают (Priority: P3)

**Goal**: до 576px и при «уменьшить движение» всё сразу на местах; от 577px появление; смена языка и ширины не оставляет следов

**Independent Test**: `specs/008-multibenefits-animation/quickstart.md`, сценарии 6 и 7

- [X] T021 [US3] Проверить ветку `still` в `src/shared/lib/useMultibenefitsAnimation.ts`: ни timeline, ни ScrollTrigger, только `markPlayed()` (research R11; FR-014, FR-015)
- [ ] T022 [US3] Проверить `specs/008-multibenefits-animation/quickstart.md`, сценарий 6, пункты 1, 2, 5 (800, 375, смена ширины). Исправления — в `src/shared/lib/useMultibenefitsAnimation.ts`
- [ ] T023 [US3] Проверить `specs/008-multibenefits-animation/quickstart.md`, сценарий 7 (смена языка с перезагрузкой), в `src/shared/lib/useMultibenefitsAnimation.ts` (research R12; FR-017, FR-021)
- [X] T024 [US3] `yarn lint` и `yarn build` без новых ошибок; проверить `specs/008-multibenefits-animation/quickstart.md`, сценарии 6 и 7. **Стоп, ждать подтверждения**

---

## Phase 6: Polish & Cross-Cutting Concerns

**Проверка**: `specs/008-multibenefits-animation/quickstart.md`, сценарии 1–13

- [ ] T025 Замер Lighthouse (сценарий 12; research R13), результат записать в R13 `specs/008-multibenefits-animation/research.md`
- [ ] T026 Прогнать `specs/008-multibenefits-animation/quickstart.md`, сценарии 1–11 на итоговой сборке; расхождения исправить в файлах из задач выше
- [X] T027 Проверить отсутствие комментариев и `console.log` в `src/shared/lib/useMultibenefitsAnimation.ts`, `src/shared/lib/useGridMeshAnimation.ts`, `src/shared/lib/index.ts`, `src/widgets/Background/GridMesh.tsx`, `src/pages/MultiBenefits/MultiBenefits.tsx`, `src/pages/MultiBenefits/MultiBenefits.module.scss` (constitution III)
- [X] T028 `yarn lint` и `yarn build` без новых ошибок (`specs/008-multibenefits-animation/quickstart.md`, сценарий 13). **Стоп, ждать подтверждения**

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: без зависимостей
- **Foundational (Phase 2)**: после Setup
- **US1 (Phase 3)**: после Foundational
- **US2 (Phase 4)**: после Setup; от хука появления не зависит, правит свои файлы, кроме `src/shared/lib/index.ts` и `MultiBenefits.module.scss`, поэтому идёт после US1
- **US3 (Phase 5)**: после US1 и US2
- **Polish (Phase 6)**: после всех историй

### Parallel Opportunities

- Фаза 1: T001 (`MultiBenefits.tsx`) и T002 (`MultiBenefits.module.scss`)
- Фаза 4: T015 (`useGridMeshAnimation.ts`) и T016 (`MultiBenefits.module.scss`)

## Implementation Strategy

1. Setup → Foundational → US1 — это MVP (появление)
2. US2 → фон
3. US3 → mobile, reduce, язык и ширина
4. Polish → Lighthouse и полный прогон
