import { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Lang } from '@/shared/config';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

const INTRO_QUERY = '(min-width: 577px) and (prefers-reduced-motion: no-preference)';
const EXIT_QUERY = '(min-width: 1025px) and (prefers-reduced-motion: no-preference)';
const STILL_QUERY = '(max-width: 576px), (prefers-reduced-motion: reduce)';

const INTRO_FADE = 0.6;
const INTRO_SLIDE = 0.6;
const INTRO_STAGGER = 0.15;
const INTRO_OFFSET = -80;
const INTRO_EASE = 'power3.out';

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

const createIntro = (onComplete: () => void) => {
  const intro = gsap
    .timeline({ onComplete })
    .fromTo(FADE_TARGETS, { autoAlpha: 0 }, { autoAlpha: 1, duration: INTRO_FADE })
    .fromTo(
      SLIDE_TARGETS,
      { x: INTRO_OFFSET, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: INTRO_SLIDE,
        stagger: INTRO_STAGGER,
        ease: INTRO_EASE,
      }
    );

  const watcher = ScrollTrigger.create({
    ...HERO_RANGE,
    onUpdate: (self) => {
      if (self.progress > 0 && intro.isActive()) intro.progress(1);
    },
  });

  if (watcher.progress > 0) intro.progress(1);
};

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
      { intro: INTRO_QUERY, exit: EXIT_QUERY, still: STILL_QUERY },
      (ctx) => {
        const { intro: isIntro, exit: isExit } = ctx.conditions ?? {};

        if (isExit) createExit();

        if (isIntro && !introPlayedRef.current) createIntro(markIntroDone);
        else markIntroDone();
      },
      scope
    );

    return () => mm.revert();
  }, [lang, isReady, scopeRef]);

  return isIntroDone;
};

export { useHeroAnimation };
