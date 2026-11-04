import { useState } from 'react';

import { useParams } from 'react-router-dom';

import { useContent } from '@/shared/api';
import { Button } from '@/shared/ui';

import { Footer } from '@/widgets';

import Arrow from '@public/icons/scroll-to-top.svg?react';

import cls from './MultiplyWithUs.module.scss';

import type { ContentMap } from '@/shared/api';
import type { Lang } from '@/shared/config';

const tabLabels: Record<string, Record<Lang, string>> = {
  for_media_buyers: { en: 'For Media Buyers', ru: 'Медиабайерам' },
  for_businesses: { en: 'For Businesses', ru: 'Бизнесу' },
  for_partners: { en: 'For Partners', ru: 'Партнёрам' },
};

const getTabLabel = (key: string, lang: Lang) => tabLabels[key]?.[lang] ?? key;

type MultiplyWithUsContentProps = {
  items: ContentMap['multiply'];
};

function MultiplyWithUsContent({ items }: MultiplyWithUsContentProps) {
  const { lang = 'en' } = useParams<{ lang: Lang }>();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = items[activeIndex] ?? items[0];

  return (
    <section id="join" className={cls.page}>
      <div className={cls.container}>
        <h2 className={cls.label}>Multiply with us</h2>

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
                  onClick={() => setActiveIndex(index)}
                >
                  {getTabLabel(tab.title, lang)}
                  <Arrow className={cls.tabArrow} />
                </button>
              );
            })}
          </div>

          <div className={cls.right}>
            <div className={cls.panel} role="tabpanel">
              <p className={cls.text}>{activeTab.steps.step_1}</p>
              <Arrow className={cls.arrowDown} />
              <p className={cls.text}>{activeTab.steps.step_2}</p>
              <Arrow className={cls.arrowDown} />
              <Button href="#joinUs" variant="block" className={cls.button}>
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

function MultiplyWithUs() {
  const { data, loading, error } = useContent('multiply');

  if (loading) return null;
  if (error || !data?.length) return <p>Не удалось загрузить данные</p>;

  return <MultiplyWithUsContent items={data} />;
}

export { MultiplyWithUs };
