import { Logo } from '@/shared/ui';

import { Header, HeaderNav } from '@/widgets';

import line from '@public/img/line.png';

import cls from './MultiBenefits.module.scss';

const data = {
  title: 'Results can only be *guaranteed* when you control every step',
  description:
    'That’s why we built a full-time in-house team and custom infrastructure – tailored for every task, tested daily in the sweepstakes vertical',
  benefits: [
    'We take on outsourced projects across any niche — from iGaming and dating to e-commerce and recruitment',
    'We deliver what has already proven effective — many times over',
    'We don’t learn at the client’s expense',
  ],
};

function renderTitle(title: string) {
  const parts = title.split('*');

  return parts.map((part, index) => {
    const isHighlighted = index % 2 === 1;

    if (isHighlighted) {
      return (
        <span key={index} className={cls.accent}>
          {part}
        </span>
      );
    }

    return part;
  });
}

function MultiBenefits() {
  return (
    <section className={cls.page}>
      <div className={cls.container}>
        <Header
          left={
            <div className={cls.logo}>
              <Logo />
            </div>
          }
          right={
            <>
              <h2 className={cls.label}>Multi-benefits</h2>
              <div className={cls.menu}>
                <HeaderNav />
              </div>
            </>
          }
        />

        <div className={cls.container__content}>
          <div className={cls.content}>
            <h3 className={cls.title}>{renderTitle(data.title)}</h3>
            <p className={cls.description}>{data.description}</p>
          </div>

          <div className={cls.cards}>
            {data.benefits.map((text) => (
              <article key={text} className={cls.card}>
                {text}
              </article>
            ))}
          </div>
        </div>
      </div>

      <img className={cls.line} src={line} alt="" />
    </section>
  );
}

export { MultiBenefits };
