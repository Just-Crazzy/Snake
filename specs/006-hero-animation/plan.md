# Implementation Plan: Анимация первого экрана и шапки

**Branch**: `feature/hero-animation` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-hero-animation/spec.md`

## Summary

Первый экран и шапка получают две анимации. Появление — один GSAP timeline: после прелоадера змея и обе части шапки проявляются через `autoAlpha`, затем заголовок, подзаголовок, кнопка и соцсети прилетают слева через `x` и `autoAlpha` со `stagger`, всего около 1,7 с. Когда появление закончилось, хук возвращает `isIntroDone`, Home передаёт его в `Hero` как `isReady`, и только тогда `useSwitchingWord` начинает менять слово. Уход — отдельный timeline со `scrollTrigger` на секции `#hero` (`start: 'top top'`, `end: 'bottom top'`, `scrub: true`): поэкранная прокрутка двигает `window`, поэтому уход идёт синхронно с переходом в обе стороны, а открытие на `/ru#join` сразу даёт progress 1. Появление меняет `autoAlpha` и `x`, уход — `xPercent` и `yPercent`, поэтому GSAP складывает их на одних и тех же элементах без обёрток. Обе анимации живут в одном `gsap.matchMedia()` в хуке `useHeroAnimation` в `src/pages/Home`, который собирает экран и шапку. Элементы находятся по data-атрибутам внутри контейнера Home. `useFullpageScroll` не меняется.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: GSAP 3.15 (timeline, `gsap.matchMedia`, плагин `ScrollTrigger` из того же пакета), react-router-dom 6 (язык из `:lang`), Vite 8, SCSS Modules; без новых пакетов

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md); `yarn lint`, `yarn build`, Lighthouse на desktop; автотестов нет

**Target Platform**: современные браузеры; появление от 577px, уход от 1025px

**Project Type**: SPA-лендинг (frontend)

**Performance Goals**: 60 fps; анимируются только `transform` и `opacity`/`visibility`, раскладка не пересчитывается

**Constraints**: появление ≤ 2 с (FR-006); уход синхронен с переходом поэкранной прокрутки (0,8 с, `power2.inOut`) без собственной длительности; без горизонтальной прокрутки (FR-012); Lighthouse Performance ≥ 75 при змее как LCP-картинке (SC-006)

**Scale/Scope**: 1 новый хук в `shared/lib`, правки `Home.tsx`, `Home.module.scss`, `Hero.tsx`; data-атрибуты в `widgets/Header` и проброс атрибутов в `shared/ui/Socials`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `pages/Home` импортирует `pages/Hero` (уже так), `widgets` и `shared`; виджеты и `shared` получают только data-атрибуты и проброс пропсов, логики анимации в них нет; `shared` ничего не берёт сверху | ✅ PASS |
| II. Мультиязычность | Новых текстов нет; в хуке нет проверок языка, `lang` нужен только для пересоздания анимаций | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен, гейт не проверяется | ⚠️ WARN, вне рамок фичи |
| IV. Уничтожение анимаций | Всё внутри одного `gsap.matchMedia()`, `mm.revert()` при размонтировании, смене `lang` и `isReady`; смена ширины и «уменьшить движение» обрабатываются условиями `matchMedia` | ✅ PASS |
| IV. Анимация рядом со своим блоком | Хук лежит в `shared/lib` рядом с `useFullpageScroll`: анимация одна на экран и шапку, вызывается из Home и сверху ничего не импортирует (research R1) | ✅ PASS, с обоснованием |
| IV. Mobile до 576px | При ширине ≤ 576px timeline не создаются, `isIntroDone` сразу `true`, слово переключается | ✅ PASS |
| V. Макет и доступность | Размеры и вёрстка не меняются; конечное положение совпадает с макетом; интерактивные элементы остаются доступны с клавиатуры, после появления у них `visibility: inherit` | ✅ PASS |
| Lighthouse | Змея — LCP-картинка и стартует с `autoAlpha: 0`; нужен замер, запасной вариант описан в research R9 | ⚠️ проверить на реализации |

**Повторная проверка после Phase 1**: data-model и contracts новых нарушений не добавили; статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/006-hero-animation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── hero-animation.md
├── mockup/
│   └── hero.png             # положить вручную
├── checklists/
│   └── requirements.md
└── tasks.md                 # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── pages/
│   ├── Home/
│   │   ├── Home.tsx                 # ref на контейнер, isReady = !isLoading, useHeroAnimation, <Hero isReady={isIntroDone} />
│   │   └── Home.module.scss         # .header: overflow-x: clip
│   └── Hero/
│       └── Hero.tsx                 # data-hero на content, title, text, button, snake, socials
├── widgets/
│   └── Header/
│       └── Header.tsx               # data-header="left" | "right" на слотах
└── shared/
    ├── lib/
    │   ├── index.ts                 # экспорт useHeroAnimation
    │   └── useHeroAnimation.ts      # новый: gsap.matchMedia, timeline появления и ухода
    └── ui/
        └── Socials/
            └── Socials.tsx          # проброс остальных атрибутов на <ul>
```

**Structure Decision**: Хук `useHeroAnimation` лежит в `src/shared/lib/`, как и `useFullpageScroll`: это отдельный функционал, который Home вызывает для первого экрана и шапки (research R1). Элементы находятся по data-атрибутам внутри контейнера Home (research R7), поэтому виджеты и `shared/ui` получают только разметку, а не логику. `useFullpageScroll` и `useSwitchingWord` не меняются.

## Complexity Tracking

Нарушений constitution, требующих обоснования, нет. Расположение хука в `shared/lib` обосновано в research R1.
