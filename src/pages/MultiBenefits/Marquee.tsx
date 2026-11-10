import { useParams } from 'react-router-dom';

import { marqueeText } from '@/shared/config';

import Mask from '@public/icons/mask.svg?react';

import cls from './Marquee.module.scss';
import { useMarquee } from './useMarquee';

import type { Lang } from '@/shared/config';
import type { Ref } from 'react';

const REPEATS = 4;

const ITEMS = Array.from({ length: REPEATS }, (_, index) => index);

type MarqueeProps = {
  className?: string;
};

function Marquee({ className }: MarqueeProps) {
  const { lang = 'en' } = useParams<{ lang: Lang }>();
  const text = marqueeText[lang];
  const { trackRef, groupRef } = useMarquee(lang, text);

  const renderGroup = (ref?: Ref<HTMLDivElement>) => (
    <div ref={ref} className={cls.group}>
      {ITEMS.map((item) => (
        <span key={item} className={cls.item}>
          <span className={cls.text}>{text}</span>
          <Mask className={cls.icon} />
        </span>
      ))}
    </div>
  );

  return (
    <div className={[cls.marquee, className].filter(Boolean).join(' ')} aria-hidden="true">
      <div ref={trackRef} className={cls.track}>
        {renderGroup(groupRef)}
        {renderGroup()}
      </div>
    </div>
  );
}

export { Marquee };
