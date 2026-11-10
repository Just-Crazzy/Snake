# Implementation Plan: Прелоадер лендинга CPA

**Branch**: `feature/preloader` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-preloader/spec.md`

## Summary

На экранах от 576px при открытии любой языковой версии сайта показывается прелоадер по макету: логотип, число процентов и линия. Прелоадер ждёт шрифты и изображения первого экрана и успешные ответы API по всем трём секциям текущего языка. Линия и число анимируются GSAP одним значением: плавно к 90%, после готовности — быстро к 100%, затем растворение, минимум 1 с. Если за 60 с ответов нет, показываются локальные тексты ошибки и кнопка «Повторить». Первый кадр до загрузки JS закрывает статичная оболочка в `index.html`. Чтобы не запрашивать данные дважды, в `shared/api` появляется кэш контента, которым пользуются и прелоадер, и секции.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: GSAP 3.15 (анимация линии и растворения), react-router-dom 6 (язык из `:lang`), Vite 8, SCSS Modules

**Storage**: N/A — кэш контента в памяти вкладки до перезагрузки

**Testing**: ручные сценарии [quickstart.md](./quickstart.md) в Chrome DevTools; `yarn lint`, `yarn build`; автотестов нет (R11)

**Target Platform**: современные desktop- и tablet-браузеры, ширина экрана от 576px

**Project Type**: SPA-лендинг (frontend), API — внешний сервис с холодным стартом 30–40 с

**Performance Goals**: анимация линии 60 fps; прелоадер виден не меньше 1 с; Lighthouse desktop по constitution

**Constraints**: дедлайн ошибки 60 с; повтор запросов каждые 3 с; линия не превышает 90% до готовности и не идёт назад; без новых npm-зависимостей

**Scale/Scope**: 1 виджет, изменения в `shared/api`, `shared/config`, `pages/Home`, `index.html`; языки из `LANGUAGES` (en, ru)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---------|----------|--------|
| I. Упрощённая FSD | `widgets/Preloader` импортирует только `shared/api`, `shared/config`, `shared/ui` (Logo); `pages/Home` импортирует виджет; `shared` ничего не берёт сверху | ✅ PASS |
| II. Мультиязычность | Тексты прелоадера — `Record<Lang, PreloaderTexts>` в `shared/config` для en и ru; компонент берёт `preloaderTexts[lang]`, без проверок языка | ✅ PASS |
| III. Чистый код и линтеры | Без комментариев и `console.log`; ESLint — `yarn lint` | ✅ PASS |
| III. Stylelint | В проекте есть `.stylelintrc.json`, но пакет `stylelint` не установлен и скрипта нет — гейт сейчас не проверяется | ⚠️ WARN, вне рамок фичи |
| IV. Анимации GSAP | Твины в `gsap.context()`, `ctx.revert()` при размонтировании; анимация лежит в `widgets/Preloader`; на mobile прелоадера нет | ✅ PASS с отступлением, см. Complexity Tracking |
| V. Макет и доступность | Размеры по `mockup/preloader.png` в px/rem/em/%; «Повторить» доступна с клавиатуры, фокус переходит на неё | ✅ PASS |
| Безопасность | Новых секретов нет; `request` по-прежнему берёт ключ из `.env` | ✅ PASS |
| Lighthouse | LCP сдвигается на время показа (≥ ~1,3 с); проверка на `yarn preview` (R8) | ✅ PASS (проверить на реализации) |

**Повторная проверка после Phase 1**: дизайн (data-model, contracts) новых нарушений не добавил; статусы выше без изменений.

## Project Structure

### Documentation (this feature)

```text
specs/001-preloader/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── preloader-ui.md
│   └── content-prefetch.md
├── mockup/
│   └── preloader.png
├── checklists/
│   └── requirements.md
└── tasks.md             # создаёт /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── index.html                          # + статичная оболочка #preloader-shell, preload шрифта (R6)
├── shared/
│   ├── api/
│   │   ├── request.ts                  # + необязательный signal (R3)
│   │   ├── contentCache.ts             # новый: кэш и prefetchContent (R2)
│   │   ├── useContent.ts               # читает кэш, без мигания загрузки
│   │   └── index.ts                    # + экспорт prefetchContent
│   └── config/
│       ├── preloaderTexts.ts           # новый: тексты loading / error / retry для en и ru (R10)
│       └── index.ts                    # + экспорт preloaderTexts
├── widgets/
│   ├── Preloader/                      # новый виджет
│   │   ├── Preloader.tsx               # разметка, aria, кнопка «Повторить»
│   │   ├── Preloader.module.scss       # по макету, user-select: none
│   │   ├── usePreloaderStatus.ts       # ресурсы + контент, повторы, дедлайн 60 с
│   │   ├── useProgressLine.ts          # GSAP: линия и число, завершение, растворение
│   │   └── index.ts
│   └── index.ts                        # + экспорт Preloader
└── pages/
    └── Home/
        ├── Home.tsx                    # решение по ширине, обёртка контента, onDone + якорь
        └── Home.module.scss            # класс скрытого контента
```

**Structure Decision**: Виджет кладётся в `src/widgets/Preloader/` с большой буквы, как остальные виджеты проекта (`Background`, `Header`, `ApplicationModal`). Ты написал `widgets/preloader` — по смыслу это то же самое, регистр выровнен под проект. Логика ожидания и анимации лежит рядом с виджетом по принципу IV. Сетевой кэш лежит в `shared/api`, потому что им пользуются и виджет, и секции.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Принцип IV: анимация прелоадера не уничтожается при смене responsive-состояния | По спеке (Edge Cases) решение показывать прелоадер фиксируется по ширине в момент открытия и не меняется до конца загрузки | `gsap.matchMedia()` по ширине убил бы линию при ресайзе или повороте планшета посреди 40-секундного ожидания, и посетитель увидел бы недорисованный прелоадер |

## Open Dependencies

- Нужны тексты прелоадера (`loading`, `error`, `retry`) на en и ru.
- Шрифт числа «0%» по макету — уточнить начертание Halvar Breitschrift при вёрстке, чтобы подгружать именно его через preload.
