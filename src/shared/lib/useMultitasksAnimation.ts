import { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { SCREENS } from '@/shared/config';

import type { Lang } from '@/shared/config';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

const INTRO_QUERY = '(min-width: 577px) and (prefers-reduced-motion: no-preference)';
const EXIT_QUERY = '(min-width: 1025px) and (prefers-reduced-motion: no-preference)';
const STILL_QUERY = '(max-width: 576px), (prefers-reduced-motion: reduce)';

const INTRO_DURATION = 0.5;
const INTRO_STAGGER = 0.1;
const INTRO_OVERLAP = 0.2;
const INTRO_OFFSET = 80;
const INTRO_EASE = 'power3.out';
const ENTER_START = 'top 75%';

const EXIT_TITLE = { yPercent: -300 };
const EXIT_BLOCK = { yPercent: -100 };

const SCREEN_ID = 'team';
const TITLE = '[data-mt="title"]';
const SNAKE = '[data-mt-group="snake"]';
const CARD = '[data-mt="card"]';

const isOpenedOnScreen = () =>
  SCREENS.findIndex((screen) => screen === window.location.hash.slice(1)) >= SCREENS.indexOf(SCREEN_ID);

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
      scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: true },
      defaults: { ease: 'none' },
    })
    .to(TITLE, EXIT_TITLE, 0)
    .to(`${SNAKE}, ${CARD}`, EXIT_BLOCK, 0);

const createIntro = (scope: HTMLElement, onComplete: () => void) => {
  const intro = gsap
    .timeline({ paused: true, onComplete })
    .fromTo(
      SNAKE,
      { x: -INTRO_OFFSET, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: INTRO_DURATION, ease: INTRO_EASE },
      0
    )
    .fromTo(TITLE, { autoAlpha: 0 }, { autoAlpha: 1, duration: INTRO_DURATION }, 0);

  getCardColumns(scope).forEach((column) => {
    intro.fromTo(
      column,
      { x: INTRO_OFFSET, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: INTRO_DURATION, stagger: INTRO_STAGGER, ease: INTRO_EASE },
      `>-${INTRO_OVERLAP}`
    );
  });

  const enter = ScrollTrigger.create({
    trigger: scope,
    start: ENTER_START,
    once: true,
    onEnter: () => intro.play(),
  });

  if (enter.progress > 0) intro.play();

  const watcher = ScrollTrigger.create({
    trigger: scope,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      if (self.progress > 0 && intro.isActive()) intro.progress(1);
    },
  });

  if (watcher.progress > 0) intro.progress(1);
};

const useMultitasksAnimation = (scopeRef: RefObject<HTMLElement | null>, isReady: boolean) => {
  const { lang } = useParams<{ lang: Lang }>();
  const [isAnchored] = useState(isOpenedOnScreen);
  const playedRef = useRef(isAnchored);

  useLayoutEffect(() => {
    const scope = scopeRef.current;

    if (!isReady || !scope) return;

    const markPlayed = () => {
      playedRef.current = true;
    };

    const mm = gsap.matchMedia();

    mm.add(
      { intro: INTRO_QUERY, exit: EXIT_QUERY, still: STILL_QUERY },
      (ctx) => {
        const { intro: isIntro, exit: isExit } = ctx.conditions ?? {};

        if (isExit) createExit(scope);

        if (isIntro && !playedRef.current) createIntro(scope, markPlayed);
        else markPlayed();
      },
      scope
    );

    return () => mm.revert();
  }, [lang, isReady, scopeRef]);
};

export { useMultitasksAnimation };
