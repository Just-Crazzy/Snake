import { useEffect, useRef } from 'react';

import gsap from 'gsap';

const HOLD = 2.5;
const SWITCH = 0.6;

const useSwitchingWord = (words: string[], isReady: boolean) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = ref.current;

    if (!isReady || !container) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const items = Array.from(container.children);
        const duration = ctx.conditions?.reduce ? 0 : SWITCH;
        const timeline = gsap.timeline({ repeat: -1 });

        items.forEach((item, index) => {
          gsap.set(item, { y: 0, yPercent: index === 0 ? 0 : -100 });
        });

        items.forEach((item, index) => {
          const next = items[(index + 1) % items.length];
          const position = index * (HOLD + duration) + HOLD;
          const options = { duration, ease: 'power2.inOut', immediateRender: false };

          timeline
            .fromTo(item, { yPercent: 0 }, { ...options, yPercent: 100 }, position)
            .fromTo(next, { yPercent: -100 }, { ...options, yPercent: 0 }, position);
        });
      },
      container
    );

    return () => mm.revert();
  }, [words, isReady]);

  return ref;
};

export { useSwitchingWord };
