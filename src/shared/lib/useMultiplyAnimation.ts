import { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { SCREENS } from '@/shared/config';

import type { Lang } from '@/shared/config';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

const INTRO_QUERY = '(min-width: 577px) and (prefers-reduced-motion: no-preference)';
const STILL_QUERY = '(max-width: 576px), (prefers-reduced-motion: reduce)';

const INTRO_DURATION = 0.5;
const INTRO_STAGGER = 0.1;
const INTRO_OVERLAP = 0.2;
const ENTER_START = 'top 75%';
const NEXT_POSITION = `>-${INTRO_OVERLAP}`;

const SCREEN_ID = 'join';
const TITLE = '[data-mw="title"]';
const TAB = '[data-mw="tab"]';
const CARD = '[data-mw="card"]';
const FOOTER = '[data-mw="footer"]';

const hidden = () => ({ autoAlpha: 0 });
const shown = (stagger = 0) => ({
  autoAlpha: 1,
  duration: INTRO_DURATION,
  stagger,
});

const isOpenedOnScreen = () =>
  SCREENS.findIndex((screen) => screen === window.location.hash.slice(1)) >= SCREENS.indexOf(SCREEN_ID);

const createIntro = (scope: HTMLElement, onComplete: () => void) => {
  const intro = gsap
    .timeline({ paused: true, onComplete })
    .fromTo(TITLE, hidden(), shown(), 0)
    .fromTo(TAB, hidden(), shown(INTRO_STAGGER), NEXT_POSITION)
    .fromTo(CARD, hidden(), shown(), NEXT_POSITION)
    .fromTo(FOOTER, hidden(), shown(), '<');

  const enter = ScrollTrigger.create({
    trigger: scope,
    start: ENTER_START,
    once: true,
    onEnter: () => intro.play(),
  });

  if (enter.progress > 0) intro.play();

  const down = ScrollTrigger.create({
    trigger: scope,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      if (self.progress > 0 && intro.isActive()) intro.progress(1);
    },
  });

  if (down.progress > 0) intro.progress(1);

  ScrollTrigger.create({
    trigger: scope,
    start: 'top bottom',
    end: 'top top',
    onUpdate: (self) => {
      if (self.direction < 0 && intro.isActive()) intro.progress(1);
    },
  });

  const layoutObserver = new ResizeObserver(() => ScrollTrigger.refresh());

  layoutObserver.observe(document.body);

  return () => layoutObserver.disconnect();
};

const useMultiplyAnimation = (scopeRef: RefObject<HTMLElement | null>, isReady: boolean) => {
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
      { intro: INTRO_QUERY, still: STILL_QUERY },
      (ctx) => {
        if (ctx.conditions?.intro && !playedRef.current) return createIntro(scope, markPlayed);

        markPlayed();

        return undefined;
      },
      scope
    );

    return () => mm.revert();
  }, [lang, isReady, scopeRef]);
};

export { useMultiplyAnimation };
