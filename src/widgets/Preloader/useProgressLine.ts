import { useCallback, useEffect, useRef } from 'react';

import gsap from 'gsap';

const WAIT_TARGET = 90;
const WAIT_DURATION = 40;
const FINISH_DURATION = 0.4;
const FADE_DURATION = 0.3;
const MIN_WAIT = 0.6;

const scale = (seconds: number, reduced: boolean) => (reduced ? 0 : seconds);

const useProgressLine = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const waitingRef = useRef<gsap.core.Tween | null>(null);
  const progressRef = useRef({ value: 0 });
  const roundedRef = useRef(0);
  const shownAtRef = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    ctxRef.current = gsap.context(() => undefined);
    shownAtRef.current = performance.now();
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
      waitingRef.current = null;
    };
  }, []);

  const render = useCallback(() => {
    const current = progressRef.current.value;
    const rounded = Math.round(current);

    if (!fillRef.current || !valueRef.current) return;

    fillRef.current.style.width = `${current}%`;
    if (rounded === roundedRef.current) return;

    roundedRef.current = rounded;
    valueRef.current.textContent = `${rounded}%`;
    barRef.current?.setAttribute('aria-valuenow', String(rounded));
  }, []);

  const pause = useCallback(() => {
    waitingRef.current?.kill();
    waitingRef.current = null;
  }, []);

  const startWaiting = useCallback(() => {
    ctxRef.current?.add(() => {
      waitingRef.current?.kill();
      waitingRef.current = gsap.to(progressRef.current, {
        value: WAIT_TARGET,
        duration: scale(WAIT_DURATION, reducedRef.current),
        ease: 'power3.out',
        onUpdate: render,
      });
    });
  }, [render]);

  const finish = useCallback(
    (onComplete: () => void) => {
      const elapsed = (performance.now() - shownAtRef.current) / 1000;

      ctxRef.current?.add(() => {
        gsap
          .timeline({
            delay: scale(Math.max(0, MIN_WAIT - elapsed), reducedRef.current),
            onComplete,
          })
          .to(progressRef.current, {
            value: 100,
            duration: scale(FINISH_DURATION, reducedRef.current),
            ease: 'power1.out',
            overwrite: 'auto',
            onUpdate: render,
          })
          .to(rootRef.current, {
            opacity: 0,
            duration: scale(FADE_DURATION, reducedRef.current),
          });
      });
    },
    [render]
  );

  return { rootRef, barRef, fillRef, valueRef, startWaiting, pause, finish };
};

export { useProgressLine };
