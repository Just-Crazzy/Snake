# Research: Переключающееся слово в заголовке Hero

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-10

## R1. Где хранить слова

- **Decision**: `src/shared/config/heroWords.ts` — `heroWords: Record<Lang, string[]>`, для en и ru одинаковые `['skills', 'profit', 'growth']`. Регистр задаёт CSS (`text-transform: uppercase` у `.title`), как сейчас у слова «profit».
- **Rationale**: `feature/internalization` ещё не слита в `dev` (проверено по `dev` и `origin/dev`). `Record<Lang, …>` гарантирует, что слова есть для каждого языка (принцип II), и повторяет уже принятый образец `preloaderTexts`. После слияния i18n массив переносится в `hero.words` в locales.
- **Alternatives considered**: массив в `Hero.tsx` — нарушает принцип II; ждать слияния i18n — блокирует фичу.

## R2. Вёрстка без сдвигов: grid-стопка

- **Decision**: контейнер слов — `display: inline-grid` с `overflow: hidden`; каждое слово — `grid-area: 1 / 1`. Ширину ячейки задаёт самое длинное слово, высоту — `line-height` заголовка. Контейнеру нужен `vertical-align: top`.
- **Rationale**: ширина резервируется средствами CSS, без замеров в JS (FR-007). `vertical-align: top` нужен потому, что у inline-блока с `overflow: hidden` базовая линия переносится на нижний край, и без него слово встанет выше «MAKES».
- **Alternatives considered**: `position: absolute` для слов и ширина через JS — лишний код и пересчёт при загрузке шрифта; фиксированная ширина в `rem` — ломается при смене шрифта и на разных брейкпоинтах.

## R3. Обрезка букв (FR-006)

- **Decision**: высота строки равна `line-height: 1` заголовка. Если при реализации края заглавных букв Halvar Breitschrift обрезаются, контейнеру добавляется вертикальный `padding` в `em` и такой же отрицательный `margin`, чтобы строка не сместилась.
- **Rationale**: у заглавных латинских букв нет выносных элементов, поэтому при `line-height: 1` они обычно помещаются; проверяется глазами на 1440px и 375px (quickstart, сценарий 3).
- **Alternatives considered**: `clip-path` вместо `overflow` — то же поведение, но сложнее читать.

## R4. Timeline и бесшовный цикл

- **Decision**: один `gsap.timeline({ repeat: -1 })`. Начальные положения ставятся через `gsap.set`: первое слово `yPercent: 0`, остальные `yPercent: -100`. Для каждого слова `i` в момент `i × (HOLD + SWITCH) + HOLD` одновременно: уходящее `fromTo(yPercent 0 → 100)`, следующее `(i + 1) % n` — `fromTo(yPercent -100 → 0)`. У `fromTo` выставляется `immediateRender: false`. `HOLD = 2.5`, `SWITCH = 0.6`, ease `power2.inOut`.
- **Rationale**: явные `fromTo` делают каждое движение независимым от предыдущего состояния, поэтому повтор цикла не прыгает. Без `immediateRender: false` последний `fromTo` (возврат SKILLS сверху) при создании сразу поставил бы SKILLS в `-100`, и первое слово было бы невидимо.
- **Alternatives considered**: рекурсивный `onComplete` со сменой индекса в state — React-ререндеры ради анимации и сложнее отмена; CSS `@keyframes` — сложно синхронизировать произвольное число слов и мгновенный режим.

## R5. Отмена, смена языка и «уменьшить движение»

- **Decision**: `gsap.matchMedia()` с условиями `{ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }` и scope — контейнер слов. Нужны оба условия: GSAP вызывает функцию, только когда совпало хотя бы одно, и с одним `reduce` при обычных настройках анимация не запустилась бы. Внутри одна функция строит timeline; при `reduce` длительность смены `0`. `mm.revert()` в cleanup `useEffect`, зависимости — `words` и `isReady`. Отдельный `gsap.context()` не нужен: `gsap.matchMedia()` сам является context и откатывает всё созданное внутри.
- **Rationale**: при смене языка меняется ссылка на массив из `heroWords[lang]`, эффект откатывает старую анимацию и строит новую с первого слова (FR-011, принцип IV). `matchMedia` сам перестраивает анимацию, если настройка движения меняется на лету (FR-010).
- **Alternatives considered**: `gsap.context()` + ручная проверка `window.matchMedia` — не реагирует на смену настройки без перезагрузки.

## R6. Вкладка в фоне

- **Decision**: своей логики нет; работает стандартный `lagSmoothing` GSAP.
- **Rationale**: пока вкладка в фоне, `requestAnimationFrame` не вызывается, а `lagSmoothing` не даёт timeline прыгнуть на всё пропущенное время при возврате: анимация продолжается с текущего места без пачки смен (Edge Cases).
- **Alternatives considered**: пауза по `visibilitychange` — дублирует встроенное поведение.

## R7. Старт после прелоадера (FR-012)

- **Decision**: проп `isReady?: boolean` у `Hero`, по умолчанию `true`. Пока он `false`, хук не создаёт timeline, и показано первое слово. В этой ветке `Home` проп не передаёт; после слияния с `feature/preloader` `Home` передаёт `isReady={isDone}`.
- **Rationale**: Hero не знает о прелоадере, решение принимает страница; без прелоадера поведение не меняется.
- **Alternatives considered**: событие или контекст «прелоадер завершён» — лишний механизм ради одного флага.

## R8. Доступность (FR-009)

- **Decision**: внутри `h1` — `<span className="sr-only">` с полной фразой «Practice makes skills, profit, growth» (строится из `heroWords[lang]`) и видимая строка с `aria-hidden="true"`. `aria-live` не используется. Класс `.sr-only` уже есть глобально в `src/app/styles/_global.scss`.
- **Rationale**: чтец читает заголовок один раз цельной фразой и не реагирует на смены; видимая строка не дублируется.
- **Alternatives considered**: `aria-live="polite"` — объявлял бы каждую смену; `aria-label` на `h1` — у заголовков поддерживается хуже, чем скрытый текст.

## R9. Mobile

- **Decision**: анимация работает на всех ширинах, `gsap.matchMedia` по ширине не используется.
- **Rationale**: принцип IV прямо разрешает на mobile бегущую и переключающуюся строки. На 375px строка «MAKES GROWTH» при `font-size: 40px` может не поместиться: тогда grid-блок слова целиком переносится на следующую строку, и из-за резерва ширины по самому длинному слову перенос одинаков для всех слов, без прыжков (quickstart, сценарий 4).
- **Alternatives considered**: уменьшать шрифт на mobile — меняет вёрстку вне рамок спеки.
