import { getContent } from './getContent';

import type { ContentMap, Section } from './getContent';
import type { Lang } from '@/shared/config';

const SECTIONS: Section[] = ['benefits', 'tasks', 'multiply'];

const requests = new Map<string, Promise<unknown>>();
const results = new Map<string, unknown>();
const listeners = new Set<() => void>();

const getKey = (lang: Lang, section: Section) => `${lang}/${section}`;

const subscribeContent = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const getCachedContent = <S extends Section>(lang: Lang, section: S) =>
  (results.get(getKey(lang, section)) as ContentMap[S] | undefined) ?? null;

const loadContent = <S extends Section>(lang: Lang, section: S, signal?: AbortSignal) => {
  const key = getKey(lang, section);
  const cached = requests.get(key) as Promise<ContentMap[S]> | undefined;

  if (cached) return cached;

  const forget = () => {
    if (requests.get(key) === request) requests.delete(key);
  };

  const request = getContent(lang, section, signal)
    .then((data) => {
      results.set(key, data);
      listeners.forEach((listener) => listener());
      return data;
    })
    .catch((error: unknown) => {
      forget();
      throw error;
    })
    .finally(() => signal?.removeEventListener('abort', forget));

  signal?.addEventListener('abort', forget);
  requests.set(key, request);
  return request;
};

const prefetchContent = (lang: Lang, signal?: AbortSignal) =>
  Promise.all(SECTIONS.map((section) => loadContent(lang, section, signal))).then(() => undefined);

export { getCachedContent, loadContent, prefetchContent, subscribeContent };
