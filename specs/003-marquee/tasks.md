---

description: "Task list for feature implementation: Бегущая строка «Dream big earn bigger!»"
---

# Tasks: Бегущая строка «Dream big earn bigger!»

**Input**: Design documents from `specs/003-marquee/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: автотестов нет (plan, Testing); проверка — сценарии [quickstart.md](./quickstart.md).

**Organization**: порядок задач — конфиг → вёрстка Marquee → хук → замена картинки в MultiBenefits; задачи сгруппированы по user stories из spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно (разные файлы, нет зависимости от незавершённых задач)
- **[Story]**: к какой user story относится задача (US1–US3)
- Во всех файлах: без комментариев и `console.log` (constitution, принцип III); размеры только в px, rem, em, % (принцип V)

---

## Phase 1: Setup

Отдельной настройки не нужно: GSAP, SCSS Modules и `vite-plugin-svgr` (`?react`) уже есть в проекте.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: фраза бегущей строки, от которой зависит компонент

- [X] T001 [P] Создать `src/shared/config/marqueeText.ts`: `marqueeText: Record<Lang, string>` (тип `Lang` из `./languages`). Правило из data-model: «Для каждого языка из `LANGUAGES`; сейчас en и ru — `'Dream big earn bigger!'`», регистр — «как в строке, заглавные задаёт CSS»; экспорт `export { marqueeText };`
- [X] T002 Экспортировать `marqueeText` из `src/shared/config/index.ts` (`export { marqueeText } from './marqueeText';`). Зависит от T001

**Checkpoint**: `yarn build` проходит

---

## Phase 3: User Story 1 — Строка бежит без остановки (Priority: P1) 🎯 MVP

**Goal**: фраза и змея непрерывно бегут справа налево, без скачков и пустых мест, вместо статичной картинки

**Independent Test**: quickstart, сценарии 1 и 4

- [X] T003 [P] [US1] Создать `src/pages/MultiBenefits/Marquee.module.scss` по замерам research R2: `.marquee` — `overflow: hidden`, `transform: rotate(1deg)`, `border-top` и `border-bottom: 3px solid $c-second`, `color: $c-second`, `font-family: $font-family-main`, `text-transform: uppercase`, `white-space: nowrap`, `line-height: 1`, вертикальные `padding`, чтобы расстояние между линиями было ≈ 101px; `.track` — `display: flex`, `width: max-content`; `.group` и `.item` — `display: flex`, `align-items: center`, `flex-shrink: 0`; `.text` — `font-size: rem(68)`; `.icon` — `width: rem(59)`, `height: auto`, `margin: 0 rem(60)`, `flex-shrink: 0`; в `@include max-media(1024)` уменьшенные значения: шрифт ≈ `rem(24)`, змея ≈ `rem(21)`, отступы ≈ `rem(20)`, `padding` пропорционально
- [X] T004 [P] [US1] Создать `src/pages/MultiBenefits/Marquee.module.scss.d.ts` с классами `marquee`, `track`, `group`, `item`, `text`, `icon` (формат как у соседних `.module.scss.d.ts`; плагин `vite-plugin-sass-dts` перегенерирует файл при `yarn dev`, итог должен совпасть)
- [X] T005 [US1] Создать `src/pages/MultiBenefits/Marquee.tsx` (contract «Marquee props», «Разметка»): проп `className?: string`; язык из `useParams<{ lang: Lang }>()` с `lang = 'en'` по умолчанию, `const text = marqueeText[lang]`; константа `REPEATS = 4` (data-model: «Повторов «фраза + змея» в одной группе; группа шире экрана 3840px»); корень `<div className={[cls.marquee, className].filter(Boolean).join(' ')} aria-hidden="true">`, внутри `<div className={cls.track}>` с двумя одинаковыми `<div className={cls.group}>`, в каждой `REPEATS` раз `<span className={cls.item}><span className={cls.text}>{text}</span><Mask className={cls.icon} /></span>`, где `Mask` — `@public/icons/mask.svg?react` (research R6, R7). Зависит от T002, T003, T004
- [X] T006 [P] [US1] Создать `src/pages/MultiBenefits/useMarquee.ts` (contract `useMarquee(lang, text)`; research R3, R4, R5): `trackRef` и `groupRef` через `useRef<HTMLDivElement>(null)`; константа `SPEED = 100`; в `useEffect` при пустых ref — выход; `const mm = gsap.matchMedia()`; `mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {…}, track)`; внутри: при `ctx.conditions?.reduce` — выход без анимации (FR-009); `const tween = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: group.offsetWidth / SPEED })` (FR-001, FR-002, FR-006); `ResizeObserver` на группе: `const progress = tween.progress(); tween.duration(group.offsetWidth / SPEED).progress(progress);` (FR-012); функция `mm.add` возвращает `() => observer.disconnect()`; cleanup эффекта — `mm.revert()`; зависимости `[lang, text]` (FR-010, принцип IV); вернуть `{ trackRef, groupRef }`
- [X] T007 [US1] В `src/pages/MultiBenefits/Marquee.tsx` вызвать `const { trackRef, groupRef } = useMarquee(lang, text)`, повесить `ref={trackRef}` на `cls.track` и `ref={groupRef}` на первую `cls.group`. Зависит от T005, T006
- [X] T008 [US1] В `src/pages/MultiBenefits/MultiBenefits.tsx` удалить импорт `line` из `@public/img/line.png` и заменить `<img className={cls.line} src={line} alt="" />` на `<Marquee className={cls.line} />` (импорт `import { Marquee } from './Marquee';`). Зависит от T007
- [X] T009 [P] [US1] В `src/pages/MultiBenefits/MultiBenefits.module.scss` в `.line` убрать стиль картинки `height: auto`; позицию и ширину (`width: 100%`, `pointer-events: none`, правила `max-media(1024)` с `width: 120%`) оставить (research R8)
- [X] T010 [US1] Удалить файл `public/img/line.png` и убедиться поиском, что `line.png` больше нигде не упоминается в `src` (research R8, quickstart сценарий 9). Зависит от T008

**Checkpoint**: сценарии 1 и 4 из quickstart проходят — это MVP

---

## Phase 4: User Story 2 — Строка выглядит как на макете (Priority: P2)

**Goal**: на 1440px полоса совпадает с макетом; на mobile и tablet сохраняет пропорции

**Independent Test**: quickstart, сценарии 3 и 4

- [X] T011 [US2] Сравнить полосу на 1440px с `specs/003-marquee/mockup/marquee.png` и замерами research R2; подогнать в `src/pages/MultiBenefits/Marquee.module.scss` `font-size`, начертание (`font-weight`), `letter-spacing` так, чтобы ширина фразы была ≈ 1044px, высота заглавных ≈ 45px, расстояние между линиями ≈ 101px; проверить 375px и 1024px (FR-004, SC-003)

**Checkpoint**: сценарии 3 и 4 проходят

---

## Phase 5: User Story 3 — Доступность и «уменьшить движение» (Priority: P3)

**Goal**: чтецы не зачитывают повторы; при «уменьшить движение» полоса неподвижна

**Independent Test**: quickstart, сценарии 7 и 8

- [X] T012 [US3] Проверить сценарии 7 и 8 из quickstart; если фраза есть в дереве доступности или при «уменьшить движение» строка бежит, исправить `aria-hidden` в `src/pages/MultiBenefits/Marquee.tsx` или условие `reduce` в `src/pages/MultiBenefits/useMarquee.ts` (FR-008, FR-009)

**Checkpoint**: сценарии 7 и 8 проходят

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T013 Пройти сценарии 2, 5, 6, 9 из [quickstart.md](./quickstart.md) (скорость, ресайз через 1024px, смена языка, отсутствие `line.png`)
- [X] T014 Проверить, что в `src/pages/MultiBenefits/Marquee.tsx`, `src/pages/MultiBenefits/useMarquee.ts`, `src/pages/MultiBenefits/Marquee.module.scss`, `src/shared/config/marqueeText.ts` нет комментариев и `console.log`; `yarn lint` без ошибок в изменённых файлах
- [X] T015 `yarn build` без ошибок TypeScript

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)** → **US1 (Phase 3)**
- **US2 (Phase 4)** и **US3 (Phase 5)** — проверки и подгонка поверх US1, между собой независимы
- **Polish (Phase 6)** — после всех историй

### Within User Story 1

- T003, T004, T006, T009 — параллельно (разные файлы)
- T005 после T002, T003, T004
- T007 после T005 и T006
- T008 после T007
- T010 после T008

### Parallel Opportunities

- Phase 2: T001 параллельно с T003, T004, T006, T009
- Phase 3: T003, T004, T006, T009
- Phases 4 и 5: T011 и T012

---

## Parallel Example: User Story 1

```text
Task: "T003 стили полосы в src/pages/MultiBenefits/Marquee.module.scss"
Task: "T004 классы в src/pages/MultiBenefits/Marquee.module.scss.d.ts"
Task: "T006 хук src/pages/MultiBenefits/useMarquee.ts"
Task: "T009 .line в src/pages/MultiBenefits/MultiBenefits.module.scss"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 2: T001, T002
2. Phase 3: T003–T010
3. **STOP and VALIDATE**: quickstart, сценарии 1 и 4
4. Коммит

### Incremental Delivery

1. Конфиг → коммит
2. US1 → сценарии 1, 4 → коммит
3. US2 → подгонка под макет → коммит
4. US3 → сценарии 7, 8
5. Polish → lint, build

---

## Notes

- [P] — разные файлы, нет зависимостей от незавершённых задач
- Коммиты в ветке `feature/marquee` по схеме `${часть фичи} ${действие}`, например `config marqueeText add`
