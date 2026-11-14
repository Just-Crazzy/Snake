# Contract: переключающееся слово в Hero

**Location**: `src/shared/lib/useSwitchingWord.ts` (хук), `src/pages/Hero/Hero.tsx` (разметка)

## Hero props

| Prop | Тип | Обязательный | По умолчанию | Назначение |
|------|-----|--------------|--------------|------------|
| `isReady` | `boolean` | нет | `true` | Пока `false`, слова не сменяются и показано первое; после слияния с прелоадером `Home` передаёт `isDone` (R7) |

## `useSwitchingWord(words, isReady)`

| | |
|---|---|
| Вход | `words: string[]` — слова текущего языка из `heroWords[lang]`; `isReady: boolean` |
| Выход | `ref` для контейнера слов (`HTMLSpanElement`) |
| Ожидает от разметки | прямые потомки контейнера — по одному элементу на слово, в порядке `words` |
| Побочные эффекты | GSAP timeline внутри `gsap.matchMedia()`; `revert()` при размонтировании и при смене `words` или `isReady` |

## Разметка заголовка (наблюдаемое снаружи)

- В `h1` есть скрытый текст `.sr-only`: «Practice makes» и слова через запятую.
- Видимая строка заголовка имеет `aria-hidden="true"`; `aria-live` не используется.
- Внешний вид — по [mockup/hero.png](../mockup/hero.png): «PRACTICE» на первой строке, «MAKES» и жёлтое слово на второй.
