# Data Model: Анимация первого экрана и шапки

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Данных и хранилища нет. Ниже — состояния и объекты анимации, которыми оперирует хук `useHeroAnimation`.

## AnimationTargets

Элементы, которые хук находит по data-атрибутам внутри контейнера Home (research R7).

| Цель | Атрибут | Где ставится | Появление | Уход |
|------|---------|--------------|-----------|------|
| Блок текста | `data-hero="content"` | `Hero.tsx` | — | `xPercent: -110` |
| Заголовок | `data-hero="title"` | `Hero.tsx` | `x`, `autoAlpha`, шаг 2 | вместе с блоком |
| Подзаголовок | `data-hero="text"` | `Hero.tsx` | `x`, `autoAlpha`, шаг 2 | вместе с блоком |
| Кнопка | `data-hero="button"` | `Hero.tsx` → `Button` | `x`, `autoAlpha`, шаг 2 | вместе с блоком |
| Соцсети | `data-hero="socials"` | `Hero.tsx` → `Socials` | `x`, `autoAlpha`, шаг 2, последние | `xPercent: -300` |
| Змея | `data-hero="snake"` | `Hero.tsx` | `autoAlpha`, шаг 1 | `xPercent: 60` |
| Логотип | `data-header="left"` | `Header.tsx` | `autoAlpha`, шаг 1 | `yPercent: -200` |
| Ссылки и язык | `data-header="right"` | `Header.tsx` | `autoAlpha`, шаг 1 | `xPercent: 40`, `yPercent: -200` |

Правило: появление меняет только `autoAlpha` и `x`, уход — только `xPercent` и `yPercent` (research R3).

## IntroTimeline

- **Создаётся**: при `isReady === true`, условии `intro` и `introPlayedRef.current === false`.
- **Шаги**: 1 — змея и слоты шапки, `autoAlpha 0 → 1`, 0,6 с; 2 — заголовок, подзаголовок, кнопка, соцсети, `x: -80 → 0`, `autoAlpha 0 → 1`, 0,6 с, `stagger 0,15` (research R13).
- **Длительность**: 1,65 с.
- **onComplete**: `introPlayedRef.current = true`, `setIsIntroDone(true)`.
- **Досрочное завершение**: `progress(1)`, когда уход начался или страница открыта не на Hero (research R10).

## ExitTimeline

- **Создаётся**: при условии `exit` (ширина ≥ 1025px и движение не уменьшено), независимо от появления.
- **scrollTrigger**: `trigger: '#hero'`, `start: 'top top'`, `end: 'bottom top'`, `scrub: true`.
- **Твины**: все с `ease: 'none'`, позиция 0, `xPercent`/`yPercent` из таблицы выше. Плавность берётся от перехода поэкранной прокрутки.
- **onUpdate**: если `progress > 0` и появление активно — `intro.progress(1)`.

## Состояние хука

| Поле | Тип | Начальное | Меняется |
|------|-----|-----------|----------|
| `isIntroDone` | `boolean` (state) | `false` | `true` после появления или если оно пропущено; назад не возвращается |
| `introPlayedRef` | `boolean` (ref) | `false` | `true` вместе с `isIntroDone`; переживает смену `lang` и пересоздание контекста |

## Переходы состояний

```text
isReady=false ──(прелоадер ушёл)──▶ isReady=true
   │
   ├─ условие intro, появление не было ──▶ IntroTimeline играет ──onComplete──▶ isIntroDone=true
   │                                         │
   │                                         └─ уход начался / открыто не на Hero ──progress(1)──▶ isIntroDone=true
   │
   └─ ширина ≤ 576 / reduce / появление уже было ──▶ isIntroDone=true сразу

isIntroDone=true ──▶ Hero isReady=true ──▶ useSwitchingWord стартует
```

Смена `lang` или условий `matchMedia`: `mm.revert()` → inline-стили сняты, элементы в конечном положении → callback заново; появление не создаётся, потому что `introPlayedRef.current === true`.
