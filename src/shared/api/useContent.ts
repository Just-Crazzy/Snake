import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getContent } from './getContent';

import type { ContentMap, Section } from './getContent';
import type { Lang } from '@/shared/config';

type State<S extends Section> = {
  data: ContentMap[S] | null;
  error: Error | null;
  loading: boolean;
};

const useContent = <S extends Section>(section: S) => {
  const { lang } = useParams<{ lang: Lang }>();
  const [state, setState] = useState<State<S>>({ data: null, error: null, loading: true });

  useEffect(() => {
    if (!lang) return;
    let cancelled = false;

    getContent(lang, section)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, error, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [lang, section]);

  return state;
};
export { useContent };
