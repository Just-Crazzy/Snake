import { useParams } from 'react-router-dom';

import { Link } from '@/shared/ui';

import cls from './HeaderNav.module.scss';

import type { Lang } from '@/shared/config/index';

const anchors: { id: string; label: Record<Lang, string> }[] = [
  { id: 'team', label: { en: 'Team', ru: 'Команда' } },
  { id: 'benefits', label: { en: 'Benefits', ru: 'Преимущества' } },
  { id: 'joinUs', label: { en: 'Join Us', ru: 'Присоединяйтесь' } },
];
type AnchorLinksProps = {
  onNavigate?: () => void;
};

const AnchorLinks = ({ onNavigate }: AnchorLinksProps) => {
  const { lang } = useParams<{ lang: Lang }>();
  const currentLang: Lang = lang ?? 'en';
  return (
    <ul className={cls.anchors}>
      {anchors.map(({ id, label }) => (
        <li key={id}>
          <Link href={`#${id}`} onClick={onNavigate}>
            {label[currentLang]}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export { AnchorLinks };
