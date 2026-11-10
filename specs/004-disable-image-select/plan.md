# Implementation Plan: Запрет выделения и перетаскивания изображений

**Branch**: `feature/disable-image-select` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-disable-image-select/spec.md`

## Summary

Глобальное решение из двух частей. CSS в `src/app/styles/_global.scss`: на `img` и `svg` — `user-select: none` и `-webkit-user-drag: none`, поэтому изображения не выделяются, а в Chrome и Safari не тянутся. JS: один обработчик `dragstart` на `document` (`shared/lib/preventImageDrag.ts`) отменяет перетаскивание, если оно началось на `img`/`svg` или на ссылке с `img`/`svg` внутри — это закрывает Firefox и ссылки с иконками (FR-003). Подключается один раз в `src/app/App.tsx`. Новые изображения защищаются автоматически.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: SCSS (глобальные стили `src/app/styles`), DOM API (`dragstart`); без новых библиотек

**Storage**: N/A

**Testing**: ручные сценарии [quickstart.md](./quickstart.md) в Chrome, Safari, Firefox; `yarn lint`, `yarn build`; автотестов нет

**Target Platform**: desktop-браузеры с мышью (Chrome, Safari, Firefox)

**Project Type**: SPA-лендинг (frontend)

**Performance Goals**: один слушатель на `document`, работа только в момент начала перетаскивания

**Constraints**: текст и поля ввода работают как раньше (FR-004, FR-005); обычные текстовые ссылки перетаскиваются как раньше; внешний вид изображений не меняется (FR-007)

**Scale/Scope**: 1 правило в глобальных стилях, 1 функция в `shared/lib`, 1 строка подключения в `app`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `preventImageDrag` лежит в `shared/lib`, подключается в `app`; `shared` ничего не импортирует сверху | ✅ PASS |
| II. Мультиязычность | Текстов интерфейса нет | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; `yarn lint` | ✅ PASS |
| III. Stylelint | Пакет `stylelint` в проекте не установлен, гейт не проверяется | ⚠️ WARN, вне рамок фичи |
| IV. Анимации GSAP | Анимаций нет | ✅ PASS |
| V. Макет и доступность | Вид изображений не меняется; клавиатурная навигация по ссылкам не затронута | ✅ PASS |
| Lighthouse | Влияния нет | ✅ PASS |

**Повторная проверка после Phase 1**: data-model и contracts новых нарушений не добавили; статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/004-disable-image-select/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── prevent-image-drag.md
├── checklists/
│   └── requirements.md
└── tasks.md             # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.tsx                         # + подключение preventImageDrag на document
│   └── styles/
│       └── _global.scss                # + правило img, svg: user-select: none, -webkit-user-drag: none
└── shared/
    └── lib/
        ├── preventImageDrag.ts         # новый: обработчик dragstart
        └── index.ts                    # + экспорт preventImageDrag
```

**Structure Decision**: стили — в глобальном `_global.scss`, потому что правило общее для всех изображений (FR-006). Обработчик — в `shared/lib` как переиспользуемая функция без знаний о страницах; подключение — в `app`, потому что это настройка всего приложения.

## Complexity Tracking

Нарушений constitution, требующих обоснования, нет.
