import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { heroWords } from '@/shared/config';
import { useSwitchingWord } from '@/shared/lib';
import { Button, Socials } from '@/shared/ui';

import snake from '@public/img/snake-hero.png';

import cls from './Hero.module.scss';

import type { Lang } from '@/shared/config';

type HeroProps = {
  isReady?: boolean;
};

function Hero({ isReady = true }: HeroProps) {
  const { t } = useTranslation();
  const { lang = 'en' } = useParams<{ lang: Lang }>();
  const words = heroWords[lang];
  const wordsRef = useSwitchingWord(words, isReady);

  return (
    <section id="hero" className={cls.page}>
      <div className={cls.container}>
        <div className={cls.content}>
          <h1 className={cls.title}>
            <span className="sr-only">Practice makes {words.join(', ')}</span>
            <span aria-hidden="true">
              Practice <br />
              makes{' '}
              <span ref={wordsRef} className={cls.words}>
                {words.map((word) => (
                  <span key={word} className={cls.word}>
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p className={cls.text}>
            <Trans i18nKey="hero.text" />
          </p>

          <Button href="#joinUs" variant="block" className={cls.button}>
            {t('hero.button')}
          </Button>
        </div>

        <img className={cls.snake} src={snake} alt="" />

        <Socials className={cls.socials} />
      </div>
    </section>
  );
}

export { Hero };
