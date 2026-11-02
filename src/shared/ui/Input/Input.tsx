import { FieldError } from '../FieldError/FieldError';

import cls from './Input.module.scss';

import type { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'> & {
  error?: string;
};

const Input = ({ className, error, ...props }: InputProps) => (
  <div className={cls.wrap}>
    <input
      {...props}
      aria-invalid={!!error}
      className={[cls.input, error && cls.inputError, className].filter(Boolean).join(' ')}
    />
    <FieldError message={error} />
  </div>
);

export { Input };
