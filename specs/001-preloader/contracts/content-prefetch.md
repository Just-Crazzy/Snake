# Contract: предзагрузка контента в shared/api

**Location**: `src/shared/api/`, экспорт через `src/shared/api/index.ts`.

## `request(path, { method?, body?, signal? })`

Добавляется необязательный `signal: AbortSignal`, который передаётся в `fetch`. Остальное поведение не меняется.

## `prefetchContent(lang, signal?)`

| | |
|---|---|
| Вход | `lang: Lang`, `signal?: AbortSignal` |
| Выход | `Promise<void>`: выполняется, когда в кэше есть успешные данные для `benefits`, `tasks`, `multiply` этого языка; отклоняется при ошибке или отмене любого запроса |
| Кэш | Уже загруженные секции повторно не запрашиваются; секции с ошибкой удаляются из кэша и при следующем вызове запрашиваются заново |

Повторы через 3 с и дедлайн 60 с — ответственность прелоадера, не `prefetchContent` (R3).

## `useContent(section)`

Публичный интерфейс не меняется: `{ data, error, loading }`.

- Если данные для `lang/section` уже в кэше — первый рендер сразу получает `{ data, error: null, loading: false }`.
- Иначе — запрос через тот же кэш, как сейчас.
