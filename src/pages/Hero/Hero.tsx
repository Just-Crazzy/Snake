import { Button, Socials } from '@/shared/ui';

import snake from '@public/img/snake-hero.png';

import cls from './Hero.module.scss';

function Hero() {
  return (
    <section className={cls.page}>
      <div className={cls.container}>
        <div className={cls.content}>
          <h1 className={cls.title}>
            Practice <br />
            makes <span className={cls.accent}>profit</span>
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
