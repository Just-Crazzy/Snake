export const LANGUAGES = ['ru','en'] as const;
export type Lang = (typeof LANGUAGES)[number]