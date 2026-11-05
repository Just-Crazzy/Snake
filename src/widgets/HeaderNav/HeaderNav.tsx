import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Logo, Socials } from '@/shared/ui';

import { AnchorLinks } from './AnchorLinks';
import cls from './HeaderNav.module.scss';
import { LangSwitcher } from './LangSwitcher';

const HeaderNav = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  return (
    <>
      <div className={cls.links}>
        <AnchorLinks />
        <LangSwitcher />
      </div>

      <button
        className={cls.burger}
        type="button"
        aria-expanded={isOpen}
        aria-label={t('nav.menu')}
        onClick={() => setIsOpen(true)}
      >
        {t('nav.menu')}
      </button>

      {!!isOpen && (
        <div className={cls.mobileMenu}>
          <div className={cls.menuTop}>
            <Logo />

            <button className={cls.close} type="button" aria-label={t('nav.closeMenu')} onClick={closeMenu}>
              X
            </button>
          </div>

          <div className={cls.menuBody}>
            <AnchorLinks withMain onNavigate={closeMenu} />
            <Socials />
            <LangSwitcher />
          </div>
        </div>
      )}
    </>
  );
};

export { HeaderNav };
