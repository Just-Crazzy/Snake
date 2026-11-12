# Data Model: Анимация экрана Multi-benefits

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Данных и хранилища нет. Ниже — цели, timeline и состояния хуков `useMultibenefitsAnimation` и `useGridMeshAnimation`.

## AnimationTargets

Элементы ищутся внутри секции (`scopeRef`) по data-атрибутам (research R4).

| Цель | Атрибут | Появление | Позиция в timeline |
|------|---------|-----------|--------------------|
| Надпись MULTI-BENEFITS | `data-mb="label"` на `h2` | `autoAlpha 0 → 1` | 0 |
| Заголовок | `data-mb="title"` на `h3` | `x: -80 → 0`, `autoAlpha 0 → 1` | 0 |
| Текст | `data-mb="text"` на `p.description` | `x: -80 → 0`, `autoAlpha 0 → 1` | 0,15 |
| Змея (`::before`) | `data-mb="snake"` на `div.container__content` | `--snake-x: 80px → 0px`, `--snake-opacity: 0 → 1` | `>-0.2` (0,45) |
| Карточки | `data-mb="card"` на каждом `article.card` | `x: 80 → 0`, `autoAlpha 0 → 1`, `stagger 0,1` | `>-0.2` (0,75) |

## SnakeVariables

CSS-переменные на `div.container__content`, псевдоэлемент читает их (research R5).

| Переменная | По умолчанию в SCSS | Начало появления | Где используется |
|------------|--------------------|------------------|------------------|
| `--snake-x` | `0px` | `80px` | `transform: translateX(var(--snake-x))` в `&::before` |
| `--snake-opacity` | `1` | `0` | `opacity: var(--snake-opacity)` в `&::before` |

Правило: значения по умолчанию равны конечному состоянию; GSAP пишет только inline-стиль, `mm.revert()` его снимает.

## IntroTimeline

- **Создаётся**: при `isReady`, условии `intro` и `playedRef.current === false`; на паузе.
- **Длительность**: 1,45 с (research R7).
- **Запуск**: `EnterTrigger.onEnter` или сразу, если секция уже прошла точку старта.
- **onComplete**: `playedRef.current = true`.
- **Досрочное завершение**: `progress(1)` от `DownWatcher` или `UpWatcher` (research R6).

## EnterTrigger

- **trigger**: секция; **start**: `top 75%`; **once**: `true`; **onEnter**: `intro.play()`.

## DownWatcher

- **trigger**: секция; **start**: `top top`; **end**: `bottom top`.
- **onUpdate**: `progress > 0` и `intro.isActive()` → `intro.progress(1)`; та же проверка сразу после создания.

## UpWatcher

- **trigger**: секция; **start**: `top bottom`; **end**: `top top`.
- **onUpdate**: `direction < 0` и `intro.isActive()` → `intro.progress(1)`.

## GridMeshTimeline

- **Создаётся**: в `useGridMeshAnimation` при условии `(min-width: 577px) and (prefers-reduced-motion: no-preference)`.
- **Содержимое**: существующий бесконечный timeline `GridMesh` по `--x`/`--y` маски, без изменений.
- **Статичный кадр**: `--x: 85%`, `--y: 10%` из inline-стиля `GridMesh`.
- **Очистка**: `mm.revert()` при размонтировании; при смене условия `matchMedia` — автоматически.

## Состояние хука появления

| Поле | Тип | Начальное | Меняется |
|------|-----|-----------|----------|
| `playedRef` | `boolean` (ref) | результат проверки исходного `hash` (`benefits` или ниже → `true`) | `true` после появления, при `progress(1)`, в ветке `still`; назад не возвращается |

## Переходы состояний

```text
isReady=false ──(контент загружен)──▶ isReady=true
   │
   ├─ playedRef=true (якорь / уже было) ──▶ ничего не создаётся, блоки видны
   │
   ├─ условие intro ──▶ IntroTimeline на паузе (блоки скрыты, змея прозрачна)
   │      ├─ EnterTrigger.onEnter ──▶ play ──onComplete──▶ playedRef=true
   │      └─ Down/UpWatcher ──▶ progress(1) ──▶ playedRef=true
   │
   └─ still ──▶ playedRef=true, блоки видны
```

Смена `lang`, `isReady` или условий `matchMedia`: `mm.revert()` → inline-стили и переменные сняты, всё в конечном положении → callback заново; появление не создаётся, если `playedRef.current === true`.
