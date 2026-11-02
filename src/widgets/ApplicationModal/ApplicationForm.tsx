import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { sendApplication } from '@/shared/api';
import { Button, FieldError, Input, Select } from '@/shared/ui';

import cls from './ApplicationForm.module.scss';
import { contactMethods, getContactPlaceholder, validateContact } from './contactRules';

import type { ApplicationValues } from '@/shared/api';
import type { SubmitHandler } from 'react-hook-form';

type FormStatus = 'idle' | 'submitting' | 'error';

type ApplicationFormProps = {
  onSuccess: () => void;
};

const ApplicationForm = ({ onSuccess }: ApplicationFormProps) => {
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

      <Input type="text" placeholder="Your Name" aria-label="Your name" {...register('name')} />

      <div className={cls.row}>
        <Select
          options={contactMethods}
          placeholder="Contact Method*"
          aria-label="Contact method"
          error={errors.method?.message}
          {...register('method', { required: 'Choose a contact method' })}
        />

        <Input
          type="text"
          placeholder={getContactPlaceholder(method)}
          aria-label="Your contact"
          error={errors.contact?.message}
          {...register('contact', {
            required: 'Enter your contact',
            validate: (value, formValues) => validateContact(value, formValues.method),
          })}
        />
      </div>

      {!!isError && <FieldError className={cls.serverError} message="Something went wrong. Please try again later" />}

      <Button type="submit" className={cls.submit} disabled={isSubmitting}>
        {submitText}
      </Button>
    </form>
  );
};

export { ApplicationForm };
