import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { sendApplication } from '@/shared/api';
import { Button, FieldError, Input, Select } from '@/shared/ui';

import cls from './ApplicationForm.module.scss';
import { contactMethods, getContactPlaceholder, validateContact } from './contactRules';

import type { ApplicationValues } from '@/shared/api';
import type { TFunction } from 'i18next';
import type { SubmitHandler } from 'react-hook-form';

type FormStatus = 'idle' | 'submitting' | 'error';

type ApplicationFormProps = {
  onSuccess: () => void;
};

const translateError = (t: TFunction, error?: { message?: string }) => (error?.message ? t(error.message) : undefined);

const ApplicationForm = ({ onSuccess }: ApplicationFormProps) => {
  const { t } = useTranslation();
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
  const submitText = isSubmitting ? t('form.sending') : t('form.submit');
  const contactPlaceholder = getContactPlaceholder(method) ?? t('form.contact.placeholder');
  const methodError = translateError(t, errors.method);
  const contactError = translateError(t, errors.contact);

  return (
    <form className={cls.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className={cls.hint}>
        <Trans i18nKey="form.hint" components={{ star: <span className={cls.star} /> }} />
      </p>

      <Input type="text" placeholder={t('form.name')} aria-label={t('form.name')} {...register('name')} />

      <div className={cls.row}>
        <Select
          options={contactMethods}
          placeholder={t('form.method.placeholder')}
          aria-label={t('form.method.label')}
          error={methodError}
          {...register('method', { required: 'form.method.required' })}
        />

        <Input
          type="text"
          placeholder={contactPlaceholder}
          aria-label={t('form.contact.label')}
          error={contactError}
          {...register('contact', {
            required: 'form.contact.required',
            validate: (value, formValues) => validateContact(value, formValues.method),
          })}
        />
      </div>

      {!!isError && <FieldError className={cls.serverError} message={t('form.serverError')} />}

      <Button type="submit" className={cls.submit} disabled={isSubmitting}>
        {submitText}
      </Button>
    </form>
  );
};

export { ApplicationForm };
