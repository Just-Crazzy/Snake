# Contract: API анимаций главной страницы

## 1. Публичные хуки `@/shared/lib` — без изменений

Сигнатуры и вызовы в компонентах остаются прежними (FR-007). Состав `src/shared/lib/index.ts` не меняется.

| Хук | Сигнатура | Вызывается из |
|---|---|---|
| `useHeroAnimation` | `(scopeRef: RefObject<HTMLElement \| null>, isReady: boolean) => boolean` | `pages/Home/Home.tsx` |
| `useMultitasksAnimation` | `(scopeRef: RefObject<HTMLElement \| null>, isReady: boolean) => void` | `pages/MultiTasks` |
| `useMultibenefitsAnimation` | `(scopeRef: RefObject<HTMLElement \| null>, isReady: boolean) => void` | `pages/MultiBenefits` |
| `useMultiplyAnimation` | `(scopeRef: RefObject<HTMLElement \| null>, isReady: boolean) => void` | `pages/MultiplyWithUs` |
| `useGridMeshAnimation` | `(maskRef: RefObject<HTMLElement \| null>) => void` | `widgets/Background/GridMesh.tsx` |
| `useMarquee` | `(lang: Lang, text: string) => { trackRef, groupRef }` | `shared/ui/Marquee` |
| `useSwitchingWord` | `(words: string[], isReady: boolean) => RefObject<HTMLSpanElement>` | `pages/Hero` |
| `useFullpageScroll` | `({ screens, isEnabled? }) => void` | `pages/Home/Home.tsx` |

**Поведение на ширинах после рефакторинга**:

| Хук | ≤576 | 577–1024 | ≥1025 | reduce |
|---|---|---|---|---|
| Hero, Multi-tasks, Multi-benefits, Multiply | всё на месте | всё на месте | появление (и уход у Hero и Multi-tasks) | всё на месте |
| `useGridMeshAnimation` | стоит | стоит | движется | стоит |
| `useMarquee` | движется | движется | движется | стоит |
| `useSwitchingWord` | переключается | переключается | переключается | переключается без анимации |
| `useFullpageScroll` | выкл | выкл | вкл | вкл, переход мгновенный |
| Прелоадер (`Home.tsx`) | нет | есть | есть | есть |

## 2. `@/shared/config` — новые экспорты

```ts
export { MEDIA, INTRO } from './animation';
```

Форма и значения описаны в [data-model.md](../data-model.md). Объекты объявлены `as const`.

## 3. Внутренний модуль `src/shared/lib/intro.ts` (не экспортируется из index)

| Экспорт | Сигнатура | Гарантии |
|---|---|---|
| `INTRO_CONDITIONS` | `{ animated: string; still: string }` | ровно одно условие истинно |
| `fadeFrom` | `() => gsap.TweenVars` | новый объект на каждый вызов |
| `fadeTo` | `(vars?: gsap.TweenVars) => gsap.TweenVars` | новый объект; `autoAlpha: 1`, `duration: INTRO.duration`, без `ease`; `vars` перекрывают |
| `slideFrom` | `(offset: number) => gsap.TweenVars` | новый объект; `x: offset`, `autoAlpha: 0` |
| `slideTo` | `(vars?: gsap.TweenVars) => gsap.TweenVars` | новый объект; `x: 0`, `autoAlpha: 1`, `duration`, `ease` из `INTRO`; `vars` перекрывают |
| `playOnEnter` | `(trigger: gsap.DOMTarget, intro: gsap.core.Timeline) => void` | запускает `intro` при въезде (`INTRO.enterStart`) или сразу, если точка уже пройдена; триггер удаляет себя после срабатывания |
| `finishOnLeave` | `(trigger: gsap.DOMTarget, intro: gsap.core.Timeline, onDone: () => void) => void` | уход вниз или вверх во время появления даёт `progress(1)`; по `onComplete` убивает свои триггеры и вызывает `onDone`; если вниз уже ушли, завершает сразу |
| `observeLayout` | `() => () => void` | на все подписки один `ResizeObserver` на `body` → `ScrollTrigger.refresh()`; отписка последнего отключает его |

Побочный эффект модуля: `gsap.registerPlugin(ScrollTrigger)`. Больше нигде в проекте `ScrollTrigger` не регистрируется.

**Обязательства вызывающего**:
- `finishOnLeave` занимает `onComplete` таймлайна. Таймлайн MUST NOT задавать свой `onComplete`.
- Все вызовы делаются внутри колбэка `gsap.matchMedia().add(...)`: тогда созданные триггеры откатываются вместе с контекстом.

## 4. Внутренний хук `src/shared/lib/useSectionAnimation.ts` (не экспортируется из index)

```ts
type ScreenId = (typeof SCREENS)[number];

type SectionAnimation = {
  screenId: ScreenId;
  createIntro: (scope: HTMLElement) => gsap.core.Timeline;
  createExit?: (scope: HTMLElement) => void;
};

useSectionAnimation(scopeRef: RefObject<HTMLElement | null>, isReady: boolean, animation: SectionAnimation): void
```

**Гарантии**:
- ничего не делает, пока `isReady === false` или `scopeRef.current === null`;
- если страница открыта по якорю этого экрана или ниже, появления нет;
- появление показывается не больше одного раза за жизнь компонента;
- в `still` элементы стоят на местах, экран отмечается показанным;
- в `animated` — уход (если задан) и появление, подписка на `observeLayout`;
- `mm.revert()` при размонтировании и смене `lang` или `isReady`.

**Обязательства вызывающего**:
- `animation` — константа уровня модуля, иначе эффект перезапускается на каждом рендере;
- `createIntro` возвращает таймлайн на паузе (`paused: true`) без `onComplete`;
- селекторы в `createIntro` и `createExit` ищутся внутри `scope` (через контекст `matchMedia`).

## 5. Фон `widgets/Background`

- `GridMesh`: снаружи вид не меняется. Элемент с `maskRef` становится «окном»: статичная маска в центре и сдвиг на (`--x` − 50%, `--y` − 50%). SVG внутри сдвигается обратно (research R10). Элемент с `maskRef` по-прежнему хранит `--x` и `--y`. Начальные значения те же, `85%` и `10%`, но теперь заданы в классе `.grid-window`.
- `BackgroundGlow`: `filter: blur` заменяется на `radial-gradient` (research R11). Положение центров, цвет и `opacity` не меняются.
