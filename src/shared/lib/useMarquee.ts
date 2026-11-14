import { useEffect, useRef } from 'react';

import gsap from 'gsap';

import type { Lang } from '@/shared/config';

const SPEED = 100;

const useMarquee = (lang: Lang, text: string) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;

    if (!track || !group) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        if (ctx.conditions?.reduce) return;

        const tween = gsap.to(track, {
          xPercent: -50,
          ease: 'none',
          repeat: -1,
          duration: group.offsetWidth / SPEED,
        });

        const observer = new ResizeObserver(() => {
          const progress = tween.progress();

          tween.duration(group.offsetWidth / SPEED).progress(progress);
        });

        observer.observe(group);

        return () => observer.disconnect();
      },
      track
    );

    return () => mm.revert();
  }, [lang, text]);

  return { trackRef, groupRef };
};

export { useMarquee };
