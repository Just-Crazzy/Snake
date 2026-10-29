import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { sendApplication } from '@/shared/api';

import cls from './ApplicationModal.module.scss';
import { contactMethods, getContactPlaceholder, validateContact } from './contactRules';
import { ErrorText } from './ErrorText';

import type { ApplicationValues } from '@/shared/api';
import type { FieldError, SubmitHandler } from 'react-hook-form';

type FormStatus = 'idle' | 'submitting' | 'error';

type ContactFormProps = {
  onSuccess: () => void;
};

const getFieldClass = (error?: FieldError) => (error ? `${cls.field} ${cls.fieldError}` : cls.field);

const ContactForm = ({ onSuccess }: ContactFormProps) => {
  const [status, setStatus] = useState<FormStatus>('idle');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ApplicationValues>({
    defaultValues: { name: '', contact: '' },
  });

  const method = useWatch({ control, name: 'method' });

  const onSubmit: SubmitHandler<ApplicationValues> = async (values) => {
    setStatus('submitting');

    try {
      await sendApplication(values);
      onSuccess();
    } catch {
      setStatus('error');
    }
  };

  const isSubmitting = status === 'submitting';
  const isError = status === 'error';
  const submitText = isSubmitting ? 'Sending...' : 'Submit';

  return (
    <form className={cls.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className={cls.hint}>
        Fields with an asterisk (<span className={cls.star}>*</span>) are mandatory
      </p>

      <input className={cls.field} type="text" placeholder="Your Name" aria-label="Your name" {...register('name')} />

      <div className={cls.row}>
        <div className={cls.cell}>
          <div className={cls.selectWrap}>
            <select
              className={getFieldClass(errors.method)}
              aria-label="Contact method"
              {...register('method', { required: 'Choose a contact method' })}
            >
              <option value="">Contact Method*</option>
              {contactMethods.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <ErrorText error={errors.method} />
        </div>

        <div className={cls.cell}>
          <input
            className={getFieldClass(errors.contact)}
            type="text"
            placeholder={getContactPlaceholder(method)}
            aria-label="Your contact"
            {...register('contact', {
              required: 'Enter your contact',
              validate: (value, formValues) => validateContact(value, formValues.method),
            })}
          />
          <ErrorText error={errors.contact} />
        </div>
      </div>

      {!!isError && <p className={cls.serverError}>Something went wrong. Please try again later</p>}

      <button type="submit" className={cls.submit} disabled={isSubmitting}>
        {submitText}
      </button>
    </form>
  );
};

export { ContactForm };
