import type { ComponentProps } from 'react';
import styles from './Link.module.scss';

type LinkProps = ComponentProps<'a'>;

export const Link = ({ children, className, ...props }: LinkProps) => (
   <a {...props} className={[styles.link, className].filter(Boolean).join(' ')}>
      {children}
   </a>
);
