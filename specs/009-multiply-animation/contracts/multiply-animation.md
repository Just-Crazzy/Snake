# Contract: анимация экрана Multiply with us

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

## `useMultiplyAnimation(scopeRef, isReady)`

Файл: `src/shared/lib/useMultiplyAnimation.ts`, экспорт из `src/shared/lib/index.ts`.

```ts
useMultiplyAnimation(scopeRef: RefObject<HTMLElement | null>, isReady: boolean): void
```

| Параметр | Описание |
|----------|----------|
| `scopeRef` | Ref на `<section id="join">`. Селекторы ищутся только внутри, триггеры строятся по этому элементу |
| `isReady` | `true`, когда контент экрана загружен (`Boolean(data)` из `useContent('multiply')`) |

Поведение:

- Вызывается во внешнем `MultiplyWithUs` до ранних `return`.
- `useLayoutEffect` с зависимостями `[lang, isReady, scopeRef]`; `lang` из `useParams`.
- При `isReady === false` или пустом `scopeRef.current` ничего не создаёт.
- Один `gsap.matchMedia()` с условиями `intro` и `still` (research R11), cleanup — `mm.revert()`.
- Исходный `hash` читается один раз при монтировании; `#join` — появление пропускается (research R3).
- Анимирует только `autoAlpha`; змею, фон, `useFullpageScroll` и `widgets/Background` не трогает.

## Data-атрибуты

Атрибуты — часть контракта: переименование ломает анимацию.

| Атрибут | Элемент | Файл |
|---------|---------|------|
| `data-mw="title"` | `h2.label` и `p.bottomLabel` (надпись Multiply with us) | `src/pages/MultiplyWithUs/MultiplyWithUs.tsx` |
| `data-mw="tab"` | каждый `button.tab` | `src/pages/MultiplyWithUs/MultiplyWithUs.tsx` |
| `data-mw="card"` | `div.panel` | `src/pages/MultiplyWithUs/MultiplyWithUs.tsx` |
| `data-mw="footer"` | `div.footer` (обёртка `<Footer />`) | `src/pages/MultiplyWithUs/MultiplyWithUs.tsx` |

## Изменения в компонентах и стилях

- **`MultiplyWithUs.tsx`**:
  - во внешнем `MultiplyWithUs`: `const sectionRef = useRef<HTMLElement>(null)`; `useMultiplyAnimation(sectionRef, Boolean(data))` до `if (loading) return null`; `<MultiplyWithUsContent ref={sectionRef} items={data} />`;
  - в `MultiplyWithUsContentProps`: `ref: Ref<HTMLElement>`; `ref={ref}` на `<section>`;
  - атрибуты из таблицы.

  Классы, тексты, логика вкладок и разметка не меняются.
- **`MultiplyWithUs.module.scss`**: у `.page` базовый `background` → `transparent`. Градиент в `@include max-media(1024)`, `&::before` со змеёй и остальные правила не меняются.
- **`shared/lib/index.ts`**: `export { useMultiplyAnimation } from './useMultiplyAnimation';` между `useMarquee` и `useSwitchingWord`.
- **`Home.tsx`**, **`useFullpageScroll.ts`**, **`widgets/Background/*`**, **`Footer`**: без изменений.
