import { Outlet, useParams } from 'react-router-dom';

import { NotFound } from '@/pages';
import { LANGUAGES } from '@/shared/config';
import type { Lang } from '@/shared/config';

export const LangGuard = () => {
  const { lang } = useParams();

  if (!LANGUAGES.includes(lang as Lang)) {
    return <NotFound />;
  }

  return <Outlet />;
};
