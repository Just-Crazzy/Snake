import { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import gsap from 'gsap';

import { SCREENS } from '@/shared/config';

import { finishOnLeave, INTRO_CONDITIONS, observeLayout, playOnEnter } from './intro';

import type { Lang } from '@/shared/config';
import type { RefObject } from 'react';

type ScreenId = (typeof SCREENS)[number];

type SectionAnimation = {
  screenId: ScreenId;
  createIntro: (scope: HTMLElement) => gsap.core.Timeline;
  createExit?: (scope: HTMLElement) => void;
};

const isScreenPassed = (screenId: ScreenId) =>
  SCREENS.findIndex((screen) => screen === window.location.hash.slice(1)) >= SCREENS.indexOf(screenId);

const useSectionAnimation = (
  scopeRef: RefObject<HTMLElement | null>,
  isReady: boolean,
  animation: SectionAnimation
) => {
  const { lang } = useParams<{ lang: Lang }>();
  const [isAnchored] = useState(() => isScreenPassed(animation.screenId));
  const playedRef = useRef(isAnchored);

  useLayoutEffect(() => {
    const scope = scopeRef.current;

    if (!isReady || !scope) return;

    const markPlayed = () => {
      playedRef.current = true;
    };

    const mm = gsap.matchMedia();

    mm.add(
      INTRO_CONDITIONS,
      (ctx) => {
        if (!ctx.conditions?.animated) {
          markPlayed();

          return undefined;
        }

        animation.createExit?.(scope);

        if (!playedRef.current) {
          const intro = animation.createIntro(scope);

          playOnEnter(scope, intro);
          finishOnLeave(scope, intro, markPlayed);
        }

        return observeLayout();
      },
      scope
    );

    return () => mm.revert();
  }, [lang, isReady, scopeRef, animation]);
};

export { useSectionAnimation };
export type { SectionAnimation };
