import type { ComponentProps } from 'react';
import cls from './Link.module.scss';

type LinkProps = ComponentProps<'a'>;

export const Link = ({ children, className, ...props }: LinkProps) => (
   <a {...props} className={[cls.link, className].filter(Boolean).join(' ')}>
      {children}
   </a>
);
