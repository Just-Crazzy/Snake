# Contract: Поэкранная прокрутка

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

## 1. DOM: секции-экраны

Хук находит экраны по `id`. Каждая секция страницы MUST иметь `id` из списка, в этом порядке:

| Экран | Файл | `id` |
|---|---|---|
| Hero | `src/pages/Hero/Hero.tsx` | `hero` (добавить) |
| Multi-tasks | `src/pages/MultiTasks/MultiTasks.tsx` | `team` (есть) |
| Multi-benefits | `src/pages/MultiBenefits/MultiBenefits.tsx` | `benefits` (есть) |
| Multiply with us | `src/pages/MultiplyWithUs/MultiplyWithUs.tsx` | `join` (есть) |

Переименование `id` ломает навигацию шапки и хук одновременно.

## 2. Хук `useFullpageScroll` (`src/shared/lib/useFullpageScroll.ts`)

```ts
type UseFullpageScrollOptions = {
  isEnabled?: boolean;
};

useFullpageScroll(options?: UseFullpageScrollOptions): void;
```

- Вызывается один раз в `Home`.
- `isEnabled` (по умолчанию `true`): `false` блокирует все переходы. Предназначен для прелоадера, как `isReady` у `Hero`.
- Язык берёт сам из `useParams` и пересоздаётся при его смене.
- Ничего не возвращает и не рендерит.

## 3. Событие `screen:request` (`src/shared/lib/screenNavigation.ts`)

```ts
requestScreen(id: string): void;
```

| Шаг | Кто | Что |
|---|---|---|
| 1 | Любой слой (`widgets`, `pages`) | Вызывает `requestScreen('hero')` |
| 2 | `requestScreen` | Отправляет на `window` `CustomEvent('screen:request', { detail: { id }, cancelable: true })` |
| 3 | `useFullpageScroll` (только в поэкранном режиме) | Делает переход к экрану `id` и вызывает `event.preventDefault()` |
| 4 | `requestScreen` | Если событие не отменено — плавно прокручивает к `#id` нативно (mobile) |

Неизвестный `id`: ничего не происходит ни в поэкранном режиме, ни без него.

## 4. Ссылки

| `href` | Поведение в поэкранном режиме |
|---|---|
| `#`, `#hero` | Переход на Hero |
| `#team`, `#benefits`, `#join` | Переход на верх экрана |
| `#joinUs` | Не перехватывается, открывает форму |
| любой другой | Не перехватывается |

## 5. Адресная строка

- После каждого перехода: `history.replaceState(null, '', pathname + search + hash)`, где `hash` — хеш экрана текущей остановки, у Hero пустой.
- Новые записи в историю MUST NOT добавляться.
