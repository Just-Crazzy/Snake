# Data Model: Анимация экрана Multi-tasks

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Данных и хранилища нет. Ниже — цели, группы и состояния, с которыми работает хук `useMultitasksAnimation`.

## AnimationTargets

Элементы ищутся внутри секции (`scopeRef`) по data-атрибутам (research R3).

| Цель | Атрибут | Появление | Уход |
|------|---------|-----------|------|
| Заголовок MULTI-TASKS | `data-mt="title"` на `h2` | `autoAlpha 0 → 1`, вместе с блоком со змеёй | `yPercent: -300` |
| Блок со змеёй и текстом | `data-mt-group="snake"` на `div.intro` | `x: -80 → 0`, `autoAlpha 0 → 1` | `yPercent: -100` |
| Карточка | `data-mt="card"` на `article.card` | `x: 80 → 0`, `autoAlpha 0 → 1`, в группе своей колонки | `yPercent: -100` |

Правило: появление меняет только `autoAlpha` и `x`, уход — только `yPercent` (research R4).

## CardColumns

Группы карточек, вычисляемые при каждом вызове callback `matchMedia` (research R3).

- **Ключ колонки**: `offsetLeft` карточки (без учёта `transform`).
- **Порядок колонок**: по возрастанию `offsetLeft`, слева направо.
- **Порядок внутри колонки**: по возрастанию `offsetTop`, сверху вниз.
- **Результат на desktop**: две колонки — средняя и правая; сколько в них карточек, решает вёрстка.
- **Результат на 577–1024px**: одна колонка со всеми карточками.

## IntroTimeline

- **Создаётся**: при `isReady`, условии `intro` и `playedRef.current === false`; на паузе.
- **Шаги**: 1 — блок со змеёй (`x`, `autoAlpha`) и заголовок (`autoAlpha`), 0,5 с; затем каждая колонка из `CardColumns` по очереди, `stagger 0,1`, старт за 0,2 с до конца предыдущего шага (research R5).
- **Длительность**: 1,4 с на desktop, 1,2 с на 577–1024px.
- **Запуск**: `EnterTrigger.onEnter` или сразу, если секция уже прошла точку старта.
- **onComplete**: `playedRef.current = true`.
- **Досрочное завершение**: `progress(1)` от `ExitWatcher` (research R9).

## EnterTrigger

- **trigger**: секция; **start**: `top 75%`; **once**: `true`.
- **onEnter**: `intro.play()`.

## ExitWatcher

- **trigger**: секция; **start**: `top top`; **end**: `bottom top`.
- **onUpdate**: если `progress > 0` и `intro.isActive()` — `intro.progress(1)`; та же проверка сразу после создания.

## ExitTimeline

- **Создаётся**: при условии `exit`, независимо от появления.
- **scrollTrigger**: секция, `start: 'top top'`, `end: 'bottom top'`, `scrub: true`.
- **Твины**: все с `ease: 'none'`, позиция 0, значения из таблицы целей.

## Состояние хука

| Поле | Тип | Начальное | Меняется |
|------|-----|-----------|----------|
| `playedRef` | `boolean` (ref) | `false` | `true` после появления, при `progress(1)`, в ветке `still` и при открытии по якорю; назад не возвращается |
| `initialHash` | `string` (state, без сеттера) | `window.location.hash` при монтировании | не меняется |

## Переходы состояний

```text
isReady=false ──(контент загружен)──▶ isReady=true
   │
   ├─ initialHash = team или ниже ──▶ playedRef=true, блоки видны
   │
   ├─ условие intro, playedRef=false ──▶ IntroTimeline на паузе (блоки скрыты)
   │      │
   │      ├─ EnterTrigger.onEnter ──▶ play ──onComplete──▶ playedRef=true
   │      └─ ExitWatcher progress>0 ──▶ progress(1) ──▶ playedRef=true
   │
   └─ still / playedRef=true ──▶ ничего не создаётся, блоки видны

условие exit ──▶ ExitTimeline (scrub) — при любом playedRef
```

Смена `lang`, `isReady` или условий `matchMedia`: `mm.revert()` → inline-стили сняты, блоки в конечном положении → callback заново; появление не создаётся, если `playedRef.current === true`.
