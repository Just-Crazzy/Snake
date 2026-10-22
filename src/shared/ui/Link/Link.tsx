import cls from './Link.module.scss';

import type { ComponentProps } from 'react';

type LinkProps = ComponentProps<'a'>;

const Link = ({ children, className, ...props }: LinkProps) => (
  <a {...props} className={[cls.link, className].filter(Boolean).join(' ')}>
    {children}
  </a>
);

export { Link };
