const LANGUAGES = ['en', 'ru'] as const;
type Lang = (typeof LANGUAGES)[number];

export { LANGUAGES };
export type { Lang };
