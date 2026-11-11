import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { removePreloaderShell } from '@/shared/lib';
import { Link, Logo } from '@/shared/ui';

import { Header } from '@/widgets';

import snake from '@public/img/snake-hero.png';

import cls from './NotFound.module.scss';

function NotFound() {
  const { t } = useTranslation();

  useEffect(() => {
    removePreloaderShell();
  }, []);

  return (
    <div className={cls.page}>
      <div className={cls.container}>
        <Header
          left={<Logo />}
          right={
            <Link href="#" className={cls.menu}>
              {t('nav.menu')}
            </Link>
          }
        />

        <main className={cls.main}>
          <div className={cls.digits}>
            <div>4</div>
            <div>0</div>
            <div>4</div>
          </div>

          <Link href="/" className={cls.button}>
            <Trans
              i18nKey="notFound.back"
              components={{ oops: <span className={cls.oops} /> }}
            />
          </Link>
        </main>
      </div>

      <img className={cls.snake} src={snake} alt="" />
    </div>
  );
}

export { NotFound };
