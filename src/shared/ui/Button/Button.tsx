import cls from './Button.module.scss';

import type { ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'block';

type BaseProps = { variant?: ButtonVariant };
type ButtonAsButton = ComponentProps<'button'> & BaseProps & { href?: undefined };
type ButtonAsLink = ComponentProps<'a'> & BaseProps & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const getClasses = (variant: ButtonVariant, className?: string) =>
  [cls.button, cls[variant], className].filter(Boolean).join(' ');

const Button = (props: ButtonProps) => {
  if (props.href !== undefined) {
    const { children, className, variant = 'primary', ...rest } = props;
    return (
      <a {...rest} className={getClasses(variant, className)}>
        {children}
      </a>
    );
  }

  const { children, className, variant = 'primary', type = 'button', ...rest } = props;
  return (
    <button {...rest} type={type} className={getClasses(variant, className)}>
      {children}
    </button>
  );
};

export { Button };
export type { ButtonVariant };
