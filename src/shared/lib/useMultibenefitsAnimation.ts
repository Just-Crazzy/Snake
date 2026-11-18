import gsap from 'gsap';

import { INTRO } from '@/shared/config';

import { fadeFrom, fadeTo, slideFrom, slideTo } from './intro';
import { useSectionAnimation } from './useSectionAnimation';

import type { SectionAnimation } from './useSectionAnimation';
import type { RefObject } from 'react';

const TEXT_DELAY = 0.15;

const LABEL = '[data-mb="label"]';
const TITLE = '[data-mb="title"]';
const TEXT = '[data-mb="text"]';
const SNAKE = '[data-mb="snake"]';
const CARD = '[data-mb="card"]';

const createIntro = () =>
  gsap
    .timeline({ paused: true })
    .fromTo(LABEL, fadeFrom(), fadeTo(), 0)
    .fromTo(TITLE, slideFrom(-INTRO.offset), slideTo(), 0)
    .fromTo(TEXT, slideFrom(-INTRO.offset), slideTo(), TEXT_DELAY)
    .fromTo(
      SNAKE,
      { '--snake-x': `${INTRO.offset}px`, '--snake-opacity': 0 },
      {
        '--snake-x': '0px',
        '--snake-opacity': 1,
        duration: INTRO.duration,
        ease: INTRO.ease,
      },
      INTRO.next
    )
    .fromTo(CARD, slideFrom(INTRO.offset), slideTo({ stagger: INTRO.stagger }), INTRO.next);

const MULTIBENEFITS: SectionAnimation = { screenId: 'benefits', createIntro };

const useMultibenefitsAnimation = (scopeRef: RefObject<HTMLElement | null>, isReady: boolean) =>
  useSectionAnimation(scopeRef, isReady, MULTIBENEFITS);

export { useMultibenefitsAnimation };
