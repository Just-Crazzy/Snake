const MOBILE_MAX = 576;
const DESKTOP_MIN = 1025;

const MOTION = '(prefers-reduced-motion: no-preference)';
const REDUCE = '(prefers-reduced-motion: reduce)';
const DESKTOP = `(min-width: ${DESKTOP_MIN}px)`;

const MEDIA = {
  motion: MOTION,
  reduce: REDUCE,
  notMobile: `(min-width: ${MOBILE_MAX + 1}px)`,
  desktop: DESKTOP,
  animated: `${DESKTOP} and ${MOTION}`,
  still: `(max-width: ${DESKTOP_MIN - 1}px), ${REDUCE}`,
} as const;

const INTRO = {
  duration: 0.5,
  stagger: 0.1,
  offset: 80,
  ease: 'power3.out',
  next: '>-0.2',
  enterStart: 'top 75%',
} as const;

export { INTRO, MEDIA };
