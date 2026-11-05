import { useTranslation } from 'react-i18next';

import { useContent } from '@/shared/api';

import snake from '@public/img/snake-gem.png';

import cls from './MultiTasks.module.scss';

function MultiTasks() {
  const { t } = useTranslation();
  const { data, loading, error } = useContent('tasks');

  if (loading) return null;
  if (error || !data) return <p>{t('common.loadError')}</p>;

  return (
    <section id="team" className={cls.page}>
      <div className={cls.container}>
        <h2 className={cls.title}>Multi-tasks</h2>

        <div className={cls.grid}>
          <div className={cls.intro}>
            <p className={cls.introText}>{data.description}</p>
            <img className={cls.snake} src={snake} alt="" />
          </div>

          <div className={cls.cards}>
            {data.tiles.map(({ title, text }) => (
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
