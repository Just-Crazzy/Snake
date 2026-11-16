import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { INTRO, MEDIA } from '@/shared/config';

gsap.registerPlugin(ScrollTrigger);

const INTRO_CONDITIONS = { animated: MEDIA.animated, still: MEDIA.still };

const LEAVE_RANGE = { start: 'top top', end: 'bottom top' };
const BACK_RANGE = { start: 'top bottom', end: 'top top' };

let layoutObserver: ResizeObserver | null = null;
let layoutUsers = 0;

const fadeFrom = (): gsap.TweenVars => ({ autoAlpha: 0 });

const fadeTo = (vars: gsap.TweenVars = {}): gsap.TweenVars => ({
  autoAlpha: 1,
  duration: INTRO.duration,
  ...vars,
});

const slideFrom = (offset: number): gsap.TweenVars => ({
  x: offset,
  autoAlpha: 0,
});

const slideTo = (vars: gsap.TweenVars = {}): gsap.TweenVars => ({
  x: 0,
  autoAlpha: 1,
  duration: INTRO.duration,
  ease: INTRO.ease,
  ...vars,
});

const playOnEnter = (trigger: gsap.DOMTarget, intro: gsap.core.Timeline) => {
  const enter = ScrollTrigger.create({
    trigger,
    start: INTRO.enterStart,
    onEnter: (self) => {
      self.kill();
      intro.play();
    },
  });

  if (enter.progress > 0) {
    enter.kill();
    intro.play();
  }
};

const finishOnLeave = (
  trigger: gsap.DOMTarget,
  intro: gsap.core.Timeline,
  onDone: () => void,
) => {
  const finish = () => {
    if (intro.isActive()) intro.progress(1);
  };

  const down = ScrollTrigger.create({
    trigger,
    ...LEAVE_RANGE,
    onUpdate: (self) => {
      if (self.progress > 0) finish();
    },
  });

  const back = ScrollTrigger.create({
    trigger,
    ...BACK_RANGE,
    onUpdate: (self) => {
      if (self.direction < 0) finish();
    },
  });

  intro.eventCallback('onComplete', () => {
    down.kill();
    back.kill();
    onDone();
  });

  if (down.progress > 0) intro.progress(1);
};

const observeLayout = () => {
  layoutUsers += 1;

  if (!layoutObserver) {
    layoutObserver = new ResizeObserver(() => ScrollTrigger.refresh());
    layoutObserver.observe(document.body);
  }

  return () => {
    layoutUsers -= 1;

    if (layoutUsers > 0) return;

    layoutObserver?.disconnect();
    layoutObserver = null;
  };
};

export {
  fadeFrom,
  fadeTo,
  finishOnLeave,
  INTRO_CONDITIONS,
  observeLayout,
  playOnEnter,
  slideFrom,
  slideTo,
};
