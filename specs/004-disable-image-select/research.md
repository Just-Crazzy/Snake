# Research: Запрет выделения и перетаскивания изображений

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-10

## R1. Запрет выделения

- **Decision**: в `src/app/styles/_global.scss` правило для `img, svg`: `-webkit-user-select: none`, `user-select: none`, `-webkit-user-drag: none`.
- **Rationale**: правило на тегах действует на все изображения сразу, включая будущие (FR-006). Текст рядом не затронут, потому что правило только на `img` и `svg` (FR-004). `-webkit-user-select` нужен для Safari.
- **Alternatives considered**: `user-select: none` на секциях — запретило бы и выделение текста; класс `.noselect` на каждой картинке — нужно помнить о нём для новых изображений.

## R2. Запрет перетаскивания

- **Decision**: кроме `-webkit-user-drag: none` — обработчик `dragstart` на `document`: `preventDefault()`, если `event.target` — элемент, и он сам или его предок — `img`/`svg`, либо ближайшая ссылка `a` содержит `img`/`svg`.
- **Rationale**: `-webkit-user-drag` поддерживают только Chrome и Safari; в Firefox картинку всё равно можно перетащить. Inline SVG сам по себе не перетаскивается, но ссылка с ним — да, и браузер показывает «призрак» ссылки (FR-003). Один слушатель на `document` ловит все `dragstart` через всплытие, включая будущие изображения.
- **Edge**: при перетаскивании выделенного текста `event.target` может быть текстовым узлом — у него нет `closest`, поэтому сначала проверка `instanceof Element`, иначе выход без отмены. Обычные текстовые ссылки без изображений не отменяются.
- **Alternatives considered**: `draggable={false}` на каждой картинке и ссылке — не защищает будущие изображения; `pointer-events: none` на изображениях — ломает клики по иконкам-ссылкам.

## R3. Где подключать обработчик

- **Decision**: в `src/app/App.tsx` на уровне модуля, до `createRoot`: `document.addEventListener('dragstart', preventImageDrag)`.
- **Rationale**: в `App.tsx` нет компонента, только `createRoot(...).render(...)`; слушатель нужен на всё время жизни страницы, поэтому снимать его не нужно. Отдельный компонент или `useEffect` ради одной строки — лишний слой (и `useEffect` в `StrictMode` в dev добавлял бы и снимал слушатель дважды).
- **Alternatives considered**: `useEffect` в `AppRouter` с `removeEventListener` в cleanup — рабочий вариант, но смешивает роутинг с глобальной настройкой страницы.

## R4. Существующие локальные правила

- **Decision**: в этой ветке ничего не удалять.
- **Rationale**: найдены `.noselect`, `.hidden`, `.visible` в `_global.scss` — общие утилиты для любых элементов; `user-select: none` в `NotFound.module.scss` (`.digits`) — на тексте «404», а не на изображении. Глобальное правило для `img`/`svg` их не покрывает. Правило `img, svg { pointer-events: none; -webkit-user-drag: none }` в `Preloader.module.scss` есть только в ветке `feature/preloader`; после слияния обеих веток его часть `-webkit-user-drag: none` станет лишней — отдельная задача после слияния.
- **Alternatives considered**: удалять `.noselect` — он может использоваться для текста, вне рамок.
