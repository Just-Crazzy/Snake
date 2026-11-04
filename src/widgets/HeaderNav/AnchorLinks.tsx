import { useParams } from 'react-router-dom';

import { Link } from '@/shared/ui';

import cls from './HeaderNav.module.scss';

import type { Lang } from '@/shared/config/index';

type Anchor = { href: string; label: Record<Lang, string> };

const mainLink: Anchor = { href: '#', label: { en: 'Main', ru: 'Главная' } };

const anchors: Anchor[] = [
  { href: '#team', label: { en: 'Team', ru: 'Команда' } },
  { href: '#benefits', label: { en: 'Benefits', ru: 'Преимущества' } },
  { href: '#join', label: { en: 'Join Us', ru: 'Присоединяйтесь' } },
];

type AnchorLinksProps = {
  onNavigate?: () => void;
  withMain?: boolean;
};

const AnchorLinks = ({ onNavigate, withMain = false }: AnchorLinksProps) => {
  const { lang } = useParams<{ lang: Lang }>();
  const currentLang: Lang = lang ?? 'en';
  const items = withMain ? [mainLink, ...anchors] : anchors;

  return (
    <ul className={cls.anchors}>
      {items.map(({ href, label }) => (
        <li key={href}>
          <Link href={href} onClick={onNavigate}>
            {label[currentLang]}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export { AnchorLinks };
