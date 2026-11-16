import gsap from 'gsap';

import { INTRO } from '@/shared/config';

import { fadeFrom, fadeTo } from './intro';
import { useSectionAnimation } from './useSectionAnimation';

import type { SectionAnimation } from './useSectionAnimation';
import type { RefObject } from 'react';

const TITLE = '[data-mw="title"]';
const TAB = '[data-mw="tab"]';
const CARD = '[data-mw="card"]';
const FOOTER = '[data-mw="footer"]';

const createIntro = () =>
  gsap
    .timeline({ paused: true })
    .fromTo(TITLE, fadeFrom(), fadeTo(), 0)
    .fromTo(TAB, fadeFrom(), fadeTo({ stagger: INTRO.stagger }), INTRO.next)
    .fromTo(CARD, fadeFrom(), fadeTo(), INTRO.next)
    .fromTo(FOOTER, fadeFrom(), fadeTo(), '<');

const MULTIPLY: SectionAnimation = { screenId: 'join', createIntro };

const useMultiplyAnimation = (
  scopeRef: RefObject<HTMLElement | null>,
  isReady: boolean,
) => useSectionAnimation(scopeRef, isReady, MULTIPLY);

export { useMultiplyAnimation };
