import { useParams } from 'react-router-dom';

import { Link } from '@/shared/UI';

import Logotip from '@public/icons/mask.svg?react';

import cls from './Logo.module.scss';

export const Logo = () => {
  const { lang } = useParams();

  return (
    <Link href={`/${lang}`} className={cls.logo} aria-label="Home">
      <Logotip className={cls.icon} />
    </Link>
  );
};
