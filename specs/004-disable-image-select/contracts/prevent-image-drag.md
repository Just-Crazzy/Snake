# Contract: preventImageDrag

**Location**: `src/shared/lib/preventImageDrag.ts`, экспорт через `src/shared/lib/index.ts`.

## `preventImageDrag(event: DragEvent): void`

| | |
|---|---|
| Вход | событие `dragstart` |
| Отменяет (`preventDefault`) | если `event.target` — `Element` и `target.closest('img, svg')` найден, или ближайшая ссылка `target.closest('a')` содержит `img`/`svg` |
| Не трогает | текстовые узлы (выделенный текст), обычные ссылки без изображений, любые другие элементы |

## Подключение

`src/app/App.tsx`, один раз на уровне модуля: `document.addEventListener('dragstart', preventImageDrag)` (research R3).
