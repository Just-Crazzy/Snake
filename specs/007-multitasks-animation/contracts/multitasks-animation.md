# Contract: анимация экрана Multi-tasks

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

## `useMultitasksAnimation(scopeRef, isReady)`

Файл: `src/shared/lib/useMultitasksAnimation.ts`, экспорт из `src/shared/lib/index.ts`.

```ts
useMultitasksAnimation(scopeRef: RefObject<HTMLElement | null>, isReady: boolean): void
```

| Параметр | Описание |
|----------|----------|
| `scopeRef` | Ref на `<section id="team">` в `MultiTasks.tsx`. Селекторы ищутся только внутри, триггеры ScrollTrigger строятся по этому элементу |
| `isReady` | `true`, когда контент экрана загружен (`Boolean(data)` из `useContent('tasks')`) |

Поведение:

- Вызывается в `MultiTasks` до ранних `return` (правило хуков React).
- Работает в `useLayoutEffect` с зависимостями `[lang, isReady]`; `lang` берётся из `useParams`.
- При `isReady === false` или пустом `scopeRef.current` ничего не создаёт.
- Создаёт один `gsap.matchMedia()` с условиями `intro`, `exit`, `still` (research R13), cleanup — `mm.revert()`.
- Не меняет `useFullpageScroll` и не подписывается на `screen:request` (research R2).
- Исходный `hash` читает один раз при монтировании; `team` или экран ниже по `SCREENS` — появление пропускается (research R8).

## Data-атрибуты

Хук ищет элементы только по этим атрибутам. Атрибуты — часть контракта: переименование ломает анимацию.

| Атрибут | Элемент | Файл |
|---------|---------|------|
| `data-mt="title"` | `h2` с текстом MULTI-TASKS | `src/pages/MultiTasks/MultiTasks.tsx` |
| `data-mt-group="snake"` | `div.intro` — блок со змеёй и текстом | `src/pages/MultiTasks/MultiTasks.tsx` |
| `data-mt="card"` | каждый `article.card` | `src/pages/MultiTasks/MultiTasks.tsx` |

Колонки карточек в разметке не помечаются: хук вычисляет их по `offsetLeft` (research R3).

## Изменения в компонентах

- **`MultiTasks`**: `const sectionRef = useRef<HTMLElement>(null)`; `useMultitasksAnimation(sectionRef, Boolean(data))` до `if (loading) return null`; `ref={sectionRef}` на `<section>`; атрибуты из таблицы. Классы, тексты и разметка не меняются.
- **`shared/lib/index.ts`**: `export { useMultitasksAnimation } from './useMultitasksAnimation';`.
- **`MultiTasks.module.scss`**, **`Home.tsx`**, **`useFullpageScroll.ts`**: без изменений.
