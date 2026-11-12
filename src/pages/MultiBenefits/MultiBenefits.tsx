import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useContent } from '@/shared/api';
import { useMultibenefitsAnimation } from '@/shared/lib';
import { Marquee } from '@/shared/ui';

import cls from './MultiBenefits.module.scss';

function renderTitle(title: string) {
  return title.split('*').map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className={cls.accent}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

function MultiBenefits() {
  const { t } = useTranslation();
  const { data, loading, error } = useContent('benefits');
  const sectionRef = useRef<HTMLElement>(null);

  useMultibenefitsAnimation(sectionRef, Boolean(data));

  if (loading) return null;
  if (error || !data) return <p>{t('common.loadError')}</p>;

  return (
    <section ref={sectionRef} id="benefits" className={cls.page}>
      <div className={cls.container}>
        <h2 className={cls.label} data-mb="label">
          Multi-benefits
        </h2>

        <div className={cls.container__content} data-mb="snake">
          <div className={cls.content}>
            <h3 className={cls.title} data-mb="title">
              {renderTitle(data.title)}
            </h3>
            <p className={cls.description} data-mb="text">
              {data.description}
            </p>
          </div>

          <div className={cls.cards}>
            {data.benefits.map((text) => (
              <article key={text} className={cls.card} data-mb="card">
                {text}
              </article>
            ))}
          </div>
        </div>
      </div>

      <Marquee className={cls.line} />
    </section>
  );
}

export { MultiBenefits };
