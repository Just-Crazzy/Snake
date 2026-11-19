import { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import gsap from 'gsap';

import { INTRO } from '@/shared/config';

import { fadeFrom, fadeTo, finishOnLeave, INTRO_CONDITIONS, slideFrom, slideTo } from './intro';

import type { Lang } from '@/shared/config';
import type { RefObject } from 'react';

const HERO_DURATION = 0.6;
const HERO_STAGGER = 0.15;

const EXIT_CONTENT = { xPercent: -110 };
const EXIT_SOCIALS = { xPercent: -300 };
const EXIT_SNAKE = { xPercent: 60 };
const EXIT_LOGO = { yPercent: -200 };
const EXIT_NAV = { xPercent: 40, yPercent: -200 };

const HERO = '#hero';
const CONTENT = '[data-hero="content"]';
const TITLE = '[data-hero="title"]';
const TEXT = '[data-hero="text"]';
const BUTTON = '[data-hero="button"]';
const SNAKE = '[data-hero="snake"]';
const SOCIALS = '[data-hero="socials"]';
const HEADER_LEFT = '[data-header="left"]';
const HEADER_RIGHT = '[data-header="right"]';

const FADE_TARGETS = [SNAKE, HEADER_LEFT, HEADER_RIGHT].join(', ');
const SLIDE_TARGETS = [TITLE, TEXT, BUTTON, SOCIALS].join(', ');

const HERO_RANGE = { trigger: HERO, start: 'top top', end: 'bottom top' };

const createExit = () =>
  gsap
    .timeline({
      scrollTrigger: { ...HERO_RANGE, scrub: true },
      defaults: { ease: 'none' },
    })
    .to(CONTENT, EXIT_CONTENT, 0)
    .to(SOCIALS, EXIT_SOCIALS, 0)
    .to(SNAKE, EXIT_SNAKE, 0)
    .to(HEADER_LEFT, EXIT_LOGO, 0)
    .to(HEADER_RIGHT, EXIT_NAV, 0);

const createIntro = () =>
  gsap
    .timeline()
    .fromTo(FADE_TARGETS, fadeFrom(), fadeTo({ duration: HERO_DURATION }))
    .fromTo(SLIDE_TARGETS, slideFrom(-INTRO.offset), slideTo({ duration: HERO_DURATION, stagger: HERO_STAGGER }));

const useHeroAnimation = (scopeRef: RefObject<HTMLElement | null>, isReady: boolean) => {
  const { lang } = useParams<{ lang: Lang }>();
  const [isIntroDone, setIsIntroDone] = useState(false);
  const introPlayedRef = useRef(false);

  useLayoutEffect(() => {
    const scope = scopeRef.current;

    if (!isReady || !scope) return;

    const markIntroDone = () => {
      introPlayedRef.current = true;
      setIsIntroDone(true);
    };

    const mm = gsap.matchMedia();

    mm.add(
      INTRO_CONDITIONS,
      (ctx) => {
        if (!ctx.conditions?.animated) {
          markIntroDone();

          return;
        }

        createExit();

        if (introPlayedRef.current) {
          markIntroDone();

          return;
        }

        finishOnLeave(HERO, createIntro(), markIntroDone);
      },
      scope
    );

    return () => mm.revert();
  }, [lang, isReady, scopeRef]);

  return isIntroDone;
};

export { useHeroAnimation };
