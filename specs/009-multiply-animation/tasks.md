---
description: "Task list for feature 009-multiply-animation"
---

# Tasks: Анимация экрана Multiply with us

**Input**: Design documents from `specs/009-multiply-animation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/multiply-animation.md](./contracts/multiply-animation.md), [quickstart.md](./quickstart.md)

**Tests**: Автотестов нет. Каждая фаза проверяется сценариями из [quickstart.md](./quickstart.md) вручную.

**Organization**: Задачи сгруппированы по историям из spec.md. В конце каждой фазы — `yarn lint` и `yarn build`; фазы идут подряд без остановки.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно — другой файл, нет зависимости от незавершённых задач
- **[Story]**: история из spec.md (US1, US2, US3)
- Во всех файлах кода — без комментариев и `console.log` (constitution III)
- В `tsconfig.app.json` включён `noUnusedLocals`: каждая константа и функция добавляется в той задаче, где её сразу используют
- Задачи «Проверить … quickstart.md» — ручные, их выполняет пользователь в браузере

---

## Phase 1: Setup (разметка)

**Purpose**: data-атрибуты на целях появления. Вид экрана не меняется.

**Проверка**: quickstart, сценарий 1, пункт 7 (вид как на макете и как до изменений); сценарий 14.

- [X] T001 В `src/pages/MultiplyWithUs/MultiplyWithUs.tsx` добавить атрибуты (contract, «Data-атрибуты»; research R4): `data-mw="title"` на `<h2 className={cls.label}>` и на `<p className={cls.bottomLabel}>`, `data-mw="tab"` на каждый `<button className={tabClassName}>`, `data-mw="card"` на `<div className={cls.panel}>`, `data-mw="footer"` на `<div className={cls.footer}>`. Классы, тексты, логику вкладок и разметку не менять
- [X] T002 `yarn lint` и `yarn build` без новых ошибок

---

## Phase 2: Foundational (каркас хука и подключение)

**Purpose**: хук `useMultiplyAnimation` с `matchMedia`, `playedRef` и очисткой; `MultiplyWithUs` его вызывает и передаёт ref в секцию. Анимаций пока нет.

**⚠️ CRITICAL**: фазы US1 и US3 не начинаются, пока эта фаза не закончена.

**Проверка**: quickstart, сценарий 8, пункт 2 (на 375 всё видно); сценарий 9, пункт 1 (без ошибок в консоли); сценарий 14.

- [X] T003 Создать `src/shared/lib/useMultiplyAnimation.ts` (contract; research R11): импорты `useLayoutEffect`, `useRef` из `react`, `useParams` из `react-router-dom`, `gsap`, `ScrollTrigger` из `gsap/ScrollTrigger`, типы `Lang` из `@/shared/config` и `RefObject` из `react`; `gsap.registerPlugin(ScrollTrigger)`; `INTRO_QUERY = '(min-width: 577px) and (prefers-reduced-motion: no-preference)'`, `STILL_QUERY = '(max-width: 576px), (prefers-reduced-motion: reduce)'`; сигнатура `(scopeRef: RefObject<HTMLElement | null>, isReady: boolean) => void`; `playedRef = useRef(false)`; `useLayoutEffect` с `[lang, isReady, scopeRef]`: выход при `!isReady || !scope`, `mm.add({ intro: INTRO_QUERY, still: STILL_QUERY }, () => { playedRef.current = true; }, scope)`, cleanup `mm.revert()`
- [X] T004 В `src/shared/lib/index.ts` добавить `export { useMultiplyAnimation } from './useMultiplyAnimation';` между `useMarquee` и `useSwitchingWord`. Зависит от T003
- [X] T005 В `src/pages/MultiplyWithUs/MultiplyWithUs.tsx` (contract, «Изменения в компонентах»; research R1): импорт `useRef` из `react`, тип `Ref` из `react`, `useMultiplyAnimation` из `@/shared/lib`; в `MultiplyWithUsContentProps` добавить `ref: Ref<HTMLElement>`; в `MultiplyWithUsContent` принять `ref` и поставить `ref={ref}` на `<section id="join">`; во внешнем `MultiplyWithUs`: `const sectionRef = useRef<HTMLElement>(null)`, `useMultiplyAnimation(sectionRef, Boolean(data))` до `if (loading) return null`, `<MultiplyWithUsContent ref={sectionRef} items={data} />`. Зависит от T004
- [X] T006 `yarn lint` и `yarn build` без новых ошибок

---

## Phase 3: User Story 1 — Блоки проявляются при переходе на экран (Priority: P1) 🎯 MVP

**Goal**: при первом входе — заголовок, три кнопки сверху вниз, карточка с футером; только прозрачность; ≤ 1,5 с; один раз; по якорю `#join` — без появления; переход во время появления доводит его до конца

**Independent Test**: quickstart, сценарии 1, 2, 3, 4, 5, 11, 12

- [X] T007 [US1] В `src/shared/lib/useMultiplyAnimation.ts` константы (research R5): `INTRO_DURATION = 0.5`, `INTRO_STAGGER = 0.1`, `INTRO_OVERLAP = 0.2`, `ENTER_START = 'top 75%'`, `NEXT_POSITION = \`>-${INTRO_OVERLAP}\``; селекторы `TITLE`, `TAB`, `CARD`, `FOOTER` по `data-mw`; фабрики `hidden = () => ({ autoAlpha: 0 })` и `shown = (stagger = 0) => ({ autoAlpha: 1, duration: INTRO_DURATION, stagger })` (новый объект на каждый твин: `fromTo` дописывает служебные поля в `toVars`); функция `createIntro(scope: HTMLElement, onComplete: () => void)`: `gsap.timeline({ paused: true, onComplete })` с `fromTo(TITLE, hidden(), shown(), 0)`, `fromTo(TAB, hidden(), shown(INTRO_STAGGER), NEXT_POSITION)`, `fromTo(CARD, hidden(), shown(), NEXT_POSITION)`, `fromTo(FOOTER, hidden(), shown(), '<')`. Без `x`, `y`, `scale`, без явного `ease` (data-model AnimationTargets; итог 1,3 с)
- [X] T008 [US1] В `createIntro` в `src/shared/lib/useMultiplyAnimation.ts` вход (research R3): `ScrollTrigger.create({ trigger: scope, start: ENTER_START, once: true, onEnter: () => intro.play() })`, после создания `if (enter.progress > 0) intro.play()`
- [X] T009 [US1] В `createIntro` в `src/shared/lib/useMultiplyAnimation.ts` два наблюдателя (research R6): вниз — `start: 'top top', end: 'bottom top'`, `onUpdate`: `self.progress > 0 && intro.isActive()` → `intro.progress(1)`, та же проверка сразу после создания; вверх — `start: 'top bottom', end: 'top top'`, `onUpdate`: `self.direction < 0 && intro.isActive()` → `intro.progress(1)` (FR-009)
- [X] T010 [US1] В `createIntro` в `src/shared/lib/useMultiplyAnimation.ts` пересчёт границ (research R7): `const layoutObserver = new ResizeObserver(() => ScrollTrigger.refresh())`, `layoutObserver.observe(document.body)`, `createIntro` возвращает `() => layoutObserver.disconnect()`
- [X] T011 [US1] В callback `matchMedia` в `src/shared/lib/useMultiplyAnimation.ts`: `markPlayed`; `ctx.conditions?.intro && !playedRef.current` → `return createIntro(scope, markPlayed)` (cleanup уходит в `matchMedia`), иначе `markPlayed()` и `return undefined`
- [X] T012 [US1] Якорь в `src/shared/lib/useMultiplyAnimation.ts` (research R3; FR-010): `SCREEN_ID = 'join'`, `isOpenedOnScreen` по `SCREENS` из `@/shared/config` через `findIndex(...) >= SCREENS.indexOf(SCREEN_ID)`, `const [isAnchored] = useState(isOpenedOnScreen)`, `playedRef = useRef(isAnchored)`
- [ ] T013 [US1] Проверить quickstart, сценарии 1, 2, 3, 4, 5, 11, 12 (ручная проверка). Исправления — в `src/shared/lib/useMultiplyAnimation.ts`
- [X] T014 [US1] `yarn lint` и `yarn build` без новых ошибок

---

## Phase 4: User Story 2 — Фоновая анимация на экране (Priority: P2)

**Goal**: на desktop за Multiply with us виден общий фон, как у Hero; на ≤1024px остаётся градиент секции

**Independent Test**: quickstart, сценарий 7

- [X] T015 [US2] В `src/pages/MultiplyWithUs/MultiplyWithUs.module.scss` у `.page` базовый `background` заменить на `transparent`; блок `@include max-media(1024)` с градиентом `160deg` и `&::before` со змеёй не менять (research R8; FR-012, FR-013, FR-015). `src/widgets/Background/*` не трогать
- [ ] T016 [US2] Проверить quickstart, сценарий 7 (ручная проверка): сетка и подсветка видны, градиент как на `specs/009-multiply-animation/mockup/multiply.png`, на 800 — свой градиент секции. Исправления — в `src/pages/MultiplyWithUs/MultiplyWithUs.module.scss`
- [X] T017 [US2] `yarn lint` и `yarn build` без новых ошибок

---

## Phase 5: User Story 3 — Без анимаций там, где они мешают, и без скрытых ловушек (Priority: P3)

**Goal**: до 576px и при «уменьшить движение» всё сразу видно; прозрачные кнопки и ссылки не фокусируются и не кликаются; смена языка и ширины не оставляет следов

**Independent Test**: quickstart, сценарии 6, 8, 9, 10

- [X] T018 [US3] Проверить ветку `still` в `src/shared/lib/useMultiplyAnimation.ts`: ни timeline, ни ScrollTrigger, ни `ResizeObserver`, только `markPlayed()` (research R11; FR-016, FR-017)
- [X] T019 [US3] Проверить по коду, что `visibility` потомков целей не переопределяется: поиск `visibility` в `src/shared/ui`, `src/widgets/Footer`, `src/pages/MultiplyWithUs` пустой (research R10; FR-020)
- [ ] T020 [US3] Проверить quickstart, сценарии 6, 8, 9, 10 (ручная проверка). Исправления — в `src/shared/lib/useMultiplyAnimation.ts`
- [X] T021 [US3] `yarn lint` и `yarn build` без новых ошибок

---

## Phase 6: Polish & Cross-Cutting Concerns

**Проверка**: quickstart, сценарии 1–14

- [X] T022 Проверить отсутствие комментариев и `console.log` в `src/shared/lib/useMultiplyAnimation.ts`, `src/shared/lib/index.ts`, `src/pages/MultiplyWithUs/MultiplyWithUs.tsx`, `src/pages/MultiplyWithUs/MultiplyWithUs.module.scss` (constitution III)
- [ ] T023 Замер Lighthouse (quickstart, сценарий 13; research R15) — ручная проверка, результат записать в R15 `specs/009-multiply-animation/research.md`
- [ ] T024 Прогнать quickstart, сценарии 1–12 на итоговой сборке (ручная проверка); расхождения исправить в файлах из задач выше
- [X] T025 `yarn lint` и `yarn build` без новых ошибок (quickstart, сценарий 14)

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: без зависимостей
- **Foundational (Phase 2)**: после Setup (T005 правит тот же `MultiplyWithUs.tsx`, что T001)
- **US1 (Phase 3)**: после Foundational
- **US2 (Phase 4)**: от хука не зависит, правит только SCSS; можно делать сразу после Setup, но идёт после US1, чтобы проверять экран целиком
- **US3 (Phase 5)**: после US1 и US2
- **Polish (Phase 6)**: после всех историй

### Parallel Opportunities

- T015 (`MultiplyWithUs.module.scss`) можно делать параллельно с любой задачей фаз 2–3: другой файл, нет зависимостей
- Внутри фазы 3 все задачи правят один файл `useMultiplyAnimation.ts` — только последовательно

## Implementation Strategy

1. Setup → Foundational → US1 — это MVP (появление)
2. US2 → фон
3. US3 → mobile, reduce, фокус, язык и ширина
4. Polish → Lighthouse и полный прогон
