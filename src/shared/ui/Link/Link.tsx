import cls from './Link.module.scss';

import type { ComponentProps } from 'react';

type LinkProps = ComponentProps<'a'>;

const withBase = (href?: string) => (href?.startsWith('/') ? `${import.meta.env.BASE_URL}${href.slice(1)}` : href);

const Link = ({ children, className, href, ...props }: LinkProps) => (
  <a {...props} href={withBase(href)} className={[cls.link, className].filter(Boolean).join(' ')}>
    {children}
  </a>
);

export { Link };
