import { Link, Logo } from '@/shared/ui';

import { Header } from "@/widgets";

import snake from "@public/img/snake-hero.png";

import cls from "./NotFound.module.scss";

function NotFound() {
  return (
    <div className={cls.page}>
      <div className={cls.container}>
        <Header
          left={<Logo />}
          right={
            <Link href="#" className={cls.menu}>
              Menu
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
            <span className={cls.oops}>Oops, </span>take me back
          </Link>
        </main>
      </div>

      <img className={cls.snake} src={snake} alt="" />
    </div>
  );
}

export { NotFound };
