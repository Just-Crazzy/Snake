import { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import cls from './Modal.module.scss';

import type { ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

const syncDialog = (dialog: HTMLDialogElement, isOpen: boolean) => {
  if (dialog.open === isOpen) {
    return;
  }

  if (isOpen) {
    dialog.showModal();
  } else {
    dialog.close();
  }
};

const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    syncDialog(dialog, isOpen);
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className={[cls.modal, className].filter(Boolean).join(' ')} onClose={onClose}>
      <button
        type="button"
        className={cls.close}
        aria-label={t('common.close')}
        onClick={() => dialogRef.current?.close()}
      >
        X
      </button>

      {!!isOpen && children}
    </dialog>
  );
};

export { Modal };
