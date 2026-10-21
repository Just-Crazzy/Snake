import cls from './Header.module.scss';

import type { ReactNode } from 'react';

type HeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
};

const Header = ({ left, right }: HeaderProps) => (
  <header>
    <nav className={cls.nav}>
      {!!left && <div className={cls.left}>{left}</div>}
      {!!right && <div className={cls.right}>{right}</div>}
    </nav>
  </header>
);

export { Header };
