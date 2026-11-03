import cls from './Button.module.scss';

import type { ComponentProps } from 'react';

type ButtonAsButton = ComponentProps<'button'> & { href?: undefined };
type ButtonAsLink = ComponentProps<'a'> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button = (props: ButtonProps) => {
  const classes = [cls.button, props.className].filter(Boolean).join(' ');

  if (props.href !== undefined) {
    const { children, className, ...rest } = props;
    return (
      <a {...rest} className={classes}>
        {children}
      </a>
    );
  }

  const { children, className, type = 'button', ...rest } = props;
  return (
    <button {...rest} type={type} className={classes}>
      {children}
    </button>
  );
};

export { Button };
