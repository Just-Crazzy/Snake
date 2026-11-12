import { useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useContent } from '@/shared/api';
import { useMultiplyAnimation } from '@/shared/lib';
import { Button } from '@/shared/ui';

import { Footer } from '@/widgets';

import Arrow from '@public/icons/scroll-to-top.svg?react';

import cls from './MultiplyWithUs.module.scss';

import type { ContentMap } from '@/shared/api';
import type { Ref } from 'react';

type MultiplyWithUsContentProps = {
  ref: Ref<HTMLElement>;
  items: ContentMap['multiply'];
};

function MultiplyWithUsContent({ ref, items }: MultiplyWithUsContentProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = items[activeIndex] ?? items[0];

  return (
    <section ref={ref} id="join" className={cls.page}>
      <div className={cls.container}>
        <h2 className={cls.label} data-mw="title">
          Multiply with us
        </h2>

        <div className={cls.container__content}>
          <div className={cls.tabs} role="tablist">
            {items.map((tab, index) => {
              const isActive = index === activeIndex;
              const tabClassName = isActive ? `${cls.tab} ${cls.tabActive}` : cls.tab;

              return (
                <button
                  key={tab.title}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={tabClassName}
                  data-mw="tab"
                  onClick={() => setActiveIndex(index)}
                >
                  {tab.title}
                  <Arrow className={cls.tabArrow} />
                </button>
              );
            })}
          </div>

          <div className={cls.right}>
            <div className={cls.panel} role="tabpanel" data-mw="card">
              <p className={cls.text}>{activeTab.steps.step_1}</p>
              <Arrow className={cls.arrowDown} />
              <p className={cls.text}>{activeTab.steps.step_2}</p>
              <Arrow className={cls.arrowDown} />
              <Button href="#joinUs" variant="block" className={cls.button}>
                {t(`multiply.buttons.${activeIndex}`)}
              </Button>
            </div>

            <div className={cls.footer} data-mw="footer">
              <Footer />
            </div>
          </div>
        </div>

        <p className={cls.bottomLabel} aria-hidden="true" data-mw="title">
          Multiply with us
        </p>
      </div>
    </section>
  );
}

function MultiplyWithUs() {
  const { t } = useTranslation();
  const { data, loading, error } = useContent('multiply');
  const sectionRef = useRef<HTMLElement>(null);

  useMultiplyAnimation(sectionRef, Boolean(data));

  if (loading) return null;
  if (error || !data?.length) return <p>{t('common.loadError')}</p>;

  return <MultiplyWithUsContent ref={sectionRef} items={data} />;
}

export { MultiplyWithUs };
