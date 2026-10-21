import type { Lang } from '@/shared/config';

export type Section = 'benefits' | 'multiply' | 'tasks';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const getContent = async (lang: Lang, section: Section) => {
  const response = await fetch(`${API_URL}/${lang}/${section}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  return response.json();
};
