import { useParams } from 'react-router-dom';

import { heroWords } from '@/shared/config';
import { Button, Socials } from '@/shared/ui';

import snake from '@public/img/snake-hero.png';

import cls from './Hero.module.scss';
import { useSwitchingWord } from './useSwitchingWord';

import type { Lang } from '@/shared/config';

type HeroProps = {
  isReady?: boolean;
};

function Hero({ isReady = true }: HeroProps) {
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
            We provide effective solutions, tested and refined
            <br />
            on our own products and ad budgets
          </p>

          <Button href="#joinUs" variant="block" className={cls.button}>
            Get in touch
          </Button>
        </div>

        <img className={cls.snake} src={snake} alt="" />

        <Socials className={cls.socials} />
      </div>
    </section>
  );
}

export { Hero };
