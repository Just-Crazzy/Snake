# Data Model: Рефакторинг анимаций главной страницы

Данных с сервера и хранилища нет. Ниже описаны сущности конфигурации и состояния анимаций.

## MEDIA — медиазапросы (`src/shared/config/animation.ts`)

| Поле | Значение | Кто использует |
|---|---|---|
| `motion` | `(prefers-reduced-motion: no-preference)` | `useMarquee`, `useSwitchingWord` |
| `reduce` | `(prefers-reduced-motion: reduce)` | `useMarquee`, `useSwitchingWord`, `useFullpageScroll`, `useProgressLine` |
| `notMobile` | `(min-width: 577px)` | `Home.tsx` (показ прелоадера) |
| `desktop` | `(min-width: 1025px)` | `useFullpageScroll` |
| `animated` | `(min-width: 1025px) and (prefers-reduced-motion: no-preference)` | `INTRO_CONDITIONS`, `useGridMeshAnimation` |
| `still` | `(max-width: 1024px), (prefers-reduced-motion: reduce)` | `INTRO_CONDITIONS` |

**Правила**:
- `animated` и `still` взаимно дополняют друг друга: при любой ширине и любой настройке движения ровно одно из них истинно.
- 576 и 1025 записаны один раз как закрытые константы файла, 577 и 1024 выводятся из них.

## INTRO — общие параметры появления

| Поле | Значение | Смысл |
|---|---|---|
| `duration` | `0.5` | длительность шага, с |
| `stagger` | `0.1` | задержка между блоками группы, с |
| `offset` | `80` | сдвиг блока при выезде, px |
| `ease` | `'power3.out'` | плавность выезда |
| `next` | `'>-0.2'` | позиция следующего шага: наложение 0,2 с на предыдущий |
| `enterStart` | `'top 75%'` | точка запуска появления при въезде экрана |

Собственные параметры остаются в своих файлах:
- Hero — `HERO_DURATION` 0.6 и `HERO_STAGGER` 0.15;
- Multi-benefits — `TEXT_DELAY` 0.15;
- Multi-tasks — `EXIT_TITLE` и `EXIT_BLOCK`;
- Hero — `EXIT_*`.

## SectionAnimation — описание секции

| Поле | Тип | Обязательно | Смысл |
|---|---|---|---|
| `screenId` | `ScreenId` (`(typeof SCREENS)[number]`) | да | якорь экрана для проверки «открыта по якорю на этот экран или ниже» |
| `createIntro` | `(scope: HTMLElement) => gsap.core.Timeline` | да | строит таймлайн появления на паузе, без `onComplete` |
| `createExit` | `(scope: HTMLElement) => void` | нет | строит уход со scrub (только Multi-tasks) |

Экземпляры: `MULTITASKS` (`team`, есть `createExit`), `MULTIBENEFITS` (`benefits`) и `MULTIPLY` (`join`). Каждый объявлен константой уровня модуля в файле своего хука.

## Состояние секции (внутри `useSectionAnimation`)

| Поле | Начальное значение | Смысл |
|---|---|---|
| `isAnchored` | `isScreenPassed(screenId)` при первом рендере | страница открыта по якорю этого экрана или ниже |
| `playedRef` | `isAnchored` | появление показано или пропущено, повторять не нужно |

**Переходы**:

```text
not played ──(ширина ≤1024 или reduce: ветка still)────────────▶ played
not played ──(animated: появление закончилось само)────────────▶ played
not played ──(animated: уход вниз/вверх во время появления)────▶ progress(1) ──▶ played
played     ──(любая смена ширины, языка, isReady)──────────────▶ played (появление не повторяется)
```

При смене языка `mm.revert()` откатывает всё. Новый эффект строит анимации заново, но при `played` появление не создаётся. Это поведение 006–009 до рефакторинга.

## Наблюдатели досрочного завершения (`finishOnLeave`)

| Наблюдатель | Диапазон | Условие | Жизненный цикл |
|---|---|---|---|
| `down` | `top top` → `bottom top` | `progress > 0` и появление идёт | создаётся вместе с появлением, убивается в `onComplete` |
| `back` | `top bottom` → `top top` | `direction < 0` и появление идёт | то же |

После `onComplete` у секции не остаётся ни одного наблюдателя появления. Триггер `playOnEnter` удаляет себя сам (`once: true`).

## Наблюдатель вёрстки (`observeLayout`)

| Поле | Смысл |
|---|---|
| `observer` | единственный `ResizeObserver` на `document.body` или `null` |
| `users` | число подписанных секций |

**Переходы**:
- `users` 0 → 1: создать наблюдатель и начать наблюдение.
- `users` 1 → 0: отключить наблюдатель и обнулить ссылку.
- На любое изменение размера `body`: один вызов `ScrollTrigger.refresh()`.

## Замеры (`measurements.md`)

| Поле | До | После |
|---|---|---|
| Lighthouse desktop Performance (медиана из 3) | | |
| Lighthouse mobile Performance (медиана из 3) | | |
| JS gzip, kB | 184,68 (research R13) | |
| fps фона, 4× CPU (медиана из 3) | 50,3 (research R10) | |
| Paint flashing фона | | |
| Скриншоты фона 1440 и 1920 | | |

Для каждого замера записываются условия: коммит, режим сборки, окно, замедление.
