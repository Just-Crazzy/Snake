import { useEffect } from 'react';

import gsap from 'gsap';

import type { RefObject } from 'react';

const MOTION_QUERY = '(min-width: 577px) and (prefers-reduced-motion: no-preference)';
const MOVE_DURATION = 4;
const PAUSE_DURATION = 1.5;
const MOVE_EASE = 'power2.inOut';

const POSITIONS = [
  { x: '0%', y: '50%' },
  { x: '85%', y: '90%' },
  { x: '0%', y: '50%' },
  { x: '85%', y: '10%' },
];

const useGridMeshAnimation = (maskRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const mask = maskRef.current;

    if (!mask) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_QUERY, () => {
      const tl = gsap.timeline({
        repeat: -1,
        defaults: { duration: MOVE_DURATION, ease: MOVE_EASE },
      });

      POSITIONS.forEach((position) => {
        tl.to(mask, { '--x': position.x, '--y': position.y });
        tl.to({}, { duration: PAUSE_DURATION });
      });
    });

    return () => mm.revert();
  }, [maskRef]);
};

export { useGridMeshAnimation };
