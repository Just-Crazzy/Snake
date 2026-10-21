import { useState } from 'react';

import { useParams } from 'react-router-dom';

import { LANGUAGES } from '@/shared/config';
import { Link } from '@/shared/UI';

import cls from './HeaderNav.module.scss';

const anchors = [
  { id: 'team', label: 'Team' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'joinUs', label: 'Join Us' },
];

export const HeaderNav = () => {
  const { lang } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const navItems = (
    <>
      {anchors.map(({ id, label }) => (
        <li key={id}>
          <Link href={`#${id}`} onClick={closeMenu}>
            {label}
          </Link>
        </li>
      ))}
      {LANGUAGES.map((code) => (
        <li key={code}>
          <Link href={`/${code}`} className={code === lang && cls.active}>
            {code.toUpperCase()}
          </Link>
        </li>
      ))}
    </>
  );

  return (
    <>
      <ul className={cls.links}>{navItems}</ul>

      <button
        className={cls.burger}
        type='button'
        aria-expanded={isOpen}
        aria-label='Menu'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Menu
      </button>

      {!!isOpen && <ul className={cls.mobileMenu}>{navItems}</ul>}
    </>
  );
};
