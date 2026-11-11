# Implementation Plan: Анимация экрана Multi-tasks

**Branch**: `feature/multitasks-animation` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-multitasks-animation/spec.md`

## Summary

Экран Multi-tasks получает две анимации по образцу 006. Появление — один GSAP timeline на паузе, который запускается при первом входе на экран (`ScrollTrigger`, `onEnter`, `once`): блок со змеёй прилетает слева вместе с проявлением заголовка, затем справа колонки карточек, внутри колонки сверху вниз; всё за 1,4 с. Колонки хук определяет по фактическому положению карточек (`offsetLeft`), а не по порядку в разметке. Уход — timeline со `scrollTrigger` и `scrub` на диапазоне `top top` → `bottom top` секции, только от 1025px: заголовок и блоки улетают вверх (`yPercent`) синхронно с переходом на следующий экран и возвращаются при обратном переходе; при переходе вверх на Hero диапазон не затрагивается. Появление меняет `autoAlpha` и `x`, уход — `yPercent`. Всё в одном `gsap.matchMedia()` с ветками `intro`, `exit`, `still` и очисткой `mm.revert()`. Хук `useMultitasksAnimation` лежит в `src/shared/lib`, вызывается из `MultiTasks.tsx` после загрузки контента.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: GSAP 3.15 (`gsap.matchMedia`, `ScrollTrigger` из пакета `gsap`), react-router-dom 6 (`useParams` для `lang`); новых пакетов нет

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md); `yarn lint`, `yarn build`, Lighthouse на desktop; автотестов нет

**Target Platform**: современные браузеры, desktop и mobile, ширина 320–1920px

**Project Type**: web, SPA-лендинг (Vite)

**Performance Goals**: анимируются только `opacity` и `transform`, 60 fps; появление ≤ 1,5 с (план — 1,4 с)

**Constraints**: без комментариев и `console.log` в коде; без горизонтальной прокрутки; не менять `useFullpageScroll` и вёрстку экрана; Lighthouse desktop: Performance ≥ 75, остальные ≥ 90

**Scale/Scope**: 1 новый хук в `shared/lib`, экспорт в `shared/lib/index.ts`, правки `MultiTasks.tsx` (ref, вызов хука, три data-атрибута)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `pages/MultiTasks` импортирует хук из `shared/lib`; хук импортирует только `gsap`, `react`, `react-router-dom` и `SCREENS`/`Lang` из `shared/config`; сверху ничего не берёт | ✅ PASS |
| II. Мультиязычность | Новых текстов нет; `lang` нужен только для пересоздания анимаций | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен; стили в этой фиче не меняются | ⚠️ WARN, вне рамок фичи |
| IV. Уничтожение анимаций | Всё внутри одного `gsap.matchMedia()`, `mm.revert()` при размонтировании, смене `lang` и `isReady`; ширина и «уменьшить движение» — условиями `matchMedia` | ✅ PASS |
| IV. Хуки в `shared/lib` | `src/shared/lib/useMultitasksAnimation.ts`, в `pages/MultiTasks` только вызов и разметка | ✅ PASS |
| IV. Mobile до 576px | Ветка `still`: ни одного твина, блоки сразу на местах | ✅ PASS |
| V. Макет и доступность | Вёрстка не меняется, конечное положение совпадает с `mockup/multitasks.png`; скрытые блоки — `visibility: hidden`, фокус в них не попадает (research R6) | ✅ PASS |
| Lighthouse | Экран ниже первого сгиба, на LCP не влияет; только `opacity`/`transform`, без CLS; замер в Polish | ✅ PASS, проверить замером |

**Повторная проверка после Phase 1**: data-model и contracts новых нарушений не добавили; статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/007-multitasks-animation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── multitasks-animation.md
├── mockup/
│   └── multitasks.png
├── checklists/
│   └── requirements.md
└── tasks.md                 # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── lib/
│       ├── useMultitasksAnimation.ts   # новый: gsap.matchMedia, появление, уход, наблюдатель
│       └── index.ts                    # + экспорт useMultitasksAnimation
└── pages/
    └── MultiTasks/
        └── MultiTasks.tsx              # ref на <section>, вызов хука до ранних return, data-mt / data-mt-group
```

**Structure Decision**: Хук лежит в `src/shared/lib/` по конституции 2.0.0 (принцип IV). Вызывает его `MultiTasks.tsx`, потому что там секция и загрузка контента (research R1, R12). `Home.tsx`, `MultiTasks.module.scss` и `useFullpageScroll` не меняются: `overflow: hidden` у `.page` уже закрывает горизонтальную прокрутку (research R11).

## Отступления от вводных к плану

| Вводная | Решение | Почему |
|---------|---------|--------|
| Ловить вход через `screen:request` или `ScrollTrigger onEnter` | `ScrollTrigger onEnter` | `screen:request` отправляет только кнопка «Scroll to top», переходы колесом, клавишами и ссылками его не создают; на 577–1024px событие не работает (research R2) |
| `data-mt-group="snake\|middle\|right"` | `data-mt-group="snake"` на блоке со змеёй, `data-mt="card"` на карточках; колонки хук вычисляет по `offsetLeft` | Статичные `middle`/`right` пришлось бы проставлять по индексу в разметке, а FR-003 требует группы по фактической колонке (research R3) |
| `overflow-x: clip` у секции | Стили не меняются | У `.page` уже `overflow: hidden`, горизонтальной прокрутки нет (research R11) |

## Complexity Tracking

Нарушений constitution, требующих обоснования, нет.
