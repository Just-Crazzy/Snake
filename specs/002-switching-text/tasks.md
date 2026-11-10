---

description: "Task list for feature implementation: Переключающееся слово в заголовке Hero"
---

# Tasks: Переключающееся слово в заголовке Hero

**Input**: Design documents from `specs/002-switching-text/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: автотестов нет (plan, Testing); проверка — сценарии [quickstart.md](./quickstart.md).

**Organization**: порядок задач — конфиг → вёрстка Hero → хук → проп `isReady`; задачи сгруппированы по user stories из spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно (разные файлы, нет зависимости от незавершённых задач)
- **[Story]**: к какой user story относится задача (US1–US3)
- Во всех файлах: без комментариев и `console.log` (constitution, принцип III); размеры только в px, rem, em, % (принцип V)

---

## Phase 1: Setup

Отдельной настройки не нужно: GSAP, SCSS Modules и глобальный класс `.sr-only` (`src/app/styles/_global.scss`) уже есть в проекте.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: слова для заголовка, от которых зависят вёрстка и хук

- [X] T001 [P] Создать `src/shared/config/heroWords.ts`: `heroWords: Record<Lang, string[]>` (тип `Lang` из `./languages`). Правила из data-model: «Для каждого языка из `LANGUAGES`; сейчас en и ru — `['skills', 'profit', 'growth']`», регистр — «строчные», порядок массива — порядок показа (FR-001, FR-002); экспорт `export { heroWords };`
- [X] T002 Экспортировать `heroWords` из `src/shared/config/index.ts` (`export { heroWords } from './heroWords';`). Зависит от T001

**Checkpoint**: `yarn build` проходит

---

## Phase 3: User Story 1 — Слово в заголовке сменяется по кругу (Priority: P1) 🎯 MVP

**Goal**: SKILLS → PROFIT → GROWTH → SKILLS по кругу; уходящее слово уезжает вниз, новое приходит сверху; показ ≈ 2,5 с, смена ≈ 0,6 с

**Independent Test**: quickstart, сценарий 1

- [X] T003 [P] [US1] В `src/pages/Hero/Hero.module.scss` заменить `.accent` на `.words` и добавить `.word` (research R2, R3): `.words` — `display: inline-grid`, `overflow: hidden`, `vertical-align: top`, `color: $c-second`; `.word` — `grid-area: 1 / 1`, `display: block`; `.word + .word` — `transform: translateY(-100%)`, чтобы до старта анимации и при `isReady = false` было видно только первое слово. Если края букв обрезаются — вертикальный `padding` в `em` и такой же отрицательный `margin` у `.words`
- [X] T004 [P] [US1] Обновить `src/pages/Hero/Hero.module.scss.d.ts` под классы из T003: убрать `accent`, добавить `words` и `word` (формат как у соседних `.module.scss.d.ts`; плагин `vite-plugin-sass-dts` перегенерирует файл при `yarn dev`, итог должен совпасть)
- [X] T005 [US1] Разметка заголовка в `src/pages/Hero/Hero.tsx` (contract, раздел «Разметка заголовка»; research R8): язык из `useParams<{ lang: Lang }>()`, `const words = heroWords[lang]`; внутри `h1` — `<span className="sr-only">Practice makes {words.join(', ')}</span>` и видимая строка `<span aria-hidden="true">Practice <br /> makes <span className={cls.words}>…</span></span>`, где в `cls.words` для каждого слова `<span key={word} className={cls.word}>{word}</span>`; `aria-live` не использовать (FR-009). Зависит от T002, T003, T004
- [X] T006 [P] [US1] Создать `src/pages/Hero/useSwitchingWord.ts` (contract `useSwitchingWord(words, isReady)`; research R4, R5; data-model SwitchingWord): `useRef<HTMLSpanElement>(null)` для контейнера; в `useEffect` при `!isReady` или пустом ref — выход; `const mm = gsap.matchMedia()`; `mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {…}, ref.current)`; внутри: элементы — прямые потомки контейнера; `gsap.set` каждому `{ y: 0, yPercent: index === 0 ? 0 : -100 }` (`y: 0` обнуляет `translateY` из CSS T003); `gsap.timeline({ repeat: -1 })`; для каждого слова `i` в позиции `i * (HOLD + switchDuration) + HOLD` два `fromTo` с `immediateRender: false`, `ease: 'power2.inOut'`: слово `i` — `yPercent 0 → 100`, слово `(i + 1) % n` — `yPercent -100 → 0`; `HOLD = 2.5`, `SWITCH = 0.6`, при `ctx.conditions.reduce` длительность `0` (FR-004, FR-005, FR-010); cleanup — `mm.revert()`; зависимости `[words, isReady]` (FR-011); вернуть `ref`
- [X] T007 [US1] В `src/pages/Hero/Hero.tsx` добавить проп `isReady?: boolean` со значением по умолчанию `true` (contract, «Hero props»; research R7), вызвать `const wordsRef = useSwitchingWord(words, isReady)` и повесить `ref={wordsRef}` на контейнер `cls.words`. Зависит от T005, T006

**Checkpoint**: сценарий 1 из quickstart проходит — это MVP

---

## Phase 4: User Story 2 — Заголовок не прыгает при смене слов (Priority: P2)

**Goal**: смена слова не сдвигает «MAKES», подзаголовок, кнопку и змею

**Independent Test**: quickstart, сценарии 2 и 4

- [X] T008 [US2] Проверить сценарии 2 и 4 из quickstart на 1440px и 375px; если элементы сдвигаются или слово переносится по-разному, исправить ширину и выравнивание `.words` в `src/pages/Hero/Hero.module.scss` (FR-007, FR-013, research R2, R9)

**Checkpoint**: сценарии 2 и 4 проходят

---

## Phase 5: User Story 3 — Доступность и «уменьшить движение» (Priority: P3)

**Goal**: чтец читает заголовок одной фразой; при «уменьшить движение» смена мгновенная

**Independent Test**: quickstart, сценарии 7 и 8

- [X] T009 [US3] Проверить сценарии 7 и 8 из quickstart; если чтец объявляет смены или при «уменьшить движение» есть пролистывание, исправить разметку в `src/pages/Hero/Hero.tsx` или условие `reduce` в `src/pages/Hero/useSwitchingWord.ts` (FR-009, FR-010)

**Checkpoint**: сценарии 7 и 8 проходят

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T010 Пройти сценарии 1, 3, 5, 6 из [quickstart.md](./quickstart.md) (цикл слов, обрезка букв, смена языка, вкладка в фоне)
- [ ] T011 Проверить, что в `src/pages/Hero/useSwitchingWord.ts`, `src/pages/Hero/Hero.tsx`, `src/pages/Hero/Hero.module.scss`, `src/shared/config/heroWords.ts` нет комментариев и `console.log`; `yarn lint` без ошибок
- [X] T012 `yarn build` без ошибок TypeScript

---

## Deferred: после слияния `feature/preloader`

**Не выполнять в этой ветке**: в `dev` ещё нет прелоадера и состояния `isDone`.

- [ ] T013 [US1] ⏸ ОТЛОЖЕНО — после слияния `feature/preloader` передать `isReady={isDone}` в `<Hero />` в `src/pages/Home/Home.tsx` и пройти сценарий 9 из quickstart (FR-012)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)** → **US1 (Phase 3)**
- **US2 (Phase 4)** и **US3 (Phase 5)** — проверки поверх US1, между собой независимы
- **Polish (Phase 6)** — после всех историй
- **Deferred (T013)** — только после слияния `feature/preloader` в `dev`

### Within User Story 1

- T003, T004, T006 — параллельно (разные файлы)
- T005 после T002, T003, T004
- T007 после T005 и T006

### Parallel Opportunities

- Phase 2: T001 параллельно с T003, T004, T006 (разные файлы, T006 от T001 не зависит)
- Phase 3: T003, T004, T006
- Phases 4 и 5: T008 и T009

---

## Parallel Example: User Story 1

```text
Task: "T003 .words и .word в src/pages/Hero/Hero.module.scss"
Task: "T004 классы в src/pages/Hero/Hero.module.scss.d.ts"
Task: "T006 хук src/pages/Hero/useSwitchingWord.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 2: T001, T002
2. Phase 3: T003–T007
3. **STOP and VALIDATE**: quickstart, сценарий 1
4. Коммит

### Incremental Delivery

1. Конфиг → коммит
2. US1 → сценарий 1 → коммит
3. US2, US3 → сценарии 2, 4, 7, 8 → правки, если нужны
4. Polish → lint, build
5. После слияния прелоадера — T013

---

## Notes

- [P] — разные файлы, нет зависимостей от незавершённых задач
- Коммиты в ветке `feature/switching-text` по схеме `${часть фичи} ${действие}`, например `config heroWords add`
- T013 помечена ⏸ и не входит в `/speckit-implement` этой ветки
