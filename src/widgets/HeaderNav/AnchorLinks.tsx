import { Link } from '@/shared/ui';

import cls from './HeaderNav.module.scss';

const anchors = [
  { id: 'team', label: 'Team' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'joinUs', label: 'Join Us' },
];

type AnchorLinksProps = {
  onNavigate?: () => void;
};

const AnchorLinks = ({ onNavigate }: AnchorLinksProps) => (
  <ul className={cls.anchors}>
    {anchors.map(({ id, label }) => (
      <li key={id}>
        <Link href={`#${id}`} onClick={onNavigate}>
          {label}
        </Link>
      </li>
    ))}
  </ul>
);

export { AnchorLinks };
