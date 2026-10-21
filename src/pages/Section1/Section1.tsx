import { Link, Logo } from "@/shared/ui";
import { Header, HeaderNav } from "@/widgets";

import snake from "@public/img/snake-hero.png";
import Instagram from "@public/icons/instagram.svg?react";
import Telegram from "@public/icons/telegram.svg?react";
import Linkedin from "@public/icons/linkedin.svg?react"; // добавь файл иконки

import cls from "./Section1.module.scss";

const socials = [
  { href: "#", label: "Instagram", Icon: Instagram },
  { href: "#", label: "Telegram", Icon: Telegram },
  { href: "#", label: "LinkedIn", Icon: Linkedin },
];

function Section1() {
  return (
    <section className={cls.page}>
      <div className={cls.container}>
        <Header left={<Logo />} right={<HeaderNav />} />

        <div className={cls.content}>
          <h1 className={cls.title}>
            Practice <br />
            makes <span className={cls.accent}>profit</span>
          </h1>

          <p className={cls.text}>
            We provide effective solutions, tested and refined
            <br />
            on our own products and ad budgets
          </p>

          <Link href="#joinUs" className={cls.button}>
            Get in touch
          </Link>
        </div>

        <ul className={cls.socials}>
          {socials.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <img className={cls.snake} src={snake} alt="" />
    </section>
  );
}

export { Section1 };
