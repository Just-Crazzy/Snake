import { Trans, useTranslation } from 'react-i18next';

import { Button, Socials } from '@/shared/ui';

import snake from '@public/img/snake-hero.png';

import cls from './Hero.module.scss';

function Hero() {
  const { t } = useTranslation();

  return (
    <section className={cls.page}>
      <div className={cls.container}>
        <div className={cls.content}>
          <h1 className={cls.title}>
            Practice <br />
            makes <span className={cls.accent}>profit</span>
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
