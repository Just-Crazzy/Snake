import { FieldError } from '../FieldError/FieldError';

import cls from './Select.module.scss';

import type { ComponentProps } from 'react';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = ComponentProps<'select'> & {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

const Select = ({ options, placeholder, error, className, ...props }: SelectProps) => (
  <div className={cls.wrap}>
    <div className={cls.selectWrap}>
      <select
        {...props}
        aria-invalid={!!error}
        className={[cls.select, error && cls.selectError, className].filter(Boolean).join(' ')}
      >
        {!!placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
    <FieldError message={error} />
  </div>
);

export { Select };
export type { SelectOption };
