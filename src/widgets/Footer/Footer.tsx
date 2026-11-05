import { useTranslation } from 'react-i18next';

import { Link } from '@/shared/ui';

import ArrowIcon from '@public/icons/scroll-to-top.svg?react';

import cls from './Footer.module.scss';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={cls.footer}>
      <div className={cls.footer__wrapper}>
        <div className={cls.footer__menu}>
          <Link href="#">instagram</Link>
          <Link href="#">telegram</Link>
          <Link href="#">linkedin</Link>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={cls.footer__topButton}
        >
          {t('footer.scrollTop')} <ArrowIcon />
        </button>
      </div>
    </footer>
  );
};
