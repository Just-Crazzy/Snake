import cls from './ApplicationModal.module.scss';

import type { FieldError } from 'react-hook-form';

type ErrorTextProps = {
  error?: FieldError;
};

const ErrorText = ({ error }: ErrorTextProps) => {
  if (!error) {
    return null;
  }

  return <span className={cls.error}>{error.message}</span>;
};

export { ErrorText };
