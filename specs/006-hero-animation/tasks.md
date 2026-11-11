---
description: "Task list for feature 006-hero-animation"
---

# Tasks: Анимация первого экрана и шапки

**Input**: Design documents from `specs/006-hero-animation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/hero-animation.md](./contracts/hero-animation.md), [quickstart.md](./quickstart.md)

**Tests**: Автотестов нет. Каждая фаза проверяется сценариями из [quickstart.md](./quickstart.md) вручную.

**Organization**: Задачи сгруппированы по историям из spec.md. В конце каждой фазы — `yarn lint` и `yarn build`, затем стоп до подтверждения.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно — другой файл, нет зависимости от незавершённых задач
- **[Story]**: история из spec.md (US1, US2, US3)
- Во всех файлах кода — без комментариев и `console.log` (constitution III)

---

## Phase 1: Setup (разметка для анимации)

**Purpose**: data-атрибуты по контракту и защита от горизонтальной прокрутки. Поведение сайта не меняется.

**Проверка**: quickstart, сценарий 1, пункт 8 — первый экран выглядит как `mockup/hero.png` и как до изменений; сценарий 9.

- [X] T001 [P] В `src/widgets/Header/Header.tsx` добавить `data-header="left"` на `div` левого слота (`cls.left`) и `data-header="right"` на `div` правого слота (`cls.right`); пропсы и классы не менять (contract, «Data-атрибуты»; research R7)
- [X] T002 [P] В `src/shared/ui/Socials/Socials.tsx` заменить `SocialsProps` на `ComponentProps<'ul'>` (`import type { ComponentProps } from 'react'`), принять `{ className, ...rest }` и пробросить `{...rest}` на `<ul>`; склейку классов `[cls.socials, className].filter(Boolean).join(' ')` и разметку списка не менять (contract, «Изменения в компонентах»)
- [X] T003 В `src/pages/Hero/Hero.tsx` добавить атрибуты: `data-hero="content"` на `div` с `cls.content`, `data-hero="title"` на `h1`, `data-hero="text"` на `p`, `data-hero="button"` на `<Button>`, `data-hero="snake"` на `<img>`, `data-hero="socials"` на `<Socials>`; проп `isReady` и остальную разметку не менять (contract, таблица атрибутов). Зависит от T002
- [X] T004 [P] В `src/pages/Home/Home.module.scss` в `.header` добавить `overflow-x: clip` (research R11); `Home.module.scss.d.ts` не меняется, новых классов нет
- [X] T005 `yarn lint` и `yarn build` без новых ошибок; открыть `/en` на 1440 и 375, сравнить с `specs/006-hero-animation/mockup/hero.png` — ничего не сдвинулось. **Стоп, ждать подтверждения**

**Checkpoint**: разметка готова, сайт выглядит и работает как раньше

---

## Phase 2: Foundational (каркас хука и подключение)

**Purpose**: хук `useHeroAnimation` с `matchMedia`, состоянием и очисткой; Home передаёт `isIntroDone` в Hero. Анимаций пока нет: во всех ветках `isIntroDone` сразу `true`.

**⚠️ CRITICAL**: фазы US1–US3 не начинаются, пока эта фаза не закончена.

**Проверка**: quickstart, сценарий 5, пункт 1 (на 375 слово переключается) и сценарий 6, пункт 1 (смена языка без ошибок в консоли); на 1440 слово начинает переключаться сразу после прелоадера, как до изменений.

- [X] T006 Проверить отражение змеи (research R3): временно добавить в `src/pages/Hero/Hero.tsx` `useLayoutEffect(() => { gsap.set('[data-hero="snake"]', { xPercent: 0 }); }, [])`, открыть `/en` на 1440 и сравнить змею с `specs/006-hero-animation/mockup/hero.png` (голова смотрит влево), затем временный код удалить. Если отражение не изменилось — записать «проверено, работает» в R3 `specs/006-hero-animation/research.md`. Если сломалось — в T007 первой строкой callback `matchMedia` сделать `gsap.set(snake, { scaleX: -1 })`, а если и это не поможет — обёртка вокруг `<img>` в `src/pages/Hero/Hero.tsx` с `data-hero="snake"` на обёртке; выбранный вариант и причину записать в R3
- [X] T007 Создать `src/pages/Home/useHeroAnimation.ts` (contract `useHeroAnimation(scopeRef, isReady)`; data-model «Состояние хука»; research R5, R6, R14):
  - `gsap.registerPlugin(ScrollTrigger)` (импорт из `gsap/ScrollTrigger`);
  - константы условий: `INTRO_QUERY = '(min-width: 577px) and (prefers-reduced-motion: no-preference)'`, `EXIT_QUERY = '(min-width: 1025px) and (prefers-reduced-motion: no-preference)'`, `STILL_QUERY = '(max-width: 576px), (prefers-reduced-motion: reduce)'`;
  - сигнатура `(scopeRef: RefObject<HTMLElement | null>, isReady: boolean) => boolean`; `lang` из `useParams<{ lang: Lang }>()`;
  - `const [isIntroDone, setIsIntroDone] = useState(false)`, `const introPlayedRef = useRef(false)`; функция `markIntroDone`: `introPlayedRef.current = true; setIsIntroDone(true)`;
  - `useLayoutEffect` с зависимостями `[lang, isReady]`: при `!isReady` или пустом `scopeRef.current` — выход; `const mm = gsap.matchMedia()`; `mm.add({ intro: INTRO_QUERY, exit: EXIT_QUERY, still: STILL_QUERY }, () => { markIntroDone(); }, scopeRef.current)`; cleanup `() => mm.revert()`;
  - вернуть `isIntroDone`
- [X] T008 В `src/pages/Home/Home.tsx`: `const contentRef = useRef<HTMLDivElement>(null)` и `ref={contentRef}` на `div` с `contentClassName`; `const isIntroDone = useHeroAnimation(contentRef, !isLoading)`; `<Hero isReady={isIntroDone} />`. `useSwitchingWord` не менять: он получает флаг через проп `isReady` в `Hero` (research R5). Зависит от T007
- [X] T009 `yarn lint` и `yarn build` без новых ошибок; проверить сценарии фазы. **Стоп, ждать подтверждения**

**Checkpoint**: каркас работает, слово переключается на всех ширинах, анимаций ещё нет

---

## Phase 3: User Story 1 — Первый экран появляется после загрузки (Priority: P1) 🎯 MVP

**Goal**: после прелоадера змея и шапка проявляются, затем слева по очереди прилетают заголовок, подзаголовок, кнопка и соцсети; слово начинает переключаться после этого; всё ≤ 2 с

**Independent Test**: quickstart, сценарии 1 и 4

- [X] T010 [US1] В `src/pages/Home/useHeroAnimation.ts` добавить константы появления (research R13): `INTRO_FADE = 0.6`, `INTRO_SLIDE = 0.6`, `INTRO_STAGGER = 0.15`, `INTRO_OFFSET = -80`, `INTRO_EASE = 'power3.out'`; и селекторы целей: `'[data-hero="snake"]'`, `'[data-header="left"]'`, `'[data-header="right"]'`, `'[data-hero="title"]'`, `'[data-hero="text"]'`, `'[data-hero="button"]'`, `'[data-hero="socials"]'` (data-model, AnimationTargets)
- [X] T011 [US1] В callback `matchMedia` в `src/pages/Home/useHeroAnimation.ts` заменить безусловный `markIntroDone()`: если `ctx.conditions.intro && !introPlayedRef.current` — создать `const intro = gsap.timeline({ onComplete: markIntroDone })`: шаг 1 `fromTo([snake, headerLeft, headerRight], { autoAlpha: 0 }, { autoAlpha: 1, duration: INTRO_FADE })`; шаг 2 после него `fromTo([title, text, button, socials], { x: INTRO_OFFSET, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: INTRO_SLIDE, stagger: INTRO_STAGGER, ease: INTRO_EASE })`; иначе — `markIntroDone()`. Появление меняет только `autoAlpha` и `x` (research R3). Итог ≤ 2 с (FR-006)
- [X] T012 [US1] Проверить, что начальное скрытое состояние ставится до первой отрисовки (research R8): эффект в `src/pages/Home/useHeroAnimation.ts` — именно `useLayoutEffect`, у `fromTo` не отключён `immediateRender`. DevTools → Performance со скриншотами: между исчезновением прелоадера и шагом 1 нет кадра с готовым экраном (FR-002; quickstart 1, пункты 2–3)
- [X] T013 [US1] В ветке появления в `src/pages/Home/useHeroAnimation.ts` создать наблюдатель (research R10): `const watcher = ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', onUpdate: (self) => { if (self.progress > 0 && intro.isActive()) intro.progress(1); } })`; сразу после создания `if (watcher.progress > 0) intro.progress(1)` (FR-010, FR-011)
- [X] T014 [US1] `yarn lint` и `yarn build` без новых ошибок; проверить quickstart, сценарии 1 и 4. **Стоп, ждать подтверждения**

**Checkpoint**: появление работает и проверяется отдельно — это MVP

---

## Phase 4: User Story 2 — Уход и возврат при переходе между экранами (Priority: P2)

**Goal**: от 1025px элементы улетают синхронно с переходом Hero → Multi-tasks и прилетают обратно при возврате; появление не повторяется

**Independent Test**: quickstart, сценарии 2, 3 и 7

- [X] T015 [US2] В `src/pages/Home/useHeroAnimation.ts` добавить константы ухода (research R12; data-model, таблица целей): `EXIT_CONTENT = { xPercent: -110 }`, `EXIT_SOCIALS = { xPercent: -300 }`, `EXIT_SNAKE = { xPercent: 60 }`, `EXIT_LOGO = { yPercent: -200 }`, `EXIT_NAV = { xPercent: 40, yPercent: -200 }` и селектор `'[data-hero="content"]'`
- [X] T016 [US2] В callback `matchMedia` в `src/pages/Home/useHeroAnimation.ts` при `ctx.conditions.exit` создать `gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }, defaults: { ease: 'none' } })` и добавить в позицию `0` твины `.to(content, EXIT_CONTENT, 0)`, `.to(socials, EXIT_SOCIALS, 0)`, `.to(snake, EXIT_SNAKE, 0)`, `.to(headerLeft, EXIT_LOGO, 0)`, `.to(headerRight, EXIT_NAV, 0)`. Уход меняет только `xPercent` и `yPercent` (research R2, R3; FR-007, FR-008). `src/shared/lib/useFullpageScroll.ts` не трогать
- [X] T017 [US2] Проверить quickstart, сценарии 2 и 3: уход и прилетание синхронны с переходом, `/ru#join` → Home даёт прилетание без появления, «Scroll to top» — то же. Если после ухода прелоадера границы ScrollTrigger неверны (уход начинается не с начала перехода), вызвать `ScrollTrigger.refresh()` после создания timeline в `src/pages/Home/useHeroAnimation.ts`
- [X] T018 [US2] Проверить quickstart, сценарий 7 на 1025, 1280, 1440, 1920: горизонтальной прокрутки нет. Если есть — подобрать смещения в `src/pages/Home/useHeroAnimation.ts` или поправить `overflow-x: clip` в `src/pages/Home/Home.module.scss` (FR-012)
- [X] T019 [US2] `yarn lint` и `yarn build` без новых ошибок; проверить quickstart, сценарии 2, 3 и 7. **Стоп, ждать подтверждения**

**Checkpoint**: US1 и US2 работают вместе, уход проверяется отдельно

---

## Phase 5: User Story 3 — Без анимаций там, где они мешают (Priority: P3)

**Goal**: до 576px и при «уменьшить движение» всё сразу в конечном виде; от 577 до 1024px только появление; смена языка и ширины не повторяет появление и не оставляет следов

**Independent Test**: quickstart, сценарии 5 и 6

- [ ] T020 [US3] Проверить ветку `still` в callback `matchMedia` в `src/pages/Home/useHeroAnimation.ts`: при `ctx.conditions.still` не создаётся ни один timeline и наблюдатель, сразу вызывается `markIntroDone()`; порядок проверок — сначала `intro && !introPlayedRef.current`, иначе `markIntroDone()`; ветка `exit` проверяется отдельно и при `still` не срабатывает (research R14; FR-014, FR-016)
- [ ] T021 [US3] Проверить quickstart, сценарий 5, пункты 1–3 (375, 800, reduce): на 375 и при reduce ничего не двигается, слово переключается; на 800 есть появление, ухода нет. Исправления — в `src/pages/Home/useHeroAnimation.ts` (FR-014, FR-015, FR-016)
- [ ] T022 [US3] Проверить quickstart, сценарий 6 и сценарий 5, пункт 4: смена языка и сужение окна 1440 → 800 → 375 → 1440 не повторяют появление, элементы в конечном положении. Если появление повторяется — проверить, что `introPlayedRef` выставляется в `markIntroDone` до `mm.revert()`, в `src/pages/Home/useHeroAnimation.ts` (research R6; FR-013, FR-017, FR-018)
- [ ] T023 [US3] `yarn lint` и `yarn build` без новых ошибок; проверить quickstart, сценарии 5 и 6. **Стоп, ждать подтверждения**

**Checkpoint**: все истории работают и проверены отдельно

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lighthouse, полный прогон и чистота кода

**Проверка**: quickstart, сценарии 1–9

- [ ] T024 Замер Lighthouse (quickstart, сценарий 8; research R9): `yarn build`, `yarn preview`, Desktop, Navigation, `/en`. Записать Performance, LCP-элемент и время LCP в R9 `specs/006-hero-animation/research.md`. Если Performance < 75 — в `src/pages/Home/useHeroAnimation.ts` стартовать змею с `alpha: 0.1` вместо `autoAlpha: 0` и замерить снова; если всё ещё < 75 — убрать змею из шага 1 появления; итоговое решение записать в R9
- [ ] T025 Прогнать quickstart, сценарии 1–7 подряд на итоговой сборке; найденные расхождения исправить в файлах из задач выше и перепроверить сценарий
- [ ] T026 Проверить отсутствие комментариев и `console.log` в `src/pages/Home/useHeroAnimation.ts`, `src/pages/Home/Home.tsx`, `src/pages/Home/Home.module.scss`, `src/pages/Hero/Hero.tsx`, `src/widgets/Header/Header.tsx`, `src/shared/ui/Socials/Socials.tsx` (constitution III)
- [ ] T027 `yarn lint` и `yarn build` без новых ошибок (quickstart, сценарий 9). **Стоп, ждать подтверждения**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: без зависимостей
- **Foundational (Phase 2)**: после Setup — хуку нужны data-атрибуты
- **US1 (Phase 3)**: после Foundational
- **US2 (Phase 4)**: после Foundational; от US1 по логике не зависит, но правит тот же файл `useHeroAnimation.ts`, поэтому делается после US1
- **US3 (Phase 5)**: после US1 и US2 — проверяет, что их ветки корректно выключаются
- **Polish (Phase 6)**: после всех историй

### Within Each Phase

- T003 после T002: `Socials` должен принимать атрибуты
- T006 первым в фазе 2: от результата зависит, что писать в T007
- T008 после T007
- Задачи внутри US1, US2, US3 — по порядку: все правят `src/pages/Home/useHeroAnimation.ts`

### Parallel Opportunities

- Фаза 1: T001, T002, T004 — три разных файла

```text
T001 src/widgets/Header/Header.tsx
T002 src/shared/ui/Socials/Socials.tsx
T004 src/pages/Home/Home.module.scss
```

- В фазах 2–6 параллельных задач нет: логика живёт в одном файле `src/pages/Home/useHeroAnimation.ts`

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup → стоп
2. Phase 2: Foundational → стоп
3. Phase 3: US1 → стоп, проверить появление (quickstart 1 и 4) — это MVP

### Incremental Delivery

1. Setup + Foundational → сайт как раньше, каркас готов
2. US1 → появление
3. US2 → уход и возврат
4. US3 → mobile, reduce, смена языка и ширины
5. Polish → Lighthouse и полный прогон

Каждая фаза заканчивается `yarn lint`, `yarn build` и остановкой до подтверждения.
