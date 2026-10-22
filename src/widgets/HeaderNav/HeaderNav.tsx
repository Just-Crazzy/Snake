import { useState } from 'react';

import { useParams } from 'react-router-dom';

import { LANGUAGES } from '@/shared/config';
import { Link } from '@/shared/ui';

import cls from './HeaderNav.module.scss';

import type { Lang } from '@/shared/config';

const anchors = [
  { id: 'team', label: 'Team' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'joinUs', label: 'Join Us' },
];

const langLabels: Record<Lang, string> = {
  ru: 'РУС',
  en: 'ENG',
};

const HeaderNav = () => {
  const { lang } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const navItems = (
    <>
      <ul className={cls.anchors}>
        {anchors.map(({ id, label }) => (
          <li key={id}>
            <Link href={`#${id}`} onClick={closeMenu}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <ul className={cls.langs}>
        {LANGUAGES.map((code, i) => (
          <li key={code}>
            {i > 0 && <span>/</span>}

            <Link href={`/${code}`} className={(code === lang && cls.active) || undefined}>
              {langLabels[code]}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <>
      <div className={cls.links}>{navItems}</div>

      <button
        className={cls.burger}
        type="button"
        aria-expanded={isOpen}
        aria-label="Menu"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Menu
      </button>

      {!!isOpen && <div className={cls.mobileMenu}>{navItems}</div>}
    </>
  );
};

export { HeaderNav };
