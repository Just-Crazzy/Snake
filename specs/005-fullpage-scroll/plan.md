# Implementation Plan: Поэкранная прокрутка лендинга на desktop

**Branch**: `feature/fullpage-scroll` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-fullpage-scroll/spec.md`

## Summary

На desktop (ширина от 1025px) один шаг колеса, тачпада или клавиши перемещает окно ровно на одну остановку — верх соседнего экрана, у каждого экрана она одна. Секции остаются в обычном потоке документа: GSAP Observer перехватывает жест, ScrollToPlugin плавно (0,8 с) прокручивает `window`. Остановки каждый раз вычисляются из DOM, поэтому поздняя загрузка секций и нативная прокрутка ничего не рассинхронизируют. Инерцию тачпада гасит «тихий период» 0,3 с после перехода. Ссылки шапки перехватываются делегированным кликом, «Scroll to top» идёт через событие `screen:request` из `shared/lib`, адрес обновляется через `replaceState`. Всё живёт внутри `gsap.matchMedia()` в хуке `useFullpageScroll` рядом с `Home` и полностью снимается при ширине ≤ 1024px, смене языка и размонтировании.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: GSAP 3.15 (`Observer`, `ScrollToPlugin`, `gsap.matchMedia`, `gsap.delayedCall` — плагины уже в пакете `gsap`), react-router-dom 6, Vite, SCSS Modules; без новых пакетов

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md); `yarn lint`, `yarn build`, Lighthouse desktop; автотестов нет

**Target Platform**: современные desktop-браузеры от 1025px ширины; ниже — обычная прокрутка

**Project Type**: SPA-лендинг (frontend)

**Performance Goals**: переход 60 fps, анимируется только позиция прокрутки; переход ≤ 1,2 с (SC-003)

**Constraints**: один жест = одна остановка, включая инерцию тачпада (FR-005); переход 0,8 с; тихий период 0,3 с; высота Multi-tasks на desktop 904px (замер в [research.md](./research.md#r2-высота-экранов-и-порог-по-высоте-окна))

**Scale/Scope**: 4 экрана, 1 новый хук, 1 новый модуль в `shared/lib`, правки в 3 файлах

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `pages/Home` импортирует `shared/lib`; `widgets/Footer` вызывает `requestScreen` из `shared/lib`, а не из `pages`; `shared` ничего не берёт сверху | ✅ PASS |
| II. Мультиязычность | Новых текстов нет; в коде нет проверок языка, `lang` нужен только для пересоздания анимации | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен, гейт не проверяется | ⚠️ WARN, вне рамок фичи |
| IV. Анимации GSAP | Всё внутри `gsap.matchMedia()`, `revert()` при размонтировании, смене языка и пересечении 1024px; хук лежит рядом с `Home`, который знает порядок экранов; на ≤ 1024px режим выключен (строже требования 576px) | ✅ PASS |
| V. Макет и доступность | Вёрстка экранов не меняется (Multi-tasks не ужимается, у экрана одна остановка — верх секции); клавиатура — FR-007/FR-008 | ✅ PASS |
| Lighthouse | Non-passive слушатель колеса может дать замечание в Best Practices (R14) | ⚠️ проверить на реализации |

**Повторная проверка после Phase 1**: data-model и contracts нарушений не добавили. Событие `screen:request` в `shared/lib` — способ для `widgets` вызвать переход, не импортируя `pages`.

## Project Structure

### Documentation (this feature)

```text
specs/005-fullpage-scroll/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── fullpage-scroll.md
├── checklists/
│   └── requirements.md
└── tasks.md             # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── lib/
│       ├── screenNavigation.ts      # новый: requestScreen(id) и имя события screen:request
│       └── index.ts                 # + экспорт requestScreen
├── widgets/
│   └── Footer/
│       └── Footer.tsx               # «Scroll to top»: requestScreen('hero') вместо window.scrollTo
└── pages/
    ├── Hero/
    │   └── Hero.tsx                 # + id="hero" на <section>
    └── Home/
        ├── Home.tsx                 # + вызов useFullpageScroll()
        └── useFullpageScroll.ts     # новый: Observer, ScrollTo, клавиатура, ссылки, адрес, ResizeObserver
```

**Structure Decision**: Хук `useFullpageScroll` лежит в `src/pages/Home/` рядом со страницей, которая собирает экраны и знает их порядок. Экраны находятся по `id` секций (контракт §1), поэтому сами секции про режим не знают. Единственная точка связи со слоем `widgets` — `requestScreen` в `shared/lib`.

## Complexity Tracking

Нарушений constitution, требующих обоснования, нет.
