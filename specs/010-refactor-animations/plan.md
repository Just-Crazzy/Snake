# Implementation Plan: Рефакторинг анимаций главной страницы

**Branch**: `refactor/animations` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-refactor-animations/spec.md`

## Summary

**Константы.** Медиазапросы и параметры появления переезжают в `src/shared/config/animation.ts` (`MEDIA`, `INTRO`). Числа 576, 577, 1024 и 1025 остаются в TS-коде только там.

**Общий механизм.** Скопированная логика секций переезжает в два внутренних модуля `src/shared/lib`, они не экспортируются из `index.ts`:
- `intro.ts` — фабрики параметров (новый объект на каждый вызов), `playOnEnter`, `finishOnLeave` (удаляет свои триггеры по `onComplete`), общий `observeLayout` с одним `ResizeObserver` и единственная регистрация `ScrollTrigger`;
- `useSectionAnimation.ts` — `matchMedia`, `playedRef`, пропуск по якорю, `revert`.

**Хуки секций и остальные хуки.**
- `useMultitasksAnimation`, `useMultibenefitsAnimation` и `useMultiplyAnimation` становятся обёртками: в каждом остаются только цели и таймлайн.
- `useHeroAnimation` остаётся отдельным, потому что возвращает `isIntroDone`, но берёт общие части.
- Остальные хуки, прелоадер в `Home.tsx` и `useProgressLine` берут медиазапросы из `MEDIA`.

**Поведение по ширинам.** По конституции 2.1.0 появления, уходы и фоновая сетка работают только от 1025px. Прелоадер показывается от 577px, и это исправляет ошибку на 1px.

**Производительность.** Замер (research R10, R11) показал 50,3 fps фона при 4× CPU. Причина — полноэкранная перерисовка маски сетки, которая каждый кадр тянет за собой размытые свечения. Исправления:
- сетка переходит на «окно» с `transform` без перерисовки;
- свечения переходят на `radial-gradient` без `filter`.

Вместе эти правки дают около 60 fps. Lighthouse и размер JS замеряются до и после отдельными задачами.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19.2

**Primary Dependencies**: GSAP 3.15 (`gsap.matchMedia`, `ScrollTrigger`, `Observer`, `ScrollToPlugin`), react-router-dom 6; новых пакетов нет

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md) и quickstart 006–009; `yarn lint`, `yarn build`, Lighthouse desktop и mobile; автотестов нет

**Target Platform**: современные браузеры, ширина 320–1920px

**Project Type**: web, SPA-лендинг (Vite)

**Performance Goals**:
- фон на desktop при 4× CPU — не ниже 57 fps (сейчас 50,3);
- Lighthouse desktop Performance ≥ 75 и ≥ «до»;
- mobile ≥ «до»;
- JS gzip ≤ 184,68 kB.

**Constraints**:
- без комментариев и `console.log`;
- сигнатуры публичных хуков и их вызовы в компонентах не меняются;
- `src/shared/lib/index.ts` не меняется;
- вид фона на 1440 и 1920 не меняется (SC-009);
- поведение на desktop не меняется, кроме FR-019 и FR-020.

**Scale/Scope**:
- 3 новых файла: `shared/config/animation.ts`, `shared/lib/intro.ts`, `shared/lib/useSectionAnimation.ts`;
- 11 изменённых: `shared/config/index.ts`, 8 хуков `shared/lib`, `pages/Home/Home.tsx`, `widgets/Preloader/useProgressLine.ts`;
- плюс фон: `widgets/Background/GridMesh.tsx`, `BackgroundGlow.tsx`, `Background.module.scss`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `shared/lib` импортирует только `shared/config` и пакеты; `intro.ts` и `useSectionAnimation.ts` импортируются внутри слоя относительными путями; `pages` и `widgets` берут `MEDIA` из `@/shared/config` | ✅ PASS |
| II. Мультиязычность | Текстов не добавляется | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен; SCSS проверяется сборкой и глазами | ⚠️ WARN, вне рамок фичи (как в 008, 009) |
| IV. Уничтожение анимаций | Всё создаётся внутри `gsap.matchMedia().add`; `mm.revert()` при размонтировании и смене `lang`/`isReady`; отписка `observeLayout` возвращается из колбэка `mm.add`; триггеры досрочного завершения убиваются по `onComplete` | ✅ PASS |
| IV. Хуки в `shared/lib`, константы в `shared/config` | `MEDIA`, `INTRO` — `shared/config/animation.ts`; механизм — `shared/lib`; в `pages` только вызовы | ✅ PASS |
| IV. До 1024px только строка и слово; прелоадер от 577px | `INTRO_CONDITIONS` и `useGridMeshAnimation` — `MEDIA.animated` (от 1025px); прелоадер — `MEDIA.notMobile`; `useMarquee` и `useSwitchingWord` не зависят от ширины | ✅ PASS |
| V. Макет и доступность | Разметка секций не меняется; фон сохраняет вид (SC-009); новые размеры в `rem` | ✅ PASS |
| Lighthouse ≥ 75 desktop | Замер до и после отдельными задачами; ожидаемо лучше: меньше перерисовок, меньше триггеров, на планшете меньше анимаций | ✅ PASS, проверить замером |

**Повторная проверка после Phase 1**: data-model и контракты нарушений не добавили. Упрощение до двух условий (research R2) прямо следует из принципа IV 2.1.0. Статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/010-refactor-animations/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── animation-api.md
├── checklists/
│   └── requirements.md
├── measurements.md          # заполняется задачами замеров
└── tasks.md                 # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── config/
│   │   ├── animation.ts                 # новый: MEDIA, INTRO
│   │   └── index.ts                     # + export { MEDIA, INTRO }
│   └── lib/
│       ├── intro.ts                     # новый: фабрики, playOnEnter, finishOnLeave, observeLayout, registerPlugin
│       ├── useSectionAnimation.ts       # новый: общий хук секции
│       ├── useHeroAnimation.ts          # общие части из intro.ts, isIntroDone остаётся
│       ├── useMultitasksAnimation.ts    # только цели, таймлайн появления и уход
│       ├── useMultibenefitsAnimation.ts # только цели и таймлайн
│       ├── useMultiplyAnimation.ts      # только цели и таймлайн
│       ├── useGridMeshAnimation.ts      # MEDIA.animated
│       ├── useMarquee.ts                # MEDIA.motion / MEDIA.reduce
│       ├── useSwitchingWord.ts          # MEDIA.motion / MEDIA.reduce
│       ├── useFullpageScroll.ts         # MEDIA.desktop / MEDIA.reduce
│       └── index.ts                     # без изменений
├── widgets/
│   ├── Background/
│   │   ├── GridMesh.tsx                 # «окно» вместо полноэкранной маски
│   │   ├── BackgroundGlow.tsx           # radial-gradient вместо filter: blur
│   │   └── Background.module.scss       # классы окна, will-change от 1025px, новые размеры свечений
│   └── Preloader/
│       └── useProgressLine.ts           # MEDIA.reduce
└── pages/
    └── Home/
        └── Home.tsx                     # прелоадер по MEDIA.notMobile
```

**Structure Decision**: существующая структура FSD без слоя `features`. Новые файлы лежат в `shared/config` и `shared/lib` по принципу IV. Компоненты секций (`pages/MultiTasks`, `pages/MultiBenefits`, `pages/MultiplyWithUs`, `pages/Hero`) не меняются.

## Порядок работ

1. **Замер «до»**: Lighthouse desktop и mobile, JS gzip, Paint flashing, fps фона, скриншоты фона 1440 и 1920. Делается до любых правок кода, результат идёт в `measurements.md`.
2. **Константы**: `animation.ts` и экспорт из `shared/config`.
3. **Общий механизм**: `intro.ts` и `useSectionAnimation.ts`.
4. **Секции**: Multiply → Multi-benefits → Multi-tasks (идут от простой к сложной), затем Hero. После каждой — её quickstart (009, 008, 007, 006).
5. **Остальные хуки и страница**: `useGridMeshAnimation`, `useMarquee`, `useSwitchingWord`, `useFullpageScroll`, `Home.tsx`, `useProgressLine`.
6. **Фон**: свечения, потом сетка (отдельными шагами, каждый со скриншотами и fps).
7. **Проверка** по [quickstart.md](./quickstart.md), `yarn lint`, `yarn build`.
8. **Замер «после»** и сравнение с «до».

## Изменённые ожидания quickstart 006–009

По FR-008 на ширине 577–1024px появлений больше нет. Ниже — пункты, где меняется ожидаемый результат. Все остальные пункты 006–009 проходят как раньше.

| Фича | Раздел и пункт | Было | Стало |
|---|---|---|---|
| 006 | 5. Ширины и «уменьшить движение», п. 2 | «Ширина 800: появление есть; при прокрутке вниз элементы не улетают…» | после прелоадера всё сразу на месте, появления нет; при прокрутке элементы не улетают |
| 007 | 7. Ширины и «уменьшить движение», п. 1 | «Ширина 800: … появление есть (блок со змеёй слева, затем все карточки…); прокрутить дальше — ничего не улетает» | появления нет, блоки сразу на местах; ничего не улетает |
| 007 | 10. Горизонтальная прокрутка, п. 1 | «На ширинах 800, 1025, … пройти появление и уход» | на 800 появления и ухода нет, проверяется только отсутствие горизонтальной полосы |
| 008 | 6. Ширины и «уменьшить движение», п. 1 | «Ширина 800: … появление есть» | появления нет, блоки сразу на местах |
| 008 | 9. Горизонтальная прокрутка, п. 1 | «На ширинах 800, 1025, … пройти появление» | на 800 появления нет, проверяется только отсутствие полосы |
| 009 | 3. Переход во время появления, п. 2 | «Ширина 800: … не дожидаясь конца появления, быстро докрутить…: всё сразу видно» | появления нет; результат «всё сразу видно» сохраняется, но проверять уже нечего |
| 009 | 8. Ширины и «уменьшить движение», п. 1 | «Ширина 800: … появление есть, заголовок внизу проявляется первым шагом…» | появления нет, всё видно сразу |
| 009 | 10. Горизонтальная прокрутка, п. 1 | «На ширинах 800, 1025, … пройти появление» | на 800 появления нет, проверяется только отсутствие полосы |

Без изменений остаются:
- пункты «на 1440 после появления сузить окно до 800, потом до 375 и обратно до 1440»;
- пункты «Ширина 800: у секции свой фиолетовый градиент, сетки нет»;
- все сценарии desktop, 375px и reduce.

Связанный пункт вне 006–009: в `specs/001-preloader/quickstart.md` уже сказано «шире 576px», а сценарий 7 проверяется на 375px. Исправление на 1px с ним согласовано.

## Complexity Tracking

Нарушений конституции нет, таблица не нужна.
