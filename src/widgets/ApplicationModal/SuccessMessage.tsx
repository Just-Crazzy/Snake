import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui';

import cls from './ApplicationModal.module.scss';

type SuccessMessageProps = {
  onDone: () => void;
};

const SuccessMessage = ({ onDone }: SuccessMessageProps) => {
  const { t } = useTranslation();

  return (
    <div className={cls.success}>
      <h2 className={cls.title}>{t('success.title')}</h2>
      <p className={cls.text}>
        <Trans i18nKey="success.text" />
      </p>
      <Button onClick={onDone}>{t('success.button')}</Button>
    </div>
  );
};

export { SuccessMessage };
