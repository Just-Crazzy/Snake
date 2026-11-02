import { useState } from 'react';

import { useHashModal } from '@/shared/lib';
import { Modal } from '@/shared/ui';

import Logotip from '@public/icons/mask.svg?react';

import { ApplicationForm } from './ApplicationForm';
import cls from './ApplicationModal.module.scss';
import { SuccessMessage } from './SuccessMessage';

const ApplicationModal = () => {
  const { isOpen, close } = useHashModal('#joinUs');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    close();
    setIsSuccess(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Logotip className={cls.logo} />

      {isSuccess ? <SuccessMessage onDone={handleClose} /> : <ApplicationForm onSuccess={() => setIsSuccess(true)} />}
    </Modal>
  );
};

export { ApplicationModal };
