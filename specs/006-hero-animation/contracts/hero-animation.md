# Contract: анимация первого экрана и шапки

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

## `useHeroAnimation(scopeRef, isReady)`

Файл: `src/shared/lib/useHeroAnimation.ts`.

```ts
useHeroAnimation(scopeRef: RefObject<HTMLElement | null>, isReady: boolean): boolean
```

| Параметр | Описание |
|----------|----------|
| `scopeRef` | Контейнер контента в `Home.tsx`, внутри которого лежат шапка и секция `#hero`. Селекторы ищутся только в нём |
| `isReady` | `true`, когда прелоадер исчез или его нет (`!isLoading` в Home) |
| возвращает | `isIntroDone`: `true`, когда появление закончилось или пропущено. Назад в `false` не возвращается |

Поведение:

- Работает в `useLayoutEffect` с зависимостями `[lang, isReady]`; `lang` берётся из `useParams`.
- При `isReady === false` ничего не создаёт.
- Создаёт один `gsap.matchMedia()` с условиями `intro`, `exit`, `still` (research R14), cleanup — `mm.revert()`.
- Не меняет `useFullpageScroll` и `useSwitchingWord` и не подписывается на их события.

## Data-атрибуты

Хук ищет элементы только по этим атрибутам (research R7). Атрибуты — часть контракта: переименование ломает анимацию.

| Атрибут | Элемент | Файл |
|---------|---------|------|
| `data-hero="content"` | `div.content` с заголовком, подзаголовком и кнопкой | `src/pages/Hero/Hero.tsx` |
| `data-hero="title"` | `h1` | `src/pages/Hero/Hero.tsx` |
| `data-hero="text"` | `p` с подзаголовком | `src/pages/Hero/Hero.tsx` |
| `data-hero="button"` | кнопка «Get in touch» | `src/pages/Hero/Hero.tsx` |
| `data-hero="snake"` | `img` змеи | `src/pages/Hero/Hero.tsx` |
| `data-hero="socials"` | `ul` соцсетей | `src/pages/Hero/Hero.tsx` → `Socials` |
| `data-header="left"` | левый слот шапки (логотип) | `src/widgets/Header/Header.tsx` |
| `data-header="right"` | правый слот шапки (ссылки и язык) | `src/widgets/Header/Header.tsx` |

## Изменения в компонентах

- **`Home`**: `ref` на контейнер контента; `const isIntroDone = useHeroAnimation(contentRef, !isLoading)`; `<Hero isReady={isIntroDone} />`.
- **`Home.module.scss`**: `.header` получает `overflow-x: clip` (research R11).
- **`Hero`**: проп `isReady` без изменений (по умолчанию `true`); добавляются data-атрибуты из таблицы.
- **`Header`**: на `div` слотов добавляются `data-header="left"` и `data-header="right"`; пропсы не меняются.
- **`Socials`**: принимает остальные атрибуты `<ul>` (`ComponentProps<'ul'>`) и пробрасывает их; поведение и разметка без изменений.
