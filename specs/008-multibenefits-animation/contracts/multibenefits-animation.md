# Contract: анимация экрана Multi-benefits и фона

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

## `useMultibenefitsAnimation(scopeRef, isReady)`

Файл: `src/shared/lib/useMultibenefitsAnimation.ts`, экспорт из `src/shared/lib/index.ts`.

```ts
useMultibenefitsAnimation(scopeRef: RefObject<HTMLElement | null>, isReady: boolean): void
```

| Параметр | Описание |
|----------|----------|
| `scopeRef` | Ref на `<section id="benefits">` в `MultiBenefits.tsx`. Селекторы ищутся только внутри, триггеры строятся по этому элементу |
| `isReady` | `true`, когда контент экрана загружен (`Boolean(data)` из `useContent('benefits')`) |

Поведение:

- Вызывается в `MultiBenefits` до ранних `return`.
- `useLayoutEffect` с зависимостями `[lang, isReady, scopeRef]`; `lang` из `useParams`.
- При `isReady === false` или пустом `scopeRef.current` ничего не создаёт.
- Один `gsap.matchMedia()` с условиями `intro` и `still` (research R11), cleanup — `mm.revert()`.
- Исходный `hash` читается один раз при монтировании; `benefits` или экран ниже по `SCREENS` — появление пропускается (research R3).
- Не меняет `useFullpageScroll`, `Marquee`, `useMarquee`.

## `useGridMeshAnimation(maskRef)`

Файл: `src/shared/lib/useGridMeshAnimation.ts`, экспорт из `src/shared/lib/index.ts`.

```ts
useGridMeshAnimation(maskRef: RefObject<HTMLElement | null>): void
```

| Параметр | Описание |
|----------|----------|
| `maskRef` | Ref на элемент маски в `GridMesh.tsx` (тот, у которого inline-стиль с `--x`, `--y` и `maskImage`) |

Поведение:

- `useEffect` без зависимостей, кроме `maskRef`.
- `gsap.matchMedia()` с условием `'(min-width: 577px) and (prefers-reduced-motion: no-preference)'`; внутри — существующий бесконечный timeline по `--x`/`--y` из `GridMesh` без изменений значений и длительностей.
- Cleanup — `mm.revert()`; без совпадения условия маска стоит в статичном кадре из inline-стиля.

## Data-атрибуты

Атрибуты — часть контракта: переименование ломает анимацию.

| Атрибут | Элемент | Файл |
|---------|---------|------|
| `data-mb="label"` | `h2` с надписью Multi-benefits | `src/pages/MultiBenefits/MultiBenefits.tsx` |
| `data-mb="snake"` | `div.container__content` — носитель псевдоэлемента змеи | `src/pages/MultiBenefits/MultiBenefits.tsx` |
| `data-mb="title"` | `h3` с заголовком | `src/pages/MultiBenefits/MultiBenefits.tsx` |
| `data-mb="text"` | `p.description` | `src/pages/MultiBenefits/MultiBenefits.tsx` |
| `data-mb="card"` | каждый `article.card` | `src/pages/MultiBenefits/MultiBenefits.tsx` |

## Изменения в компонентах и стилях

- **`MultiBenefits.tsx`**: `const sectionRef = useRef<HTMLElement>(null)`; `useMultibenefitsAnimation(sectionRef, Boolean(data))` до `if (loading) return null`; `ref={sectionRef}` на `<section>`; атрибуты из таблицы. Классы, тексты, `Marquee` и разметка не меняются.
- **`MultiBenefits.module.scss`**: у `.page` базовый `background` → `transparent` (градиент в `@include max-media(1024)` остаётся); у `.container__content` — `--snake-x: 0px; --snake-opacity: 1;`; в `&::before` — `transform: translateX(var(--snake-x)); opacity: var(--snake-opacity);`.
- **`GridMesh.tsx`**: `useEffect` с timeline удалён, вместо него `useGridMeshAnimation(maskRef)`; разметка, inline-стили и SVG не меняются.
- **`shared/lib/index.ts`**: `export { useGridMeshAnimation } from './useGridMeshAnimation';` и `export { useMultibenefitsAnimation } from './useMultibenefitsAnimation';` в алфавитном порядке.
- **`Home.tsx`**, **`useFullpageScroll.ts`**, **`Marquee`**: без изменений.
