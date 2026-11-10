import { useEffect, useRef } from 'react';

import { preloaderTexts } from '@/shared/config';
import { removePreloaderShell } from '@/shared/lib';
import { Button } from '@/shared/ui';

import Mask from '@public/icons/mask.svg?react';

import cls from './Preloader.module.scss';
import { usePreloaderStatus } from './usePreloaderStatus';
import { useProgressLine } from './useProgressLine';

import type { Lang } from '@/shared/config';

type PreloaderProps = {
  lang: Lang;
  images: string[];
  onDone: () => void;
};

function Preloader({ lang, images, onDone }: PreloaderProps) {
  const retryRef = useRef<HTMLButtonElement>(null);
  const texts = preloaderTexts[lang];
  const { status, retry } = usePreloaderStatus(lang, images);
  const { rootRef, barRef, fillRef, valueRef, startWaiting, pause, finish } = useProgressLine();

  useEffect(() => {
    removePreloaderShell();

    const { style } = document.documentElement;
    const overflow = style.overflow;

    style.overflow = 'hidden';

    return () => {
      style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    switch (status) {
      case 'loading':
        startWaiting();
        break;
      case 'finishing':
        finish(onDone);
        break;
      case 'error':
        pause();
        retryRef.current?.focus();
        break;
    }
  }, [status, startWaiting, pause, finish, onDone]);

  return (
    <div ref={rootRef} className={cls.preloader} aria-busy="true">
      <div className={cls.logoBar}>
        <Mask className={cls.logoIcon} aria-hidden="true" />
      </div>

      <div className={cls.center}>
        <span ref={valueRef} className={cls.value} aria-hidden="true">
          0%
        </span>

        <div className={cls.bar}>
          <div
            ref={barRef}
            className={cls.track}
            role="progressbar"
            aria-label={texts.loading}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div ref={fillRef} className={cls.fill} />
          </div>

          {status === 'error' && (
            <div className={cls.error}>
              <p className={cls.message} role="alert">
                {texts.error}
              </p>
              <Button ref={retryRef} onClick={retry}>
                {texts.retry}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { Preloader };
