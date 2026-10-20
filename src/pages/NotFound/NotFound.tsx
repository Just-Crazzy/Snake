import { Link } from '@/shared/ui/index';
import Logo from '@public/icons/mask.svg?react';
import snake from '@public/img/snake-hero.png';

import styles from './NotFound.module.scss';

function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.logoLink} aria-label="Home">
            <Logo className={styles.logo} />
          </Link>
            <Link href="/menu" className={styles.menu}>
              Menu
            </Link>
        </header>

        <main className={styles.main}>
          <div className={styles.digits}>
            <div>4</div>
            <div>0</div>
            <div>4</div>
          </div>

          <Link href="/" className={styles.button}>
            Take me back
          </Link>
        </main>
      </div>

      <img className={styles.snake} src={snake} alt="" />
    </div>
  );
}

export { NotFound };
