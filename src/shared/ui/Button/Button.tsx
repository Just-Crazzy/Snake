import cls from './Button.module.scss';

import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'>;

const Button = ({ children, className, type = 'button', ...props }: ButtonProps) => (
  <button {...props} type={type} className={[cls.button, className].filter(Boolean).join(' ')}>
    {children}
  </button>
);

export { Button };
