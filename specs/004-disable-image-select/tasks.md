---

description: "Task list for feature implementation: Запрет выделения и перетаскивания изображений"
---

# Tasks: Запрет выделения и перетаскивания изображений

**Input**: Design documents from `specs/004-disable-image-select/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: автотестов нет (plan, Testing); проверка — сценарии [quickstart.md](./quickstart.md) в Chrome, Safari, Firefox.

**Organization**: задачи сгруппированы по user stories из spec.md (US1 — выделение, US2 — перетаскивание; обе P1).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: можно делать параллельно (разные файлы, нет зависимости от незавершённых задач)
- **[Story]**: к какой user story относится задача (US1, US2)
- Во всех файлах: без комментариев и `console.log` (constitution, принцип III)

---

## Phase 1: Setup

Отдельной настройки не нужно.

---

## Phase 2: Foundational (Blocking Prerequisites)

Общих блокирующих задач нет: истории правят разные файлы.

---

## Phase 3: User Story 1 — Картинки не выделяются мышью (Priority: P1) 🎯 MVP

**Goal**: изображения не подсвечиваются при двойном клике, выделении рамкой и «выделить всё»; текст выделяется как раньше

**Independent Test**: quickstart, сценарии 1–3

- [X] T001 [P] [US1] В `src/app/styles/_global.scss` после правила `img { object-fit: cover; … }` добавить правило для `img, svg`: `-webkit-user-select: none`, `user-select: none`, `-webkit-user-drag: none` (research R1); существующие `.noselect`, `.hidden`, `.visible` и `.digits` в `NotFound.module.scss` не трогать (research R4)

**Checkpoint**: сценарии 1–3 из quickstart проходят — это MVP

---

## Phase 4: User Story 2 — Картинки не перетаскиваются (Priority: P1)

**Goal**: ни картинка, ни ссылка с картинкой или иконкой не даёт «призрак» при перетаскивании; клики и текстовые ссылки работают как раньше

**Independent Test**: quickstart, сценарии 4–7

- [X] T002 [P] [US2] Создать `src/shared/lib/preventImageDrag.ts` (contract `preventImageDrag(event: DragEvent): void`; research R2): `const target = event.target;` если `!(target instanceof Element)` — выход; если `target.closest('img, svg')` найден или `target.closest('a')?.querySelector('img, svg')` найден — `event.preventDefault()`; экспорт `export { preventImageDrag };`
- [X] T003 [US2] Экспортировать `preventImageDrag` из `src/shared/lib/index.ts` (`export { preventImageDrag } from './preventImageDrag';`, в алфавитном порядке перед `useHashModal`). Зависит от T002
- [X] T004 [US2] В `src/app/App.tsx` импортировать `preventImageDrag` из `@/shared/lib` и перед `createRoot(...)` вызвать `document.addEventListener('dragstart', preventImageDrag);` (research R3, без `useEffect` и без снятия слушателя). Зависит от T003

**Checkpoint**: сценарии 4–7 из quickstart проходят

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T005 Пройти сценарии 1–8 из [quickstart.md](./quickstart.md) в Chrome, Safari и Firefox (выделение двойным кликом и рамкой, «выделить всё», перетаскивание змеи, логотипа и иконки соцсети, клик по ссылкам, перетаскивание текстовой ссылки, текст и поля формы)
- [X] T006 Проверить, что в `src/shared/lib/preventImageDrag.ts`, `src/app/App.tsx` и добавленном правиле в `src/app/styles/_global.scss` нет новых комментариев и `console.log`; `yarn lint` без ошибок в изменённых файлах
- [X] T007 `yarn build` без ошибок TypeScript

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 3)** и **US2 (Phase 4)** независимы: разные файлы
- **Polish (Phase 5)** — после обеих историй

### Within User Story 2

- T002 → T003 → T004

### Parallel Opportunities

- T001 и T002 — параллельно

---

## Parallel Example

```text
Task: "T001 правило img, svg в src/app/styles/_global.scss"
Task: "T002 обработчик src/shared/lib/preventImageDrag.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. T001
2. **STOP and VALIDATE**: quickstart, сценарии 1–3 (в Chrome и Safari CSS уже запрещает и перетаскивание картинок)
3. Коммит

### Incremental Delivery

1. US1 → сценарии 1–3 → коммит
2. US2 → сценарии 4–7 (включая Firefox) → коммит
3. Polish → все сценарии в трёх браузерах, lint, build

---

## Notes

- [P] — разные файлы, нет зависимостей от незавершённых задач
- Коммиты в ветке `feature/disable-image-select` по схеме `${часть фичи} ${действие}`, например `styles image-select add`
- После слияния с `feature/preloader`: из `Preloader.module.scss` можно убрать `-webkit-user-drag: none` в блоке `img, svg` (research R4) — отдельная задача, в эту ветку не входит
