# Research: Анимация экрана Multiply with us

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## R1. Где лежит хук и кто его вызывает

- **Decision**: `src/shared/lib/useMultiplyAnimation.ts`, экспорт через `src/shared/lib/index.ts`. Вызывает внешний компонент `MultiplyWithUs` в `src/pages/MultiplyWithUs/MultiplyWithUs.tsx` до ранних `return`: `useMultiplyAnimation(sectionRef, Boolean(data))`. Ref передаётся во внутренний `MultiplyWithUsContent` обычным пропсом `ref` (React 19 принимает `ref` как пропс функционального компонента) и вешается на `<section id="join">`.
- **Rationale**: Конституция 2.0.0, принцип IV. Как в 007 и 008, хук вызывает тот компонент, который знает о загрузке контента (`useContent('multiply')`). Секция же рендерится во внутреннем `MultiplyWithUsContent`, поэтому ref нужно передать вниз. В React 19 для этого не нужен `forwardRef`.
- **Alternatives considered**: Вызов в `MultiplyWithUsContent` с `isReady = true`: работает, но параметр `isReady` становится всегда истинным, и сигнатура расходится по смыслу с 007 и 008. `forwardRef`: в React 19 устарел, лишняя обёртка.

## R2. Общий код с 007 и 008

- **Decision**: Общую функцию сейчас не выносить. Хук пишется по образцу `useMultibenefitsAnimation` (008).
- **Rationale**: 007 и 008 лежат в своих ветках и в `dev` не слиты, в этой ветке их хуков нет. Совпадут условия `matchMedia`, `isOpenedOnScreen`, вход по `onEnter`, два наблюдателя и `ResizeObserver`. После слияния 006–009 общее выносится отдельным рефакторингом (так же записано в 008, R2).
- **Alternatives considered**: Слить 008 в эту ветку — пользователь решил работать в отдельной ветке и мержить потом.

## R3. Вход на экран и якорь

- **Decision**: `ScrollTrigger.create({ trigger: section, start: 'top 75%', once: true, onEnter: () => intro.play() })`, после создания `if (enter.progress > 0) intro.play()`. Исходный `hash` читается один раз при монтировании (`useState(isOpenedOnScreen)`). `SCREEN_ID = 'join'` — последний в `SCREENS`, поэтому «этот экран или ниже» значит только `#join`.
- **Rationale**: Как в 007 и 008. Хеш `#joinUs` (форма заявки) не совпадает ни с одним экраном, `findIndex` даёт `-1`, и появление идёт по обычным правилам. Так и записано в Edge Cases спеки.
- **Alternatives considered**: см. 007 R2.

## R4. Цели и атрибуты

- **Decision**:
  - `data-mw="title"` на `h2.label` (desktop) и на `p.bottomLabel` (577–1024px);
  - `data-mw="tab"` на каждый `button.tab`;
  - `data-mw="card"` на `div.panel`;
  - `data-mw="footer"` на `div.footer`.
- **Rationale**: Классы CSS Modules хешируются, искать по ним нельзя. Заголовок в вёрстке существует дважды: сверху справа на desktop и внизу на ≤1024px, в каждый момент виден только один. Один и тот же атрибут на обоих даёт «заголовок первым шагом» на любой ширине (Assumptions спеки), без нового значения атрибута. Кнопки в разметке идут в том же порядке, что на экране (`flex-direction: column`), поэтому «сверху вниз» совпадает с порядком в DOM. Змея — псевдоэлемент `.page::before`, её не трогаем.
- **Alternatives considered**: Отдельный `data-mw="bottom-title"` — лишнее значение при том же поведении.

## R5. Только прозрачность и тайминги

- **Decision**: Каждый шаг — `fromTo({ autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 })` без `x`/`y`/`scale`, ease по умолчанию GSAP (`power1.out`). Константы: `INTRO_DURATION = 0.5`, `INTRO_STAGGER = 0.1`, `INTRO_OVERLAP = 0.2`. Позиции:
  - заголовок — 0;
  - кнопки — `>-0.2` (0,3), `stagger 0.1`;
  - карточка — `>-0.2` (0,8);
  - футер — `<` (вместе с карточкой, 0,8).
- **Rationale**: Заголовок 0–0,5 с. Кнопки начинаются с 0,3, последняя заканчивается на 0,3 + 0,2 + 0,5 = 1,0. Карточка и футер — 0,8–1,3. Итого 1,3 с ≤ 1,5 (FR-006). Перекрытие 0,2 даёт ощущение «по очереди» без пауз. Длительность, stagger и перекрытие — как в 008. Ease по умолчанию — как у надписи MULTI-BENEFITS в 008, тоже проявлявшейся без сдвига. `power3.out` из сдвиговых шагов для чистой прозрачности слишком резкий в начале.
- **Alternatives considered**: Строго последовательно: 0,5 + 0,7 + 0,5 = 1,7 с > 1,5. Длительность 0,6: карточка закончит на 1,6 с.

## R6. Переход во время появления

- **Decision**: В ветке `intro` два наблюдателя, как в 008 R6:
  - вниз: `{ start: 'top top', end: 'bottom top' }`, `progress > 0` → `intro.progress(1)`, та же проверка сразу после создания;
  - вверх: `{ start: 'top bottom', end: 'top top' }`, `direction < 0` → `intro.progress(1)`.
- **Rationale**: Экран последний. На desktop с поэкранной прокруткой уйти с него можно только вверх, это ловит второй наблюдатель. Первый срабатывает на 577–1024px, где поэкранной прокрутки нет: секция выше окна, и посетитель листает её вниз обычной прокруткой. Пока экран въезжает (появление стартовало на `top 75%`), направление прямое, и появление не обрывается.
- **Alternatives considered**: Только наблюдатель «вверх»: на 577–1024 появление может догонять уже прокрученный вниз экран.

## R7. Устаревшие границы ScrollTrigger

- **Decision**: Пока появление ждёт входа, `ResizeObserver` следит за `document.body` и при изменении размера вызывает `ScrollTrigger.refresh()`. Отключается в cleanup callback `matchMedia` (`createIntro` возвращает функцию очистки).
- **Rationale**: Найдено в 008 (R14): контент экранов выше загружается отдельно и сдвигает секцию вниз, а ScrollTrigger сам пересчитывает границы только при resize и load окна. Над Multiply with us три экрана, два из них с загружаемым контентом (`team`, `benefits`), поэтому риск здесь выше, чем в 008.
- **Alternatives considered**: см. 008 R14.

## R8. Фон секции

- **Decision**: В `MultiplyWithUs.module.scss` у `.page` базовый `background` → `transparent`. Блок `@include max-media(1024)` с `linear-gradient(160deg, #7b21bb 0%, #3f0063 100%)` и `&::before { display: none }` не меняется. `widgets/Background` и `GridMesh` не трогаем.
- **Rationale**: Общий слой `widgets/Background` (`position: fixed`, `z-index: -1`: `BackgroundBase`, `BackgroundGlow`, `GridMesh`) уже анимируется и лежит за всей страницей. Его закрывает непрозрачный градиент секции. Так же устроен Hero на desktop: своего фона нет, на ≤1024 — тот же сплошной `160deg`-градиент.

  **Сравнение с макетом**:

  | Слой | Градиент |
  |------|----------|
  | Секция сейчас | `122deg, #dc8400 0%, #560080 56%, #220032 100%` |
  | Общий слой | `111deg, #DC8400 -5%, #560080 50%, #220032 95%` |
  | Макет `mockup/multiply.png` | оранжевый слева сверху, через фиолетовый к тёмно-фиолетовому справа |

  Цвета и направление совпадают, угол отличается на 11°, переходы смещены на 5%. Это та же разница, что принята для Hero и в 008 (R8). Визуально сверить с макетом на 1440 × 900 — сценарий 7 в [quickstart.md](./quickstart.md). Отдельную подгонку не делаем: менять общий слой запрещено, а свой градиент поверх него снова закроет сетку.
- **Alternatives considered**: Полупрозрачный градиент секции — два градиента смешаются, вид уйдёт от макета. Поднять слой фона через `z-index` — он окажется поверх содержимого всех экранов. Второй `GridMesh` в секции — дублирование и вторая бесконечная анимация.

## R9. Фон и «уменьшить движение»

- **Decision**: В этой фиче ничего не делать.
- **Rationale**: Остановку `GridMesh` при reduce и до 576px делает 008 (`useGridMeshAnimation`) для всей страницы. Пользователь запретил трогать `GridMesh` и `widgets/Background`. В этой ветке до слияния с 008 фон при reduce продолжает двигаться на всех экранах — это не регрессия фичи. FR-017 и SC-005 в части фона выполняются после слияния (Assumptions спеки).
- **Alternatives considered**: Повторить логику 008 здесь — дубль и гарантированный конфликт при мерже `GridMesh.tsx`.

## R10. Фокус и клики у прозрачных блоков

- **Decision**: Отдельной логики нет, достаточно `autoAlpha`.
- **Rationale**: `autoAlpha: 0` ставит `opacity: 0` и `visibility: hidden`. `visibility` наследуется: кнопки в `div.panel` (JOIN THE TEAM — ссылка `#joinUs`) и ссылки футера скрыты вместе с контейнером. Элементы с `visibility: hidden` не получают фокус с клавиатуры, не реагируют на клик (клик проходит к элементу под ними) и выпадают из дерева доступности. Проверено поиском: ни `shared/ui`, ни `Footer`, ни стили `MultiplyWithUs` не задают `visibility` потомкам, поэтому наследование ничто не перебивает. На `.tab` атрибут стоит на самих кнопках. После появления GSAP ставит `visibility: inherit`, всё снова доступно. FR-020, SC-006.
- **Alternatives considered**: `inert` или `tabIndex={-1}` на время появления — лишнее состояние в компоненте при том же результате.

## R11. Условия matchMedia и скрытое состояние

- **Decision**: Две ветки:
  - `intro: '(min-width: 577px) and (prefers-reduced-motion: no-preference)'`;
  - `still: '(max-width: 576px), (prefers-reduced-motion: reduce)'`.

  `intro` и не `playedRef` → создать появление, иначе `playedRef = true`. Эффект — `useLayoutEffect` с `[lang, isReady, scopeRef]`. Timeline на паузе, `fromTo` с `immediateRender` по умолчанию прячет блоки до первой отрисовки.
- **Rationale**: Как в 007 и 008. Ветки `exit` нет: ухода нет (FR-007).
- **Alternatives considered**: —

## R12. Переключение вкладок

- **Decision**: Отдельной логики нет.
- **Rationale**: Клик по вкладке меняет `activeIndex` в `MultiplyWithUsContent`. Перерисовывается только он, зависимости эффекта (`lang`, `isReady`, `scopeRef`) не меняются, timeline не пересоздаётся. React меняет `className` кнопок и текст панели, но не трогает атрибут `style`, где лежат inline-стили GSAP. Кнопки с `key={tab.title}` и `div.panel` не перемонтируются. FR-011.
- **Alternatives considered**: —

## R13. Смена языка

- **Decision**: Отдельной логики нет.
- **Rationale**: Переключатель языка перезагружает страницу (проверено в 007), это новая загрузка. Если язык станет меняться без перезагрузки, эффект пересоздастся по `lang`, а `playedRef` сохранится (FR-019).
- **Alternatives considered**: —

## R14. Горизонтальная прокрутка

- **Decision**: Ничего не делать.
- **Rationale**: Сдвигов нет, меняется только прозрачность; у `.page` и так `overflow: hidden` (FR-021).
- **Alternatives considered**: —

## R15. Lighthouse

- **Decision**: Отдельных мер нет, замер на этапе Polish.
- **Rationale**: Экран последний, далеко ниже первого сгиба. Анимируется только `opacity`, новых бесконечных анимаций нет: фон уже анимируется на странице. Контрастность на общем фоне такая же, как у Hero (SC-008).
- **Alternatives considered**: —
