# Contract: бегущая строка в MultiBenefits

**Location**: `src/shared/ui/Marquee/` (компонент), `src/shared/lib/useMarquee.ts` (хук)

## Marquee props

| Prop | Тип | Обязательный | Назначение |
|------|-----|--------------|------------|
| `className` | `string` | нет | Позиция и ширина в секции; `MultiBenefits` передаёт `cls.line` |

## `useMarquee(lang, text)`

| | |
|---|---|
| Вход | `lang: Lang`, `text: string` из `marqueeText[lang]` |
| Выход | `{ trackRef, groupRef }` — ref дорожки (анимируется) и первой группы (замеряется) |
| Побочные эффекты | `gsap.to` внутри `gsap.matchMedia()`; `ResizeObserver` на группе; `mm.revert()` и `disconnect()` при размонтировании и при смене `lang` или `text` |

## Разметка (наблюдаемое снаружи)

- Корень полосы `aria-hidden="true"`; внутри дорожка из двух одинаковых групп, в каждой `REPEATS` повторов: фраза и змея (`mask.svg?react`).
- Линии — рамка корня, они неподвижны; движется только дорожка.
- Внешний вид — по [mockup/marquee.png](../mockup/marquee.png) и замерам [research R2](../research.md).
