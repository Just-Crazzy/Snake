import { useEffect, useRef } from 'react';

const MODAL_HASH = '#joinUs';

const clearHash = () => {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
};

const useHashModal = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const syncWithHash = () => {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      if (window.location.hash === MODAL_HASH) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else if (dialog.open) {
        dialog.close();
      }
    };

    syncWithHash();
    window.addEventListener('hashchange', syncWithHash);

    return () => window.removeEventListener('hashchange', syncWithHash);
  }, []);

  const closeModal = () => dialogRef.current?.close();

  return { dialogRef, closeModal, clearHash };
};

export { useHashModal };
