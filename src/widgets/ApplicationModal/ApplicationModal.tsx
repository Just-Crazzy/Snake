import { useState } from 'react';

import Logotip from '@public/icons/mask.svg?react';

import cls from './ApplicationModal.module.scss';
import { ContactForm } from './ContactForm';
import { SuccessMessage } from './SuccessMessage';
import { useHashModal } from './useHashModal';

const ApplicationModal = () => {
  const { dialogRef, closeModal, clearHash } = useHashModal();
  const [isSuccess, setIsSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    clearHash();
    setIsSuccess(false);
    setFormKey((key) => key + 1);
  };

  const isFormVisible = !isSuccess;

  return (
    <dialog ref={dialogRef} className={cls.modal} onClose={handleClose}>
      <button type="button" className={cls.close} aria-label="Close" onClick={closeModal}>
        X
      </button>

      <Logotip className={cls.logo} />

      {!!isFormVisible && <ContactForm key={formKey} onSuccess={() => setIsSuccess(true)} />}
      {!!isSuccess && <SuccessMessage onDone={closeModal} />}
    </dialog>
  );
};

export { ApplicationModal };
