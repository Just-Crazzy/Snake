import gsap from 'gsap';

import { INTRO } from '@/shared/config';

import { fadeFrom, fadeTo, slideFrom, slideTo } from './intro';
import { useSectionAnimation } from './useSectionAnimation';

import type { SectionAnimation } from './useSectionAnimation';
import type { RefObject } from 'react';

const EXIT_TITLE = { yPercent: -300 };
const EXIT_BLOCK = { yPercent: -100 };

const TITLE = '[data-mt="title"]';
const SNAKE = '[data-mt-group="snake"]';
const CARD = '[data-mt="card"]';

const getCardColumns = (scope: HTMLElement) => {
  const columns = new Map<number, HTMLElement[]>();

  scope.querySelectorAll<HTMLElement>(CARD).forEach((card) => {
    columns.set(card.offsetLeft, [...(columns.get(card.offsetLeft) ?? []), card]);
  });

  return [...columns.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, cards]) => cards.sort((top, bottom) => top.offsetTop - bottom.offsetTop));
};

const createExit = (scope: HTMLElement) =>
  gsap
    .timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      defaults: { ease: 'none' },
    })
    .to(TITLE, EXIT_TITLE, 0)
    .to(`${SNAKE}, ${CARD}`, EXIT_BLOCK, 0);

const createIntro = (scope: HTMLElement) => {
  const intro = gsap
    .timeline({ paused: true })
    .fromTo(SNAKE, slideFrom(-INTRO.offset), slideTo(), 0)
    .fromTo(TITLE, fadeFrom(), fadeTo(), 0);

  getCardColumns(scope).forEach((column) => {
    intro.fromTo(column, slideFrom(INTRO.offset), slideTo({ stagger: INTRO.stagger }), INTRO.next);
  });

  return intro;
};

const MULTITASKS: SectionAnimation = {
  screenId: 'team',
  createIntro,
  createExit,
};

const useMultitasksAnimation = (scopeRef: RefObject<HTMLElement | null>, isReady: boolean) =>
  useSectionAnimation(scopeRef, isReady, MULTITASKS);

export { useMultitasksAnimation };
