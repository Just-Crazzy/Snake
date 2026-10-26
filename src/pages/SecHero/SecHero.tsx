import { Link } from '@/shared/ui';

import Logo from '@public/icons/mask.svg?react';
import snake from '@public/img/snake-hero.png';

import styles from './Section1.module.scss';

function Section1() {
  return (
    <div className={styles.page}>
      <div className={`container ${styles.content}`}>
        <header className={styles.header}>
          <Link href="/" className={styles.logoLink} aria-label="Home">
            <Logo className={styles.logo} />
          </Link>

          <nav className={styles.nav} aria-label="Main">
            <ul className={styles.navList}>
              <li>
                <Link href="#team">Team</Link>
              </li>
              <li>
                <Link href="#benefits">Benefits</Link>
              </li>
              <li>
                <Link href="#join-us">Join us</Link>
              </li>
            </ul>

            <div className={styles.lang}>
              <Link href="/en" aria-current="true">
                ENG
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/ru">РУС</Link>
            </div>
          </nav>
        </header>

        <main className={styles.main}>
          <h1 className={styles.title}>
            Practice makes <span className={styles.accent}>profit</span>
          </h1>

          <p className={styles.text}>
            We provide effective solutions, tested and refined on our own products and ad budgets
          </p>

          <Link href="#contact" className={styles.button}>
            Get in touch
          </Link>
        </main>

        <footer className={styles.footer}>
          <ul className={styles.socials}>
            <li>
              <a href="#" aria-label="Instagram">
                …иконка…
              </a>
            </li>
            <li>
              <a href="#" aria-label="Telegram">
                …иконка…
              </a>
            </li>
            <li>
              <a href="#" aria-label="LinkedIn">
                …иконка…
              </a>
            </li>
          </ul>
        </footer>
      </div>

      <img className={styles.snake} src={snake} alt="" />
    </div>
  );
}

export { Section1 };
