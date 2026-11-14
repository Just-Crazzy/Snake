# Implementation Plan: Переключающееся слово в заголовке Hero

**Branch**: `feature/switching-text` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-switching-text/spec.md`

## Summary

Жёлтое акцентное слово в заголовке Hero «Practice makes …» по кругу сменяется: SKILLS → PROFIT → GROWTH → SKILLS. Уходящее слово уезжает вниз, новое приходит сверху. Все слова лежат в одной ячейке CSS grid друг на друге: ширину задаёт самое длинное слово, поэтому заголовок и кнопка не сдвигаются. Анимация — GSAP timeline с `repeat: -1` в хуке `useSwitchingWord` рядом с Hero, внутри `gsap.matchMedia()`: при «уменьшить движение» смена мгновенная. Экранные чтецы читают полную фразу из `.sr-only`, анимированные слова скрыты от них. Слова лежат в `shared/config` как `Record<Lang, string[]>` и позже переедут в i18n.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: GSAP 3.15 (timeline, `gsap.matchMedia`), react-router-dom 6 (язык из `:lang`), Vite 8, SCSS Modules; без новых библиотек

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md); `yarn lint`, `yarn build`; автотестов нет

**Target Platform**: современные браузеры, все ширины экрана, включая mobile

**Project Type**: SPA-лендинг (frontend)

**Performance Goals**: анимация 60 fps, только `transform` (`yPercent`), без перерасчёта раскладки

**Constraints**: показ слова ≈ 2,5 с, смена ≈ 0,6 с (FR-005: ≥ 2 с и ≤ 1 с); соседние элементы не двигаются (FR-007); буквы не обрезаются (FR-006)

**Scale/Scope**: 1 секция (`pages/Hero`), 1 новый хук, 1 новый файл конфига

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `pages/Hero` импортирует только `shared/config`; хук лежит в той же папке; `shared` ничего не берёт сверху | ✅ PASS |
| II. Мультиязычность | Слова — `heroWords: Record<Lang, string[]>` для en и ru (в обоих английские, Clarifications Q2); в компоненте нет проверок языка | ✅ PASS |
| II. Мультиязычность | Начало заголовка «Practice makes» захардкожено в `Hero.tsx` ещё до этой фичи и не переводится (слоган, Q2); перевод заголовка вне рамок спеки | ⚠️ WARN, существующее, вне рамок |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен, гейт не проверяется | ⚠️ WARN, вне рамок фичи |
| IV. Анимации GSAP | Всё внутри `gsap.matchMedia()` (это `gsap.context`), `revert()` при размонтировании и смене языка; хук лежит в `shared/lib`, папка страницы только для страницы; на mobile работает — переключающаяся строка прямо разрешена принципом IV | ✅ PASS |
| V. Макет и доступность | Шрифт и размеры заголовка не меняются; единицы `rem`, `em`, `%`; интерактивных элементов нет | ✅ PASS |
| Lighthouse | Анимируется только `transform`, раскладка не пересчитывается | ✅ PASS (проверить на реализации) |

**Повторная проверка после Phase 1**: data-model и contracts новых нарушений не добавили; статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/002-switching-text/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── hero-switching-word.md
├── mockup/
│   └── hero.png
├── checklists/
│   └── requirements.md
└── tasks.md             # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── config/
│   │   ├── heroWords.ts              # новый: Record<Lang, string[]> — skills, profit, growth
│   │   └── index.ts                  # + экспорт heroWords
│   └── lib/
│       ├── useSwitchingWord.ts       # новый: GSAP timeline внутри gsap.matchMedia
│       └── index.ts                  # + экспорт useSwitchingWord
└── pages/
    └── Hero/
        ├── Hero.tsx                  # h1: .sr-only с полной фразой + видимая строка с aria-hidden; проп isReady
        └── Hero.module.scss          # + .words (grid-стопка, overflow: hidden) и .word
```

**Structure Decision**: Хук `useSwitchingWord` лежит в `src/shared/lib/`: папки `pages` только для страниц, хуки и анимации — в `shared/lib`. `Hero.tsx` только размечает слова и отдаёт хуку ref. Слова — в `src/shared/config/heroWords.ts` по образцу `preloaderTexts`, потому что `feature/internalization` ещё не в `dev`; после слияния i18n они переносятся в `hero.words` в locales, а хук не меняется.

## Complexity Tracking

Нарушений constitution, требующих обоснования, нет.
