import { useState } from 'react';

import { Button, Logo } from '@/shared/ui';

import { Footer, Header, HeaderNav } from '@/widgets';

import Arrow from '@public/icons/scroll-to-top.svg?react';

import cls from './MultiplyWithUs.module.scss';

const tabs = [
  {
    label: 'For Media Buyers',
    question:
      'Got experience with sweepstakes and large ad budgets? Looking for a team where you can grow and scale without limits?',
    answer: 'Multiply your profits with MULTICPA — we provide the budget, all the tools and high profit shares',
  },
  {
    label: 'For Businesses',
    question: 'TODO: текст от дизайнера',
    answer: 'TODO: текст от дизайнера',
  },
  {
    label: 'For Partners',
    question: 'TODO: текст от дизайнера',
    answer: 'TODO: текст от дизайнера',
  },
];

function MultiplyWithUs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = tabs[activeIndex];

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
              <h2 className={cls.label}>Multiply with us</h2>
              <div className={cls.menu}>
                <HeaderNav />
              </div>
            </>
          }
        />

        <div className={cls.container__content}>
          <div className={cls.tabs} role="tablist">
            {tabs.map((tab, index) => {
              const isActive = index === activeIndex;
              const tabClassName = isActive ? `${cls.tab} ${cls.tabActive}` : cls.tab;

              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={tabClassName}
                  onClick={() => setActiveIndex(index)}
                >
                  {tab.label}
                  <Arrow className={cls.tabArrow} />
                </button>
              );
            })}
          </div>

          <div className={cls.right}>
            <div className={cls.panel} role="tabpanel">
              <p className={cls.text}>{activeTab.question}</p>
              <Arrow className={cls.arrowDown} />
              <p className={cls.text}>{activeTab.answer}</p>
              <Arrow className={cls.arrowDown} />
              <Button href="#joinUs" className={cls.button}>
                Join the team
              </Button>
            </div>

            <div className={cls.footer}>
              <Footer />
            </div>
          </div>
        </div>

        <p className={cls.bottomLabel} aria-hidden="true">
          Multiply with us
        </p>
      </div>
    </section>
  );
}

export { MultiplyWithUs };
