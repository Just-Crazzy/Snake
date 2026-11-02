import cls from './FieldError.module.scss';

type FieldErrorProps = {
  message?: string;
  className?: string;
};

const FieldError = ({ message, className }: FieldErrorProps) => {
  if (!message) {
    return null;
  }

  return <span className={[cls.error, className].filter(Boolean).join(' ')}>{message}</span>;
};

export { FieldError };
