# Research: Анимация экрана Multi-benefits

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## R1. Где лежит хук и кто его вызывает

- **Decision**: `src/shared/lib/useMultibenefitsAnimation.ts`, экспорт через `src/shared/lib/index.ts`. Вызывает `src/pages/MultiBenefits/MultiBenefits.tsx` до ранних `return`, ref на `<section id="benefits">`, `isReady = Boolean(data)` из `useContent('benefits')`.
- **Rationale**: Конституция 2.0.0, принцип IV; тот же подход, что в 007 (R1, R12 там): только `MultiBenefits` знает, когда контент загружен. `Home.tsx` не меняется.
- **Alternatives considered**: Вызов из `Home` — `Home` не знает о загрузке контента.

## R2. Общий код с 007

- **Decision**: Общую функцию сейчас не выносить. Хук 008 пишется по образцу `useMultitasksAnimation` (007).
- **Rationale**: `useMultitasksAnimation` лежит в ветке `feature/multitasks-animation`, которая ещё не слита в `dev`; в этой ветке его нет, и вынести «общее» не из чего. Совпадут условия `matchMedia`, проверка якоря и запуск по `onEnter`; различаются цели, тайминги, уход (в 008 его нет) и наблюдатели (R6). После слияния 006, 007 и 008 общее (условия `matchMedia`, `isOpenedOnScreen`, запуск по входу) выносится отдельным рефакторингом, если это действительно сократит код.
- **Alternatives considered**: Слить 007 в эту ветку ради общей функции — нарушает договорённость «одна анимация в ветке, мерж только после проверки».

## R3. Вход на экран и якорь

- **Decision**: Как в 007 (R2, R8 там): `ScrollTrigger.create({ trigger: section, start: 'top 75%', once: true, onEnter: () => intro.play() })`, после создания `if (enter.progress > 0) intro.play()`. Исходный `hash` читается один раз при монтировании; `benefits` или экран ниже по `SCREENS` — `playedRef` сразу `true`, появления нет.
- **Rationale**: `screen:request` создаёт только кнопка «Scroll to top»; ScrollTrigger читает прокрутку и не конфликтует с `useFullpageScroll`, работает и на 577–1024px.
- **Alternatives considered**: см. 007 R2.

## R4. Цели и атрибуты

- **Decision**: `data-mb="label"` на `h2` (MULTI-BENEFITS), `data-mb="title"` на `h3`, `data-mb="text"` на `p.description`, `data-mb="card"` на каждый `article.card`, `data-mb="snake"` на `div.container__content`.
- **Rationale**: Классы CSS Modules хешируются, искать по ним нельзя. Змея — псевдоэлемент `::before` у `div.container__content`, поэтому хуку нужен селектор этого `div`; атрибут `data-mb="snake"` добавлен к четырём из вводных. Разметка и классы не меняются. Карточки идут в разметке в том же порядке, что на экране (`flex-direction: column`), поэтому «сверху вниз» = порядок в DOM.
- **Alternatives considered**: Ref-пропсы — лишние изменения в компоненте.

## R5. Змея через CSS-переменные

- **Decision**: В `MultiBenefits.module.scss` у `.container__content` объявить `--snake-x: 0px; --snake-opacity: 1;`, в `&::before` — `transform: translateX(var(--snake-x)); opacity: var(--snake-opacity);`. GSAP анимирует переменные на `[data-mb="snake"]`: `fromTo({ '--snake-x': '80px', '--snake-opacity': 0 }, { '--snake-x': '0px', '--snake-opacity': 1 })`.
- **Rationale**: GSAP не может обратиться к псевдоэлементу, но умеет анимировать CSS-переменные на элементе; псевдоэлемент наследует их. Значения по умолчанию равны конечному состоянию, поэтому без JS, при `still` и после `mm.revert()` (inline-стиль снят) змея стоит на месте. Псевдоэлемент — декоративный (`pointer-events: none`, без текста), фокуса и дерева доступности он не касается, `visibility` ему не нужен. На ≤1024px у псевдоэлемента `display: none`, анимация переменных там ничего не показывает и безвредна.
- **Alternatives considered**: Настоящий `<img>` вместо псевдоэлемента — меняет разметку, запрещено вводными. `CSSRulePlugin` — устаревший плагин, работает с правилами стилей, а не с элементом, и ломается с CSS Modules.

## R6. Переход во время появления в обе стороны

- **Decision**: В ветке `intro` два наблюдателя. Вниз: `{ trigger: section, start: 'top top', end: 'bottom top', onUpdate }` — если `progress > 0` и появление активно, `intro.progress(1)`; та же проверка сразу после создания. Вверх: `{ trigger: section, start: 'top bottom', end: 'top top', onUpdate }` — если `direction < 0` и появление активно, `intro.progress(1)`.
- **Rationale**: FR-008 говорит о переходе на соседний экран в любую сторону, а не только вниз, как в 007. При переходе вниз окно уходит ниже верха секции — первый диапазон. При переходе вверх окно поднимается, и секция начинает уезжать вниз — второй диапазон в обратном направлении. Пока экран только въезжает (появление уже стартовало на `top 75%`), направление прямое, поэтому появление не обрывается.
- **Alternatives considered**: `onLeaveBack` у первого наблюдателя — срабатывает только после того, как диапазон стал активным; в точке покоя `top top` прогресс равен 0, и поведение на самой границе ненадёжно.

## R7. Тайминги появления

- **Decision**: `INTRO_DURATION = 0.5`, `TEXT_DELAY = 0.15`, `INTRO_OVERLAP = 0.2`, `INTRO_STAGGER = 0.1`, `INTRO_OFFSET = 80`, `INTRO_EASE = 'power3.out'`. Позиции: надпись (`autoAlpha`) и заголовок (`x: -80`) — 0; текст (`x: -80`) — 0,15; змея (`--snake-x: 80px`) — `>-0.2`; карточки (`x: 80`, `stagger 0.1`) — `>-0.2`.
- **Rationale**: Заголовок 0–0,5 с; текст 0,15–0,65; змея 0,45–0,95; карточки с 0,75, последняя закончит на 0,75 + 0,2 + 0,5 = 1,45 с ≤ 1,5 (FR-005). Длительность, сдвиг и плавность — как в 006 и 007.
- **Alternatives considered**: Строго последовательно без перекрытий — 0,65 + 0,5 + 0,7 = 1,85 с.

## R8. Фон на Multi-benefits

- **Decision**: В `MultiBenefits.module.scss` у `.page` на desktop фон убрать (`background: transparent`); градиент `linear-gradient(160deg, #7b21bb 0%, #3f0063 100%)` на ≤1024px остаётся как есть. Общий слой `widgets/Background` (`position: fixed`, `z-index: -1`) становится виден за секцией, как сейчас за Hero. `GridMesh` не дублируется и в секцию не переносится.
- **Rationale**: Слой фона фиксирован за всей страницей; сейчас его закрывает непрозрачный градиент секции. У общего слоя свой градиент (`BackgroundBase`: `111deg, #DC8400 -5%, #560080 50%, #220032 95%`) — те же цвета, что у секции (`122deg, #dc8400 0%, #560080 56%, #220032 100%`), поэтому вид остаётся как на макете, а сверху появляются сетка и подсветка (`BackgroundGlow`, `GridMesh`), как у Hero. Так же устроен Hero на desktop: своего фона у него нет. На ≤1024px у Hero свой сплошной фон, у Multi-benefits он тоже остаётся (Assumptions в spec).
- **Alternatives considered**: Поднять слой фона через `z-index` над градиентом секции — фон окажется поверх содержимого всех экранов или потребует перестроить стековые контексты страницы. Полупрозрачный градиент секции — смешение двух градиентов, вид разъедется с макетом. Второй экземпляр `GridMesh` внутри секции — дублирование и вторая бесконечная анимация.

## R9. Фон и «уменьшить движение»

- **Decision**: Логику анимации `GridMesh` вынести в хук `src/shared/lib/useGridMeshAnimation.ts` (`(maskRef: RefObject<HTMLElement | null>) => void`): `useEffect` с `gsap.matchMedia()` и условием `'(min-width: 577px) and (prefers-reduced-motion: no-preference)'`; внутри — существующий бесконечный timeline по `--x`/`--y` без изменений; cleanup — `mm.revert()`. `GridMesh.tsx` вызывает хук и остаётся только разметкой. Статичный кадр — начальные `--x: 85%`, `--y: 10%` из inline-стиля, которые `mm.revert()` возвращает.
- **Rationale**: FR-014, FR-015: при «уменьшить движение» и до 576px фон не двигается (constitution IV). `matchMedia` переключает анимацию на лету при смене настройки или ширины. Вынос в `shared/lib` — конституция 2.0.0, принцип IV: логика анимаций лежит в `shared/lib`, а не в виджете; раз `GridMesh` всё равно меняется, приводим его к правилу.
- **Alternatives considered**: Оставить код в `GridMesh.tsx` и добавить `matchMedia` там (вводные к плану) — работает так же, но оставляет логику в виджете вопреки конституции. CSS `@media (prefers-reduced-motion)` — анимация идёт через GSAP, CSS её не остановит.

## R10. Горизонтальная прокрутка

- **Decision**: Стили не меняются: у `.page` уже `overflow: hidden` на всех ширинах.
- **Rationale**: Сдвиги `x: ±80` и `--snake-x: 80px` происходят внутри `.page` и обрезаются им; прозрачный фон (R8) на обрезку не влияет. Проверка — `scrollWidth === clientWidth` (сравнение с `innerWidth` неверно из-за полосы прокрутки, см. 007).
- **Alternatives considered**: `overflow-x: clip` — повтор существующего правила.

## R11. Условия matchMedia и скрытое состояние

- **Decision**: Две ветки: `intro: '(min-width: 577px) and (prefers-reduced-motion: no-preference)'`, `still: '(max-width: 576px), (prefers-reduced-motion: reduce)'`. `intro` и не `playedRef` — создать появление; иначе `playedRef = true`. Эффект — `useLayoutEffect` `[lang, isReady, scopeRef]`, timeline на паузе с `immediateRender` по умолчанию; `autoAlpha: 0` даёт `visibility: hidden`, скрытые блоки не получают фокус.
- **Rationale**: Как в 007 (R6, R7, R13 там). Ветки `exit` нет: ухода в этой фиче нет (FR-006).
- **Alternatives considered**: —

## R12. Смена языка

- **Decision**: Отдельной логики нет.
- **Rationale**: Переключатель языка — ссылка `/en` → `/ru`, страница перезагружается (проверено в 007); это новая загрузка. Если язык когда-нибудь станет меняться без перезагрузки, эффект пересоздастся по `lang`, а `playedRef` сохранится (FR-017).
- **Alternatives considered**: —

## R13. Lighthouse

- **Decision**: Отдельных мер нет, замер на этапе Polish.
- **Rationale**: Экран ниже первого сгиба; анимируются `opacity`, `transform` и CSS-переменные, сдвигов вёрстки нет. Фон уже анимируется на странице, новых бесконечных анимаций нет. Контрастность текста на общем фоне — та же, что у Hero (SC-007).
- **Alternatives considered**: —

## R14. Устаревшие границы ScrollTrigger (найдено при реализации)

- **Decision**: Пока появление ждёт входа, `ResizeObserver` следит за `document.body` и при изменении высоты страницы вызывает `ScrollTrigger.refresh()`. Отключается в cleanup callback `matchMedia` (`createIntro` возвращает функцию очистки).
- **Rationale**: Хук создаёт триггеры, когда загрузился контент Multi-benefits. Контент Multi-tasks выше может загрузиться позже и сдвинуть экран вниз примерно на высоту окна; ScrollTrigger сам пересчитывает границы только при resize и load окна. Без пересчёта появление стартовало ещё на Multi-tasks, а наблюдатель «вниз» сразу доводил его до конца (проверено в браузере на 1440 × 900). В 007 этого нет: над Multi-tasks только статичный Hero.
- **Alternatives considered**: Один `ScrollTrigger.refresh()` после создания — не помогает, если контент выше загрузится позже. Ждать загрузки всех секций в `Home` — связывает экраны между собой.
