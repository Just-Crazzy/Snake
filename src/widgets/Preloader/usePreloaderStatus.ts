import { useCallback, useEffect, useState } from 'react';

import { prefetchContent } from '@/shared/api';

import type { Lang } from '@/shared/config';

type PreloaderStatus = 'loading' | 'finishing' | 'error';

const DEADLINE = 60000;
const RETRY_DELAY = 3000;

const waitImage = (src: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });

const loadAssets = (images: string[]) => Promise.all([document.fonts.ready, ...images.map(waitImage)]);

const getStatus = (ready: boolean, failed: boolean): PreloaderStatus => {
  if (ready) return 'finishing';

  return failed ? 'error' : 'loading';
};

const usePreloaderStatus = (lang: Lang, images: string[]) => {
  const [assetsReady, setAssetsReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    loadAssets(images).then(() => {
      if (active) setAssetsReady(true);
    });

    return () => {
      active = false;
    };
  }, [images]);

  useEffect(() => {
    const controller = new AbortController();
    let retryTimer = 0;

    const load = () => {
      prefetchContent(lang, controller.signal)
        .then(() => {
          if (!controller.signal.aborted) setContentReady(true);
        })
        .catch(() => {
          if (!controller.signal.aborted) retryTimer = window.setTimeout(load, RETRY_DELAY);
        });
    };

    const deadline = window.setTimeout(() => {
      controller.abort();
      setFailed(true);
    }, DEADLINE);

    load();

    return () => {
      controller.abort();
      window.clearTimeout(retryTimer);
      window.clearTimeout(deadline);
    };
  }, [lang, attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((current) => current + 1);
  }, []);

  return { status: getStatus(assetsReady && contentReady, failed), retry };
};

export { usePreloaderStatus };
