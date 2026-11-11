import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { i18n, LANGUAGES } from '@/shared/config';

import { NotFound } from '@/pages';

import type { Lang } from '@/shared/config';

const LangGuard = () => {
  const { lang } = useParams();
  const isValid = LANGUAGES.includes(lang as Lang);

  useEffect(() => {
    if (isValid) {
      i18n.changeLanguage(lang);
    }
  }, [lang, isValid]);

  if (!isValid) {
    return <NotFound />;
  }

  return <Outlet />;
};

export { LangGuard };
