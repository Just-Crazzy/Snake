import { useState } from 'react';

import { AnchorLinks } from './AnchorLinks';
import cls from './HeaderNav.module.scss';
import { LangSwitcher } from './LangSwitcher';

const HeaderNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

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
        aria-label="Menu"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Menu
      </button>

      {!!isOpen && (
        <div className={cls.mobileMenu}>
          <AnchorLinks onNavigate={closeMenu} />
          <LangSwitcher />
        </div>
      )}
    </>
  );
};

export { HeaderNav };
