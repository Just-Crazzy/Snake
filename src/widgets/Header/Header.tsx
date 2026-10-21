import type { ReactNode } from "react";

import cls from "./Header.module.scss";

type HeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
};

export const Header = ({ left, right }: HeaderProps) => (
  <header>
    <nav className={cls.nav}>
      {left && <div className={cls.left}>{left}</div>}
      {right && <div className={cls.right}>{right}</div>}
    </nav>
  </header>
);
