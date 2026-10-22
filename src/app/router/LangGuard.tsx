import { Outlet, useParams } from 'react-router-dom';

import { LANGUAGES } from '@/shared/config';

import { NotFound } from '@/pages';

import type { Lang } from '@/shared/config';

const LangGuard = () => {
  const { lang } = useParams();

  if (!LANGUAGES.includes(lang as Lang)) {
    return <NotFound />;
  }

  return <Outlet />;
};

export { LangGuard };
