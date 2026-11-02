import { useEffect, useState } from 'react';

const clearHash = () => {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
};

const useHashModal = (hash: string) => {
  const [isOpen, setIsOpen] = useState(() => window.location.hash === hash);

  useEffect(() => {
    const syncWithHash = () => setIsOpen(window.location.hash === hash);

    window.addEventListener('hashchange', syncWithHash);

    return () => window.removeEventListener('hashchange', syncWithHash);
  }, [hash]);

  const close = () => {
    clearHash();
    setIsOpen(false);
  };

  return { isOpen, close };
};

export { useHashModal };
