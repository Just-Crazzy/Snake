import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Hero, MultiBenefits, MultiplyWithUs, MultiTasks } from '@/pages/index';

import { ApplicationModal } from '@/widgets/ApplicationModal';

import { SCREENS } from '@/shared/config';
import {
  removePreloaderShell,
  useFullpageScroll,
  useHeroAnimation,
} from '@/shared/lib';
import { Logo } from '@/shared/ui';

import { Header, HeaderNav, Preloader } from '@/widgets';

import { Background } from '@/widgets';

import snakeHero from '@public/img/snake-hero.png';

import cls from './Home.module.scss';

import type { Lang } from '@/shared/config';

const FIRST_SCREEN_IMAGES = [snakeHero];

function Home() {
  const { lang = 'en' } = useParams<{ lang: Lang }>();
  const [showPreloader] = useState(
    () => window.matchMedia('(min-width: 576px)').matches,
  );
  const [isDone, setIsDone] = useState(false);
  const isLoading = showPreloader && !isDone;
  const contentClassName = isLoading ? cls.hidden : undefined;
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDone = useCallback(() => setIsDone(true), []);

  useFullpageScroll({ screens: SCREENS, isEnabled: !isLoading });
  const isIntroDone = useHeroAnimation(contentRef, !isLoading);

  useEffect(() => {
    if (!showPreloader) removePreloaderShell();
  }, [showPreloader]);

  useEffect(() => {
    const id = window.location.hash.slice(1);

    if (isDone && id) document.getElementById(id)?.scrollIntoView();
  }, [isDone]);

  return (
    <>
      <Background />

      <div ref={contentRef} className={contentClassName}>
        <div className={cls.header}>
          <Header left={<Logo />} right={<HeaderNav />} />
        </div>

        <Hero isReady={isIntroDone} />
        <MultiTasks />
        <MultiBenefits />
        <MultiplyWithUs />
        <ApplicationModal />
      </div>

      {!!isLoading && (
        <Preloader
          lang={lang}
          images={FIRST_SCREEN_IMAGES}
          onDone={handleDone}
        />
      )}
    </>
  );
}

export { Home };
