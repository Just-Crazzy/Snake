# Data Model: Бегущая строка «Dream big earn bigger!»

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Постоянного хранения нет.

## MarqueeText (shared/config)

| Поле | Тип | Правило |
|------|-----|---------|
| `marqueeText` | `Record<Lang, string>` | Для каждого языка из `LANGUAGES`; сейчас en и ru — `'Dream big earn bigger!'` (Clarifications Q2) |
| регистр | как в строке | Заглавные задаёт CSS |

После слияния `feature/internalization` переносится в locales.

## Marquee (pages/MultiBenefits)

| Поле | Значение | Правило |
|------|----------|---------|
| `REPEATS` | 4 | Повторов «фраза + змея» в одной группе; группа шире экрана 3840px (FR-003) |
| групп | 2, одинаковые | Сдвиг на одну группу = `xPercent: -50` дорожки (FR-002) |
| `SPEED` | 100 px/с | `duration = ширина группы / SPEED`; повтор проходит 1440px не быстрее 8 с (FR-006) |
| направление | справа налево | `xPercent` от 0 к −50 (FR-001, Clarifications Q1) |
| положение | `xPercent` 0 … −50 | Сохраняется при пересчёте длительности (FR-012) |

### Состояния

```text
reduce ──▶ полоса неподвижна (анимация не создаётся)
motion ──▶ бег по кругу ──(ширина группы изменилась)──▶ новая длительность, то же положение
любое ──(смена языка или размонтирование)──▶ revert, затем заново с xPercent 0
```
