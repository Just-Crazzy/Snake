import { useParams } from 'react-router-dom';

import { LANGUAGES } from '@/shared/config';
import { Link } from '@/shared/ui';

import cls from './HeaderNav.module.scss';

import type { Lang } from '@/shared/config';

const langLabels: Record<Lang, string> = {
  ru: 'РУС',
  en: 'ENG',
};

const LangSwitcher = () => {
  const { lang } = useParams();

  return (
    <ul className={cls.langs}>
      {LANGUAGES.map((code, i) => (
        <li key={code}>
          {i > 0 && <span>/</span>}

          <Link href={`/${code}`} className={(code === lang && cls.active) || undefined}>
            {langLabels[code]}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export { LangSwitcher };
