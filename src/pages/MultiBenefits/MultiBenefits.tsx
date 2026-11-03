import { useContent } from '@/shared/api';
import { Logo } from '@/shared/ui';

import { Header, HeaderNav } from '@/widgets';

import line from '@public/img/line.png';

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
  const { data, loading, error } = useContent('benefits');

  if (loading) return null;
  if (error || !data) return <p>Не удалось загрузить данные</p>;

  return (
    <section id="benefits" className={cls.page}>
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
