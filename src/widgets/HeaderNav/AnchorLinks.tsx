import { useTranslation } from 'react-i18next';

import { Link } from '@/shared/ui';

import cls from './HeaderNav.module.scss';

type Anchor = { href: string; labelKey: string };

const mainLink: Anchor = { href: '#', labelKey: 'nav.main' };

const anchors: Anchor[] = [
  { href: '#team', labelKey: 'nav.team' },
  { href: '#benefits', labelKey: 'nav.benefits' },
  { href: '#join', labelKey: 'nav.join' },
];

type AnchorLinksProps = {
  onNavigate?: () => void;
  withMain?: boolean;
};

const AnchorLinks = ({ onNavigate, withMain = false }: AnchorLinksProps) => {
  const { t } = useTranslation();
  const items = withMain ? [mainLink, ...anchors] : anchors;

  return (
    <ul className={cls.anchors}>
      {items.map(({ href, labelKey }) => (
        <li key={href}>
          <Link href={href} onClick={onNavigate}>
            {t(labelKey)}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export { AnchorLinks };
