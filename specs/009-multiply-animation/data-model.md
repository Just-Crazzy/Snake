# Data Model: Анимация экрана Multiply with us

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Данных и хранилища нет. Ниже — цели, timeline и состояние хука `useMultiplyAnimation`.

## AnimationTargets

Элементы ищутся внутри секции (`scopeRef`) по data-атрибутам (research R4). Все шаги — только прозрачность, без сдвигов (research R5).

| Цель | Атрибут | Появление | Позиция в timeline |
|------|---------|-----------|--------------------|
| Заголовок MULTIPLY WITH US | `data-mw="title"` на `h2.label` и `p.bottomLabel` | `autoAlpha 0 → 1` | 0 |
| Кнопки слева | `data-mw="tab"` на каждом `button.tab` | `autoAlpha 0 → 1`, `stagger 0,1` | `>-0.2` (0,3) |
| Карточка | `data-mw="card"` на `div.panel` | `autoAlpha 0 → 1` | `>-0.2` (0,8) |
| Футер | `data-mw="footer"` на `div.footer` | `autoAlpha 0 → 1` | `<` (0,8, вместе с карточкой) |
| Змея (`.page::before`) | — | не анимируется | — |

## IntroTimeline

- **Создаётся**: при `isReady`, условии `intro` и `playedRef.current === false`; на паузе.
- **Длительность**: 1,3 с (research R5).
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

## LayoutObserver

- `ResizeObserver` на `document.body` → `ScrollTrigger.refresh()` (research R7).
- Отключается функцией очистки, которую возвращает `createIntro`, при `mm.revert()`.

## Состояние хука

| Поле | Тип | Начальное | Меняется |
|------|-----|-----------|----------|
| `playedRef` | `boolean` (ref) | результат проверки исходного `hash` (`#join` → `true`) | `true` после появления, при `progress(1)`, в ветке `still`; назад не возвращается |

## Переходы состояний

```text
isReady=false ──(контент загружен)──▶ isReady=true
   │
   ├─ playedRef=true (якорь #join / уже было) ──▶ ничего не создаётся, блоки видны
   │
   ├─ условие intro ──▶ IntroTimeline на паузе (блоки скрыты: opacity 0, visibility hidden)
   │      ├─ EnterTrigger.onEnter ──▶ play ──onComplete──▶ playedRef=true
   │      └─ Down/UpWatcher ──▶ progress(1) ──▶ playedRef=true
   │
   └─ still ──▶ playedRef=true, блоки видны
```

Смена `lang`, `isReady` или условий `matchMedia`: `mm.revert()` → inline-стили сняты, наблюдатель размеров отключён, всё видно → callback заново. Появление не создаётся, если `playedRef.current === true`. Клик по вкладке перерисовывает только `MultiplyWithUsContent` и эффект не пересоздаёт (research R12).
