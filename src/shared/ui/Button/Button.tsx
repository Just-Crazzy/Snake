import cls from './Button.module.scss';

import type { ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'block';

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
};

const Button = ({ children, className, type = 'button', variant = 'primary', ...props }: ButtonProps) => (
  <button {...props} type={type} className={[cls.button, cls[variant], className].filter(Boolean).join(' ')}>
    {children}
  </button>
);

export { Button };
