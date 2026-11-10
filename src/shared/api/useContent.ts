import { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams } from 'react-router-dom';

import { getCachedContent, loadContent, subscribeContent } from './contentCache';

import type { Section } from './getContent';
import type { Lang } from '@/shared/config';

type Failure = {
  key: string;
  error: Error;
};

const useContent = <S extends Section>(section: S) => {
  const { lang } = useParams<{ lang: Lang }>();
  const key = `${lang}/${section}`;
  const data = useSyncExternalStore(subscribeContent, () => (lang ? getCachedContent(lang, section) : null));
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    if (!lang) return;
    let cancelled = false;

    loadContent(lang, section).catch((error: Error) => {
      if (!cancelled) setFailure({ key, error });
    });

    return () => {
      cancelled = true;
    };
  }, [key, lang, section]);

  const error = !data && failure?.key === key ? failure.error : null;

  return { data, error, loading: !data && !error };
};

export { useContent };
