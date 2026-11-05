import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Link } from '@/shared/ui';

import Logotip from '@public/icons/mask.svg?react';

import cls from './Logo.module.scss';

const Logo = () => {
  const { t } = useTranslation();
  const { lang } = useParams();

  return (
    <Link href={`/${lang}`} className={cls.logo} aria-label={t('nav.home')}>
      <Logotip className={cls.icon} />
    </Link>
  );
};

export { Logo };
