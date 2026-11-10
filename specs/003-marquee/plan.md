# Implementation Plan: Бегущая строка «Dream big earn bigger!»

**Branch**: `feature/marquee` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-marquee/spec.md`

## Summary

Статичная картинка `public/img/line.png` внизу секции «Multi-benefits» заменяется вёрсткой: наклонная на 1° полоса с жёлтыми линиями сверху и снизу, внутри дорожка из двух одинаковых групп «фраза + змея». GSAP сдвигает дорожку на `xPercent: -50` по кругу справа налево — это ровно ширина одной группы, поэтому цикл бесшовный. Скорость ≈ 100 px/с, длительность пересчитывается по ширине группы. При «уменьшить движение» анимация не создаётся. Полоса — декор, вся скрыта от экранных чтецов. Фраза лежит в `shared/config/marqueeText.ts` как `Record<Lang, string>`.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: GSAP 3.15 (`gsap.to`, `gsap.matchMedia`), react-router-dom 6 (язык из `:lang`), vite-plugin-svgr (`mask.svg?react`), SCSS Modules; без новых библиотек

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md); `yarn lint`, `yarn build`; автотестов нет

**Target Platform**: современные браузеры, все ширины экрана, включая mobile

**Project Type**: SPA-лендинг (frontend)

**Performance Goals**: 60 fps, анимируется только `transform` дорожки

**Constraints**: скорость ≈ 100 px/с (FR-006: повтор проходит 1440px не быстрее 8 с); линии неподвижны (FR-005); нет пустых мест на любой ширине до 3840px (FR-003); единицы только px, rem, em, %

**Scale/Scope**: 1 секция (`pages/MultiBenefits`), 1 компонент, 1 хук, 1 файл конфига; удаление `public/img/line.png`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `pages/MultiBenefits` импортирует только `shared/config`; компонент и хук лежат в папке секции; `shared` ничего не берёт сверху | ✅ PASS |
| II. Мультиязычность | Фраза — `marqueeText: Record<Lang, string>` для en и ru (в обоих английская, Clarifications Q2); в компоненте нет проверок языка | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен, гейт не проверяется | ⚠️ WARN, вне рамок фичи |
| IV. Анимации GSAP | Твин внутри `gsap.matchMedia()` (это `gsap.context`), `revert()` при размонтировании и при смене языка (зависимость от `lang`, R5); анимация лежит рядом с секцией; на mobile работает — бегущая строка прямо разрешена принципом IV | ✅ PASS |
| V. Макет и доступность | Размеры на 1440px по замерам `line.png` (R2); единицы rem, px, %; интерактивных элементов нет | ✅ PASS |
| Lighthouse | Анимируется только `transform`; картинка 1440×132 удаляется | ✅ PASS (проверить на реализации) |

**Повторная проверка после Phase 1**: data-model и contracts новых нарушений не добавили; статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/003-marquee/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── marquee.md
├── mockup/
│   └── marquee.png
├── checklists/
│   └── requirements.md
└── tasks.md             # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
public/img/line.png                         # удалить (используется только в MultiBenefits)
src/
├── shared/
│   └── config/
│       ├── marqueeText.ts                  # новый: Record<Lang, string> — 'Dream big earn bigger!'
│       └── index.ts                        # + экспорт marqueeText
└── pages/
    └── MultiBenefits/
        ├── Marquee.tsx                     # новый: полоса, дорожка, две группы по REPEATS повторов
        ├── Marquee.module.scss             # новый: наклон, линии, overflow, размеры по макету
        ├── Marquee.module.scss.d.ts        # новый: классы для TypeScript
        ├── useMarquee.ts                   # новый: GSAP-твин в gsap.matchMedia, ResizeObserver
        ├── MultiBenefits.tsx               # <img line> → <Marquee className={cls.line} />
        └── MultiBenefits.module.scss       # .line: убрать стили картинки, позиция и ширина остаются
```

**Structure Decision**: `Marquee` и `useMarquee` лежат в `src/pages/MultiBenefits/` рядом с секцией (принцип IV) и в `shared/ui` не выносятся: используются в одном месте. Позиция полосы в секции остаётся в `MultiBenefits.module.scss` (класс `.line` передаётся пропом `className`), внешний вид — в `Marquee.module.scss`.

## Complexity Tracking

Нарушений constitution, требующих обоснования, нет.
