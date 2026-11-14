# Implementation Plan: Анимация экрана Multi-benefits

**Branch**: `feature/benefits-animation` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-multibenefits-animation/spec.md`

## Summary

Экран Multi-benefits получает появление по образцу 007 и общий фон страницы. Появление — один GSAP timeline на паузе, запускается при первом входе (`ScrollTrigger`, `onEnter`, `once`): надпись MULTI-BENEFITS проявляется вместе с заголовком, заголовок и текст прилетают слева, змея справа, три карточки справа сверху вниз; всё за 1,45 с. Змея — псевдоэлемент, поэтому GSAP анимирует CSS-переменные `--snake-x` и `--snake-opacity` на `div.container__content`, значения по умолчанию в SCSS равны конечному состоянию. Ухода нет; переход во время появления в любую сторону доводит его до конца (два наблюдателя). Фон: секция на desktop становится прозрачной, и за ней виден существующий фиксированный слой `widgets/Background`, как у Hero. Анимация `GridMesh` выносится в хук `useGridMeshAnimation` в `shared/lib` и останавливается при «уменьшить движение» и до 576px. Хук появления `useMultibenefitsAnimation` — в `src/shared/lib`, вызывается из `MultiBenefits.tsx`.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: GSAP 3.15 (`gsap.matchMedia`, `ScrollTrigger`, анимация CSS-переменных), react-router-dom 6; новых пакетов нет

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md); `yarn lint`, `yarn build`, Lighthouse на desktop; автотестов нет

**Target Platform**: современные браузеры, desktop и mobile, ширина 320–1920px

**Project Type**: web, SPA-лендинг (Vite)

**Performance Goals**: анимируются `opacity`, `transform` и CSS-переменные, 60 fps; появление ≤ 1,5 с (план — 1,45 с)

**Constraints**: без комментариев и `console.log`; без горизонтальной прокрутки; не менять разметку, `useFullpageScroll` и бегущую строку; Lighthouse desktop: Performance ≥ 75, остальные ≥ 90

**Scale/Scope**: 2 новых хука в `shared/lib` (`useMultibenefitsAnimation`, `useGridMeshAnimation`), экспорт в `shared/lib/index.ts`; правки `MultiBenefits.tsx` (ref, вызов хука, пять data-атрибутов), `MultiBenefits.module.scss` (CSS-переменные змеи, прозрачный фон на desktop), `GridMesh.tsx` (вызов хука вместо `useEffect`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `pages/MultiBenefits` и `widgets/Background` импортируют хуки из `shared/lib`; хуки импортируют только `gsap`, `react`, `react-router-dom` и `SCREENS`/`Lang` из `shared/config` | ✅ PASS |
| II. Мультиязычность | Новых текстов нет | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен; правки SCSS проверяются сборкой и глазами | ⚠️ WARN, вне рамок фичи |
| IV. Уничтожение анимаций | Оба хука — `gsap.matchMedia()` с `mm.revert()` при размонтировании; появление — ещё и при смене `lang` и `isReady` | ✅ PASS |
| IV. Логика в `shared/lib` | `useMultibenefitsAnimation` и `useGridMeshAnimation` в `src/shared/lib`; в `pages` и `widgets` только вызов и разметка (research R9) | ✅ PASS |
| IV. Mobile до 576px | Появление — ветка `still`; фон — условие `matchMedia` не совпадает, timeline не создаётся | ✅ PASS |
| V. Макет и доступность | Разметка не меняется; общий фон того же градиента, что у секции (research R8); скрытые блоки — `visibility: hidden` | ✅ PASS |
| Lighthouse | Экран ниже первого сгиба; новых бесконечных анимаций нет; замер в Polish | ✅ PASS, проверить замером |

**Повторная проверка после Phase 1**: data-model и contracts новых нарушений не добавили; статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/008-multibenefits-animation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── multibenefits-animation.md
├── mockup/
│   └── multibenefits.png
├── checklists/
│   └── requirements.md
└── tasks.md                 # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── lib/
│       ├── useMultibenefitsAnimation.ts   # новый: matchMedia intro/still, появление, вход, два наблюдателя
│       ├── useGridMeshAnimation.ts        # новый: анимация сетки фона из GridMesh + условие reduce/576
│       └── index.ts                       # + экспорт обоих хуков
├── widgets/
│   └── Background/
│       └── GridMesh.tsx                   # useEffect заменён вызовом useGridMeshAnimation(maskRef)
└── pages/
    └── MultiBenefits/
        ├── MultiBenefits.tsx              # ref на <section>, вызов хука до ранних return, data-mb
        └── MultiBenefits.module.scss      # .page: прозрачный фон на desktop; --snake-x / --snake-opacity у .container__content и ::before
```

**Structure Decision**: Оба хука — в `src/shared/lib/` по конституции 2.0.0 (принцип IV). `useMultibenefitsAnimation` вызывает `MultiBenefits.tsx`, где секция и загрузка контента (research R1). `useGridMeshAnimation` вызывает `GridMesh.tsx` (research R9). Общая функция с 007 не выносится: 007 ещё не в `dev` (research R2). `Home.tsx`, `useFullpageScroll`, `Marquee` и `useMarquee` не меняются.

## Отступления от вводных к плану

| Вводная | Решение | Почему |
|---------|---------|--------|
| Вынести общий код с 007 в `shared/lib` | Не выносить сейчас | 007 ещё не слит в `dev`, в этой ветке его нет; вынос — после слияния веток (research R2) |
| `data-mb="title\|text\|card\|label"` | + `data-mb="snake"` на `div.container__content` | Классы CSS Modules хешируются; без атрибута хук не найдёт элемент, на котором меняются CSS-переменные змеи (research R4) |
| Учёт reduce прямо в `widgets/Background/GridMesh` | Логика анимации — в `src/shared/lib/useGridMeshAnimation.ts`, `GridMesh` вызывает хук | Конституция 2.0.0: логика анимаций лежит в `shared/lib`, а не в виджете (research R9) |
| `progress(1)` при начале перехода | Два наблюдателя: вниз и вверх | FR-008 требует доводить появление при переходе в любую сторону (research R6) |

## Complexity Tracking

Нарушений constitution, требующих обоснования, нет.
