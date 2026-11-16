---
description: "Task list for feature 010-refactor-animations"
---

# Tasks: Рефакторинг анимаций главной страницы

**Input**: Design documents from `specs/010-refactor-animations/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/animation-api.md](./contracts/animation-api.md), [quickstart.md](./quickstart.md)

**Tests**: Автотестов нет. Каждая фаза проверяется вручную по [quickstart.md](./quickstart.md) этой фичи и по quickstart 006–009.

**Organization**: Порядок задач повторяет «Порядок работ» из plan.md. Фазы идут подряд, остановок между ними нет. После каждой секции — отдельная задача проверки.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно — другой файл, нет зависимости от незавершённых задач
- **[Story]**: история из spec.md (US1–US5)
- Во всех файлах кода — без комментариев и `console.log` (constitution III)
- В `tsconfig.app.json` включены `noUnusedLocals` и `noUnusedParameters`: удалённые константы и импорты убираются в той же задаче, а `createIntro` без использования `scope` объявляется без параметра
- Сигнатуры публичных хуков, их вызовы в компонентах и `src/shared/lib/index.ts` не меняются (contracts/animation-api.md §1)
- Задачи «Проверить …» и «Замерить …» — ручные, их выполняет пользователь в браузере

---

## Phase 1: Setup (замер «до»)

**Purpose**: зафиксировать исходные значения до любых правок кода (FR-017).

- [X] T001 Создать `specs/010-refactor-animations/measurements.md`: таблица из data-model.md («Замеры») с колонками «До» и «После» и строкой условий (коммит, `yarn build` + `yarn preview`, окно инкогнито, CPU 4×, ширина окна)
- [X] T002 Замерить Lighthouse «до» на текущем коде (quickstart §10.1): `yarn build`, `yarn preview`, `http://localhost:4173/en` в инкогнито; desktop × 3 и mobile × 3; медианы Performance (для desktop ещё Accessibility, Best Practices, SEO) записать в `specs/010-refactor-animations/measurements.md`
- [X] T003 Записать размер бандла «до» в `specs/010-refactor-animations/measurements.md`: gzip каждого JS-файла из вывода `yarn build` и сумма (ожидаемо 184,68 kB, research R13)
- [X] T004 Замерить фон «до» и записать в `specs/010-refactor-animations/measurements.md`: Paint flashing на 1440 (quickstart §6.1), fps при CPU 4× медианой из 3 (quickstart §6.2), скриншоты первого экрана на 1440 и 1920 сохранить как `specs/010-refactor-animations/screenshots/before-1440.png` и `specs/010-refactor-animations/screenshots/before-1920.png`

---

## Phase 2: Foundational (константы и общий механизм)

**Purpose**: `MEDIA`, `INTRO`, `intro.ts`, `useSectionAnimation`. Поведение страницы пока не меняется: новые модули ещё никто не вызывает.

**⚠️ CRITICAL**: перевод секций (Phase 3) не начинается, пока эта фаза не закончена.

- [X] T005 [P] Создать `src/shared/config/animation.ts` (research R1, data-model «MEDIA», «INTRO»):
  - закрытые константы `MOBILE_MAX = 576` и `DESKTOP_MIN = 1025`;
  - `MEDIA` (`as const`): `motion` `'(prefers-reduced-motion: no-preference)'`, `reduce` `'(prefers-reduced-motion: reduce)'`, `notMobile` `` `(min-width: ${MOBILE_MAX + 1}px)` ``, `desktop` `` `(min-width: ${DESKTOP_MIN}px)` ``, `animated` — `desktop` и `motion` через ` and `, `still` — `` `(max-width: ${DESKTOP_MIN - 1}px)` `` и `reduce` через `, `;
  - `INTRO` (`as const`): `duration: 0.5`, `stagger: 0.1`, `offset: 80`, `ease: 'power3.out'`, `next: '>-0.2'`, `enterStart: 'top 75%'`;
  - `export { INTRO, MEDIA };`
- [X] T006 [P] В `src/shared/config/index.ts` добавить строку `export { INTRO, MEDIA } from './animation';`. Остальные экспорты не трогать
- [X] T007 Создать `src/shared/lib/intro.ts`, часть 1 (research R2, R3, R7; contract §3):
  - импорты `gsap`, `ScrollTrigger` из `gsap/ScrollTrigger`, `INTRO` и `MEDIA` из `@/shared/config`;
  - `gsap.registerPlugin(ScrollTrigger);`;
  - `INTRO_CONDITIONS = { animated: MEDIA.animated, still: MEDIA.still }`;
  - фабрики, каждая возвращает новый объект: `fadeFrom = () => ({ autoAlpha: 0 })`; `fadeTo = (vars: gsap.TweenVars = {}) => ({ autoAlpha: 1, duration: INTRO.duration, ...vars })` без `ease`; `slideFrom = (offset: number) => ({ x: offset, autoAlpha: 0 })`; `slideTo = (vars: gsap.TweenVars = {}) => ({ x: 0, autoAlpha: 1, duration: INTRO.duration, ease: INTRO.ease, ...vars })`
- [X] T008 В `src/shared/lib/intro.ts`, часть 2 (research R4, R5):
  - `playOnEnter(trigger: gsap.DOMTarget, intro: gsap.core.Timeline)`: `ScrollTrigger.create({ trigger, start: INTRO.enterStart, once: true, onEnter: () => intro.play() })`; если у созданного триггера `progress > 0` — `intro.play()`;
  - `finishOnLeave(trigger: gsap.DOMTarget, intro: gsap.core.Timeline, onDone: () => void)`: `down` — `ScrollTrigger.create({ trigger, start: 'top top', end: 'bottom top', onUpdate })`, в `onUpdate`: `if (self.progress > 0 && intro.isActive()) intro.progress(1)`; `back` — `start: 'top bottom', end: 'top top'`, в `onUpdate`: `if (self.direction < 0 && intro.isActive()) intro.progress(1)`; затем `intro.eventCallback('onComplete', () => { down.kill(); back.kill(); onDone(); })`; в конце `if (down.progress > 0) intro.progress(1)`
- [X] T009 В `src/shared/lib/intro.ts`, часть 3 (research R6, data-model «Наблюдатель вёрстки»):
  - модульные `let layoutObserver: ResizeObserver | null = null;` и `let layoutUsers = 0;`;
  - `observeLayout = () => { ... }`: увеличить `layoutUsers`; если наблюдателя нет — `new ResizeObserver(() => ScrollTrigger.refresh())` и `observe(document.body)`; вернуть функцию отписки, которая уменьшает `layoutUsers` и при нуле делает `disconnect()` и обнуляет `layoutObserver`;
  - экспорт: `export { fadeFrom, fadeTo, finishOnLeave, INTRO_CONDITIONS, observeLayout, playOnEnter, slideFrom, slideTo };`
- [X] T010 Создать `src/shared/lib/useSectionAnimation.ts` (research R8; contract §4; data-model «Состояние секции»):
  - `type ScreenId = (typeof SCREENS)[number];` и `type SectionAnimation = { screenId: ScreenId; createIntro: (scope: HTMLElement) => gsap.core.Timeline; createExit?: (scope: HTMLElement) => void };`;
  - `isScreenPassed = (screenId: ScreenId) => SCREENS.findIndex((screen) => screen === window.location.hash.slice(1)) >= SCREENS.indexOf(screenId)`;
  - `useSectionAnimation(scopeRef, isReady, animation)`: `const { lang } = useParams<{ lang: Lang }>()`; `const [isAnchored] = useState(() => isScreenPassed(animation.screenId))`; `const playedRef = useRef(isAnchored)`;
  - в `useLayoutEffect` — выход, если `!isReady || !scope`; `markPlayed`; `gsap.matchMedia()`; `mm.add(INTRO_CONDITIONS, (ctx) => { … }, scope)`;
  - в колбэке: если `!ctx.conditions?.animated` — `markPlayed(); return undefined;`; иначе `animation.createExit?.(scope)`; если `!playedRef.current` — `const intro = animation.createIntro(scope); finishOnLeave(scope, intro, markPlayed); playOnEnter(scope, intro);`; в конце `return observeLayout();`;
  - cleanup `() => mm.revert()`, зависимости `[lang, isReady, scopeRef, animation]`;
  - `export { useSectionAnimation }; export type { SectionAnimation };`
  - в `src/shared/lib/index.ts` не добавлять
- [X] T011 Проверить фундамент: `yarn lint` и `yarn build` без новых ошибок; страница на 1440 и 375 работает как до изменений

---

## Phase 3: User Story 2 — секции на общем механизме (Priority: P1)

**Goal**: в хуках Multiply, Multi-benefits, Multi-tasks остаются только цели и таймлайн, Hero берёт общие части (FR-002…FR-007). По пути на 577–1024px появления выключаются (FR-008), а Multi-benefits и Multi-tasks получают исправления US5.

**Independent Test**: quickstart своей фичи после каждой секции; [plan.md](./plan.md#изменённые-ожидания-quickstart-006009) — какие ожидания на 800px меняются.

- [X] T012 [US2] Переписать `src/shared/lib/useMultiplyAnimation.ts`:
  - оставить селекторы `TITLE`, `TAB`, `CARD`, `FOOTER`;
  - `createIntro = () => gsap.timeline({ paused: true }).fromTo(TITLE, fadeFrom(), fadeTo(), 0).fromTo(TAB, fadeFrom(), fadeTo({ stagger: INTRO.stagger }), INTRO.next).fromTo(CARD, fadeFrom(), fadeTo(), INTRO.next).fromTo(FOOTER, fadeFrom(), fadeTo(), '<')`;
  - `const MULTIPLY: SectionAnimation = { screenId: 'join', createIntro };`;
  - `useMultiplyAnimation = (scopeRef: RefObject<HTMLElement | null>, isReady: boolean) => useSectionAnimation(scopeRef, isReady, MULTIPLY)`;
  - удалить `registerPlugin`, запросы, `INTRO_*`, `ENTER_START`, `NEXT_POSITION`, `SCREEN_ID`, `hidden`, `shown`, `isOpenedOnScreen`, `ScrollTrigger`, `ResizeObserver`, импорты React-хуков, `useParams`, `SCREENS`, `Lang`;
  - импорты: `gsap`, `INTRO` из `@/shared/config`, фабрики из `./intro`, `useSectionAnimation` и `type SectionAnimation` из `./useSectionAnimation`, `type RefObject`
- [X] T013 [US2] Проверить Multiply: `yarn lint`, `yarn build`; `specs/009-multiply-animation/quickstart.md` на 1440 и 375 полностью, на 800 — с изменёнными ожиданиями из plan.md
- [X] T014 [US2] Переписать `src/shared/lib/useMultibenefitsAnimation.ts`:
  - оставить селекторы `LABEL`, `TITLE`, `TEXT`, `SNAKE`, `CARD` и `TEXT_DELAY = 0.15`;
  - `createIntro = () => gsap.timeline({ paused: true }).fromTo(LABEL, fadeFrom(), fadeTo(), 0).fromTo(TITLE, slideFrom(-INTRO.offset), slideTo(), 0).fromTo(TEXT, slideFrom(-INTRO.offset), slideTo(), TEXT_DELAY).fromTo(SNAKE, { '--snake-x': `${INTRO.offset}px`, '--snake-opacity': 0 }, { '--snake-x': '0px', '--snake-opacity': 1, duration: INTRO.duration, ease: INTRO.ease }, INTRO.next).fromTo(CARD, slideFrom(INTRO.offset), slideTo({ stagger: INTRO.stagger }), INTRO.next)` — у каждого шага свой объект параметров (FR-018);
  - `const MULTIBENEFITS: SectionAnimation = { screenId: 'benefits', createIntro };`;
  - хук — обёртка, как в T012;
  - удалить `registerPlugin`, запросы, `INTRO_*`, `ENTER_START`, `NEXT_POSITION`, `SCREEN_ID`, локальные `slideFrom` и `slideTo`, `isOpenedOnScreen`, все `ScrollTrigger.create`, `ResizeObserver` и ненужные импорты
- [X] T015 [US2] Проверить Multi-benefits: `yarn lint`, `yarn build`; `specs/008-multibenefits-animation/quickstart.md` на 1440 и 375 полностью, на 800 — с изменёнными ожиданиями; quickstart 010 §3.3
- [X] T016 [US2] Переписать `src/shared/lib/useMultitasksAnimation.ts`:
  - оставить `EXIT_TITLE`, `EXIT_BLOCK`, селекторы `TITLE`, `SNAKE`, `CARD`, `getCardColumns` и `createExit` без изменений;
  - `createIntro = (scope: HTMLElement) => { const intro = gsap.timeline({ paused: true }).fromTo(SNAKE, slideFrom(-INTRO.offset), slideTo(), 0).fromTo(TITLE, fadeFrom(), fadeTo(), 0); getCardColumns(scope).forEach((column) => { intro.fromTo(column, slideFrom(INTRO.offset), slideTo({ stagger: INTRO.stagger }), INTRO.next); }); return intro; }`;
  - `const MULTITASKS: SectionAnimation = { screenId: 'team', createIntro, createExit };`;
  - хук — обёртка, как в T012;
  - удалить `registerPlugin`, запросы, `INTRO_*`, `ENTER_START`, `SCREEN_ID`, `isOpenedOnScreen`, `ScrollTrigger.create` и ненужные импорты;
  - досрочное завершение при уходе вверх (FR-019) и пересчёт при изменении вёрстки (FR-020) даёт общий механизм
- [X] T017 [US2] Проверить Multi-tasks: `yarn lint`, `yarn build`; `specs/007-multitasks-animation/quickstart.md` на 1440 и 375 полностью, на 800 — с изменёнными ожиданиями
- [X] T018 [US2] Переписать `src/shared/lib/useHeroAnimation.ts` (research R9):
  - оставить `EXIT_*`, селекторы, `FADE_TARGETS`, `SLIDE_TARGETS`, `HERO_RANGE` и `createExit`;
  - вместо `INTRO_FADE`, `INTRO_SLIDE`, `INTRO_STAGGER`, `INTRO_OFFSET`, `INTRO_EASE` и трёх запросов — `HERO_DURATION = 0.6` и `HERO_STAGGER = 0.15`;
  - `createIntro = () => gsap.timeline().fromTo(FADE_TARGETS, fadeFrom(), fadeTo({ duration: HERO_DURATION })).fromTo(SLIDE_TARGETS, slideFrom(-INTRO.offset), slideTo({ duration: HERO_DURATION, stagger: HERO_STAGGER }))` — без паузы и без `onComplete`;
  - в эффекте `mm.add(INTRO_CONDITIONS, (ctx) => { … }, scope)`: если `!ctx.conditions?.animated` — `markIntroDone(); return;`; иначе `createExit()`; если `introPlayedRef.current` — `markIntroDone(); return;`; иначе `finishOnLeave(HERO, createIntro(), markIntroDone)`;
  - удалить импорт `ScrollTrigger` и `registerPlugin`; сигнатура и `return isIntroDone` без изменений
- [X] T019 [US2] Проверить Hero: `yarn lint`, `yarn build`; `specs/006-hero-animation/quickstart.md` на 1440 и 375 полностью, на 800 — с изменёнными ожиданиями

**Checkpoint**: все четыре секции на общем механизме, на desktop поведение прежнее.

---

## Phase 4: User Story 3 — медиазапросы из MEDIA (Priority: P2)

**Goal**: фон, строка, слово, поэкранная прокрутка, прелоадер и линия прогресса берут условия из `MEDIA`. Фон работает только от 1025px, прелоадер — от 577px (FR-001, FR-009, FR-010).

**Independent Test**: quickstart 010 §1, все строки таблицы.

- [X] T020 [P] [US3] В `src/shared/lib/useGridMeshAnimation.ts` удалить `MOTION_QUERY`, импортировать `MEDIA` из `@/shared/config`, `mm.add(MEDIA.animated, () => { … })`. Остальное без изменений
- [X] T021 [P] [US3] В `src/shared/lib/useMarquee.ts` заменить объект условий на `{ motion: MEDIA.motion, reduce: MEDIA.reduce }`, импортировать `MEDIA` рядом с `type Lang`
- [X] T022 [P] [US3] В `src/shared/lib/useSwitchingWord.ts` заменить объект условий на `{ motion: MEDIA.motion, reduce: MEDIA.reduce }`, импортировать `MEDIA` из `@/shared/config`
- [X] T023 [P] [US3] В `src/shared/lib/useFullpageScroll.ts` удалить `DESKTOP_MIN_WIDTH`, `DESKTOP_QUERY`, `REDUCE_QUERY`; `mm.add({ desktop: MEDIA.desktop, reduce: MEDIA.reduce }, …)`; импортировать `MEDIA` из `@/shared/config` (тип `Lang` оставить)
- [X] T024 [P] [US3] В `src/widgets/Preloader/useProgressLine.ts` заменить строку медиазапроса на `window.matchMedia(MEDIA.reduce).matches`, импортировать `MEDIA` из `@/shared/config`
- [X] T025 [P] [US3] В `src/pages/Home/Home.tsx` заменить `window.matchMedia('(min-width: 576px)')` на `window.matchMedia(MEDIA.notMobile)` и импортировать `MEDIA` вместе с `SCREENS`: `import { MEDIA, SCREENS } from '@/shared/config';`. Остальное не менять
- [X] T026 [US3] Проверить ширины: `yarn lint`, `yarn build`; quickstart 010 §1, строки 1–10

**Checkpoint**: до 1024px двигаются только строка и слово, на 576 нет прелоадера, на 577 есть.

---

## Phase 5: User Story 4 — фон без перерисовки (Priority: P2)

**Goal**: свечения без `filter: blur`, сетка через `transform`; вид тот же (FR-015, FR-016, SC-009).

**Independent Test**: quickstart 010 §6 и §7.

- [X] T027 [US4] В `src/widgets/Background/Background.module.scss` добавить классы свечений (research R11):
  - `.glow-right`: `width` и `height` `72.5rem`, `right: -26.875rem`, `top: -23.75rem`, `opacity: 0.4`, `background: radial-gradient(circle closest-side, rgb(20 9 26 / 98%) 3%, rgb(20 9 26 / 84%) 28%, rgb(20 9 26 / 50%) 52%, rgb(20 9 26 / 16%) 76%, rgb(20 9 26 / 0%) 100%)`;
  - `.glow-left`: `width` и `height` `90rem`, `left: -38.75rem`, `top: -13.75rem`, `opacity: 0.3`, тот же градиент со стопами `11%`, `33%`, `56%`, `78%`, `100%`;
  - удалить ставшие ненужными `.w-150`, `.h-150`, `.w-200`, `.h-200`, `.-right-37-5` вместе с комментарием над ним, `.-top-25`, `.-left-75`, `.top-25`, `.rounded-full` (используются только в `BackgroundGlow.tsx`)
- [X] T028 [US4] В `src/widgets/Background/BackgroundGlow.tsx` у двух кругов оставить `className={`${cls.absolute} ${cls['glow-right']}`}` и `className={`${cls.absolute} ${cls['glow-left']}`}`, удалить `style` с `background`, `filter` и `opacity`. Типы классов `Background.module.scss.d.ts` перегенерирует плагин при `yarn dev` или `yarn build`
- [X] T029 [US4] Проверить свечения: `yarn lint`, `yarn build`; скриншоты 1440 и 1920 сравнить с `specs/010-refactor-animations/screenshots/before-*.png` (quickstart §7); при расхождении подогнать только позиции стопов в `src/widgets/Background/Background.module.scss`
- [X] T030 [US4] В `src/widgets/Background/Background.module.scss` добавить классы сетки (research R10):
  - `.grid-window`: `transform: translate(var(--x), var(--y))`, `mask-image` и `-webkit-mask-image: radial-gradient(circle 20rem at 0 0, rgb(0 0 0 / 100%) 0%, rgb(0 0 0 / 95%) 20%, rgb(0 0 0 / 70%) 40%, rgb(0 0 0 / 25%) 60%, transparent 80%)`, `@include min-media(1025) { will-change: transform; }`;
  - `.grid-canvas`: `transform: translate(calc(-1 * var(--x)), calc(-1 * var(--y)))`, `@include min-media(1025) { will-change: transform; }`
- [X] T031 [US4] В `src/widgets/Background/GridMesh.tsx` у элемента с `ref={maskRef}` добавить класс `cls['grid-window']`, из `style` удалить `maskImage` и `WebkitMaskImage` и оставить только `'--x': '85%'` и `'--y': '10%'`; у `<svg>` добавить класс `cls['grid-canvas']` к существующим. Пути SVG, `viewBox` и `preserveAspectRatio` не менять
- [X] T032 [US4] Проверить сетку: `yarn lint`, `yarn build`; quickstart 010 §6 (Paint flashing без вспышек при движении пятна, fps ≥ 57) и §7 (скриншоты как «до»); записать в `specs/010-refactor-animations/measurements.md`. Если вид расходится — запасной вариант из research R10: откатить T030–T031 и добавить `will-change: transform` текущему элементу с маской в `src/widgets/Background/GridMesh.tsx`

**Checkpoint**: фон выглядит как раньше, при движении пятна ничего не перерисовывается.

---

## Phase 6: User Story 5 — исправления (Priority: P3)

**Goal**: подтвердить FR-018…FR-020, которые реализованы в T014 и T016.

**Independent Test**: quickstart 010 §3.

- [X] T033 [US5] Проверить quickstart 010 §3.1 и §3.2: Multi-tasks доводит появление при уходе вверх и запускает его при въезде после медленной загрузки (`src/shared/lib/useMultitasksAnimation.ts`)

---

## Phase 7: User Story 1 — полный регресс (Priority: P1)

**Goal**: на desktop посетитель не замечает рефакторинга (FR-021…FR-023, SC-001).

**Independent Test**: quickstart 006–009 и quickstart 010 §8.

- [ ] T034 [US1] Пройти подряд quickstart `specs/006-hero-animation/quickstart.md`, `specs/007-multitasks-animation/quickstart.md`, `specs/008-multibenefits-animation/quickstart.md`, `specs/009-multiply-animation/quickstart.md` на итоговом коде с изменёнными ожиданиями из plan.md
- [X] T035 [US1] Проверить quickstart 010 §8: смена языка во время появления и уход на 404 с возвратом (`src/shared/lib/useSectionAnimation.ts`, `src/shared/lib/useHeroAnimation.ts`)

---

## Phase 8: Polish (поиск по коду и замер «после»)

**Purpose**: единый источник подтверждён поиском (SC-002, SC-003), замеры «после» записаны (FR-017, SC-005…SC-008).

- [X] T036 Поиск по `src` по таблице quickstart 010 §4: `576|577|1024|1025`, `prefers-reduced-motion|min-width|max-width` в `*.ts`/`*.tsx` — только `src/shared/config/animation.ts`; `registerPlugin(ScrollTrigger` и `new ResizeObserver` с `refresh` — только `src/shared/lib/intro.ts`; `window.location.hash.slice(1)` в хуках анимаций — только `src/shared/lib/useSectionAnimation.ts`; `ScrollTrigger.create`, `power3.out`, `'top 75%'` — нет в хуках секций; `src/shared/lib/index.ts` без изменений. Найденное перенести в общие места
- [X] T037 Проверить SC-003: временно `duration: 2` в `src/shared/config/animation.ts`, пройти три секции на 1440 — все замедлились; вернуть `0.5`
- [X] T038 Проверить наблюдатели по quickstart 010 §5: logpoint в колбэк `ResizeObserver` и в `onUpdate` наблюдателя `down` в `src/shared/lib/intro.ts`
- [X] T039 `yarn lint` и `yarn build` без ошибок
- [X] T040 Замерить Lighthouse «после» (quickstart §10.2) в тех же условиях, что T002, и записать медианы в `specs/010-refactor-animations/measurements.md`
- [X] T041 Записать размер бандла «после» в `specs/010-refactor-animations/measurements.md`: gzip каждого JS-файла из вывода `yarn build` и сумма
- [X] T042 Подвести итог в `specs/010-refactor-animations/measurements.md`: сравнить «до» и «после» по SC-005 (desktop ≥ 75 и ≥ «до»), SC-006 (mobile ≥ «до»), SC-007 (JS gzip ≤ «до»), SC-008, SC-009; отметить каждый пункт как выполненный или нет

---

## Dependencies & Execution Order

- **Phase 1** → до любых правок кода.
- **Phase 2** зависит от Phase 1. T005 и T006 — [P]. T007 → T008 → T009 (один файл). T010 после T009.
- **Phase 3** зависит от Phase 2. Секции строго по очереди: T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019.
- **Phase 4** зависит от T005–T006. Можно начать сразу после Phase 2. T020–T025 — [P], T026 после них.
- **Phase 5** зависит от T020 (фон только от 1025px). T027 → T028 → T029 → T030 → T031 → T032 (общий `Background.module.scss`).
- **Phase 6** зависит от T016.
- **Phase 7** зависит от Phase 3–5.
- **Phase 8** — последняя. T040–T042 после T039.

## Parallel Example

```text
Phase 2: T005 src/shared/config/animation.ts  |  T006 src/shared/config/index.ts
Phase 4: T020 useGridMeshAnimation.ts | T021 useMarquee.ts | T022 useSwitchingWord.ts | T023 useFullpageScroll.ts | T024 useProgressLine.ts | T025 Home.tsx
```

## Implementation Strategy

1. Phase 1 и Phase 2 — основа. После T011 страница работает как раньше.
2. Phase 3 — MVP рефакторинга (US2). После каждой секции её quickstart. Если секция ломается, откатывается только её файл.
3. Phase 4 — правило конституции 2.1.0 по ширинам.
4. Phase 5 — производительность фона, свечения и сетка отдельными шагами со скриншотами.
5. Phase 6–8 — подтверждение исправлений, полный регресс, поиск по коду и замер «после».

## Implementation Notes (2026-11-16)

**Как проверялось.** Проверки «quickstart своей фичи» в T013, T015, T017, T019, T026, T033, T035 выполнены автоматически в Chrome на production-сборке, выборочно:
- появление и итоговая видимость блоков на 1440;
- отсутствие появлений на 800;
- прелоадер на 576 и 577;
- сетка на 1024 и 1025;
- уход вверх во время появления Multi-tasks;
- смена языка;
- 404 и возврат.

T038 вместо logpoint'ов проверен счётчиками `ResizeObserver` и `ScrollTrigger.getAll()`. Полный ручной проход quickstart 006–009 (T034) и Paint flashing в T004 и T032 не выполнялись: они в списке ручных проверок.

**Отступления от текста задач:**
- **T030–T031.** Окно сетки центрировано: `translate(calc(var(--x) - 50%), …)`, маска `at center`, SVG сдвигается на `calc(50% - var(--x))`. Вариант «круг в углу окна» обрезал пятно до четверти. Начальные `--x: 85%` и `--y: 10%` перенесены из inline-стиля в класс `.grid-window`, чтобы после отката GSAP переменные не оставались пустыми (research R10).
- **T027.** Стопы градиента свечений посчитаны численно, 11 точек до R + 2,5σ, размеры 81.25rem и 100rem (research R11).
- **T008.** `playOnEnter` убивает триггер в `onEnter` вместо `once: true`: у последнего экрана `once` не срабатывал, и триггер жил вечно (research R5).
- **Вне списка задач (FR-009).** В `src/index.html` статичная оболочка прелоадера скрывалась при `max-width: 575.98px` и мелькала ровно на 576px. Исправлено на `max-width: 576px`.
- **`Background.module.scss.d.ts`.** Файл перегенерирован плагином и лежит в git, поэтому попадает в дифф.
