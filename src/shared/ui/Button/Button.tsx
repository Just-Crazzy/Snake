import cls from './Button.module.scss';

import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'a'>;

const Button = ({ children, className, ...props }: ButtonProps) => (
  <a {...props} className={[cls.button, className].filter(Boolean).join(' ')}>
    {children}
  </a>
);

export { Button };
