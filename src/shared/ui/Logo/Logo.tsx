import { useParams } from 'react-router-dom';

import { Link } from '@/shared/ui';

import Logotip from '@public/icons/mask.svg?react';

import cls from './Logo.module.scss';

const Logo = () => {
  const { lang } = useParams();

  return (
    <Link href={`/${lang}`} className={cls.logo} aria-label="Home">
      <Logotip className={cls.icon} />
    </Link>
  );
};

export { Logo };
