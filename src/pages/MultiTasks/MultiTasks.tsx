import { Logo } from '@/shared/ui';

import { Header, HeaderNav } from '@/widgets';

import snake from '@public/img/snake-gem.png';

import cls from './MultiTasks.module.scss';

const cards = [
  {
    title: 'Flexible infrastructure',
    text: 'Custom tools, fast integrations and scalable architecture',
  },
  {
    title: 'Compelling copywriting',
    text: 'Messaging that hooks, sells, and drives funnel growth',
  },
  {
    title: 'High-performing creatives',
    text: 'Scroll-stopping ads tailored to your vertical',
  },
  {
    title: 'Adaptive media buying',
    text: 'No wasted budgets – we test, tweak, and scale',
  },
  {
    title: 'Full-cycle support',
    text: 'From setup to scaling – we support you every step of the way',
  },
];

function MultiTasks() {
  return (
    <section className={cls.page}>
      <div className={cls.container}>
        <div className={cls.header}>
          <Header left={<Logo />} right={<HeaderNav />} />
        </div>

        <h2 className={cls.title}>Multi-tasks</h2>

        <div className={cls.grid}>
          <div className={cls.intro}>
            <p className={cls.introText}>
              We run an <span className={cls.accent}>in-house team</span> of media buyers, designers, creatives,
              developers, and copywriters — no middlemen, no outsourcing
            </p>
            <img className={cls.snake} src={snake} alt="" />
          </div>

          <div className={cls.cards}>
            {cards.map(({ title, text }) => (
              <article key={title} className={cls.card}>
                <h3 className={cls.cardTitle}>{title}</h3>
                <p className={cls.cardText}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { MultiTasks };
