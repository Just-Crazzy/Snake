import type { Lang } from './languages';

type PreloaderTexts = {
  loading: string;
  error: string;
  retry: string;
};

const preloaderTexts: Record<Lang, PreloaderTexts> = {
  en: {
    loading: 'Loading',
    error: 'The server is not responding. Please try again.',
    retry: 'Retry',
  },
  ru: {
    loading: 'Загрузка',
    error: 'Сервер не отвечает. Попробуйте ещё раз.',
    retry: 'Повторить',
  },
};

export { preloaderTexts };
export type { PreloaderTexts };
