# Implementation Plan: Анимация экрана Multiply with us

**Branch**: `feature/multiply-animation` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-multiply-animation/spec.md`

## Summary

Последний экран Multiply with us получает появление по образцу 007 и 008 и общий фон страницы.

Появление — один GSAP timeline на паузе, запускается при первом входе (`ScrollTrigger`, `onEnter`, `once`). Всё только через `autoAlpha`, без сдвигов: заголовок MULTIPLY WITH US, затем три кнопки слева сверху вниз со stagger, затем карточка вместе с футером. Всего 1,3 с. Змея не анимируется. Ухода нет; переход во время появления доводит его до конца (два наблюдателя, как в 008). По якорю `#join` появления нет.

Прозрачные кнопки и ссылки получают `visibility: hidden` от `autoAlpha`, поэтому не фокусируются и не кликаются.

Фон: секция на desktop становится прозрачной, и за ней виден существующий фиксированный слой `widgets/Background`, как у Hero. `GridMesh` и `widgets/Background` не меняются, его остановку при reduce даёт 008.

Хук `useMultiplyAnimation` лежит в `src/shared/lib` и вызывается из `MultiplyWithUs.tsx`.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19.2

**Primary Dependencies**: GSAP 3.15 (`gsap.matchMedia`, `ScrollTrigger`), react-router-dom 6; новых пакетов нет

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md); `yarn lint`, `yarn build`, Lighthouse на desktop; автотестов нет

**Target Platform**: современные браузеры, desktop и mobile, ширина 320–1920px

**Project Type**: web, SPA-лендинг (Vite)

**Performance Goals**: анимируется только `opacity` (+ `visibility`), 60 fps; появление ≤ 1,5 с (по плану 1,3 с)

**Constraints**:
- без комментариев и `console.log`;
- только `autoAlpha`, без сдвигов; змея не анимируется;
- не трогать `GridMesh`, `widgets/Background`, `useFullpageScroll`, `Home.tsx`;
- Lighthouse desktop: Performance ≥ 75, остальные ≥ 90.

**Scale/Scope**: 1 новый хук в `shared/lib`; экспорт в `index.ts`; правки `MultiplyWithUs.tsx` (ref, вызов хука, `ref`-пропс у `MultiplyWithUsContent`, data-атрибуты) и `MultiplyWithUs.module.scss` (прозрачный фон на desktop).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `pages/MultiplyWithUs` импортирует хук из `shared/lib`; хук импортирует только `gsap`, `react`, `react-router-dom` и `SCREENS`/`Lang` из `shared/config` | ✅ PASS |
| II. Мультиязычность | Новых текстов нет | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен; правка SCSS проверяется сборкой и глазами | ⚠️ WARN, вне рамок фичи (как в 008) |
| IV. Уничтожение анимаций | `gsap.matchMedia()` с `mm.revert()` при размонтировании и смене `lang`/`isReady`; `ResizeObserver` отключается в cleanup | ✅ PASS |
| IV. Логика в `shared/lib` | `useMultiplyAnimation` в `src/shared/lib`; в `pages` только вызов и разметка (research R1) | ✅ PASS |
| IV. Mobile до 576px | Появление — ветка `still`. Фон до 576px в этой ветке ещё движется — это существующее поведение, исправляет 008 (research R9) | ✅ PASS для фичи |
| V. Макет и доступность | Разметка не меняется, только атрибуты; градиент совпадает с макетом (research R8); скрытые блоки — `visibility: hidden`, без фокуса и кликов (research R10) | ✅ PASS |
| Lighthouse | Экран последний; только `opacity`; новых бесконечных анимаций нет; замер в Polish | ✅ PASS, проверить замером |

**Повторная проверка после Phase 1**: data-model и contracts новых нарушений не добавили; статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/009-multiply-animation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── multiply-animation.md
├── mockup/
│   └── multiply.png
├── checklists/
│   └── requirements.md
└── tasks.md                 # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── lib/
│       ├── useMultiplyAnimation.ts   # новый: matchMedia intro/still, появление, вход, два наблюдателя, ResizeObserver
│       └── index.ts                  # + экспорт useMultiplyAnimation
└── pages/
    └── MultiplyWithUs/
        ├── MultiplyWithUs.tsx        # ref и вызов хука во внешнем компоненте, ref-пропс у Content, data-mw
        └── MultiplyWithUs.module.scss # .page: прозрачный фон на desktop
```

**Structure Decision**: Хук — в `src/shared/lib/` по конституции 2.0.0 (принцип IV). Его вызывает внешний `MultiplyWithUs`, который знает о загрузке контента. Ref передаётся в `MultiplyWithUsContent` пропсом `ref` (React 19, research R1). Общий код с 007 и 008 не выносится, пока они не слиты (research R2).

## Уточнения к вводным

| Вводная | Решение | Почему |
|---------|---------|--------|
| `data-mw="title"` | Ставится и на `h2.label`, и на `p.bottomLabel` | На 577–1024px заголовок — нижний `p.bottomLabel`; без атрибута он не проявлялся бы первым шагом, как записано в Assumptions (research R4) |
| `progress(1)` при переходе в любую сторону | Два наблюдателя, как в 008 | Экран последний: на desktop уйти можно только вверх; наблюдатель «вниз» нужен на 577–1024, где секцию листают обычной прокруткой (research R6) |
| Образец 007 и 008 | + `ResizeObserver` с `ScrollTrigger.refresh()` из 008 R14 | Контент двух экранов выше грузится отдельно и сдвигает секцию; без пересчёта появление стартует раньше времени (research R7) |
| Фон: только прозрачность секции | Так и сделано; reduce для фона не трогаем | Остановку `GridMesh` делает 008; в этой ветке до слияния фон при reduce ещё движется (research R9) |

## Файлы, общие с 008: возможные конфликты при мерже

| Файл | Что меняет 008 | Что меняет 009 | Конфликт |
|------|----------------|----------------|----------|
| `src/shared/lib/index.ts` | + `useGridMeshAnimation` (после `useFullpageScroll`), + `useMultibenefitsAnimation` (после `useMarquee`) | + `useMultiplyAnimation` (после `useMarquee`) | **Да**: обе ветки вставляют строку между `useMarquee` и `useSwitchingWord`. Разрешение — оставить все строки в алфавитном порядке: `useMarquee`, `useMultibenefitsAnimation`, `useMultiplyAnimation`, `useSwitchingWord`. Тот же конфликт будет с 007 (`useMultitasksAnimation`) |

Остальные файлы 009 (`useMultiplyAnimation.ts`, `MultiplyWithUs.tsx`, `MultiplyWithUs.module.scss`) 008 не трогает. Файлы 008 (`GridMesh.tsx`, `useGridMeshAnimation.ts`, `MultiBenefits.*`, `useMultibenefitsAnimation.ts`) не трогает 009. `.specify/feature.json` в 008 не меняется относительно `dev`, конфликта нет.

После слияния: функции `isOpenedOnScreen`, условия `matchMedia`, наблюдатели и `ResizeObserver` повторяются в 007, 008 и 009 — кандидат на отдельный рефакторинг (research R2).

## Complexity Tracking

Нарушений constitution, требующих обоснования, нет.
