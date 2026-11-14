import Instagram from '@public/icons/instagram.svg?react';
import Linkedin from '@public/icons/linkedin.svg?react';
import Telegram from '@public/icons/telegram.svg?react';

import cls from './Socials.module.scss';

import type { ComponentProps } from 'react';

const socials = [
  { href: '#', label: 'Instagram', Icon: Instagram },
  { href: '#', label: 'Telegram', Icon: Telegram },
  { href: '#', label: 'LinkedIn', Icon: Linkedin },
];

const Socials = ({ className, ...rest }: ComponentProps<'ul'>) => (
  <ul className={[cls.socials, className].filter(Boolean).join(' ')} {...rest}>
    {socials.map(({ href, label, Icon }) => (
      <li key={label}>
        <a href={href} aria-label={label} target="_blank" rel="noreferrer">
          <Icon />
        </a>
      </li>
    ))}
  </ul>
);

export { Socials };
