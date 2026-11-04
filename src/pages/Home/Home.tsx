import { Hero, MultiBenefits, MultiplyWithUs, MultiTasks } from '@/pages/index';

import { ApplicationModal } from '@/widgets/ApplicationModal';

import { Logo } from '@/shared/ui';

import { Header, HeaderNav } from '@/widgets';

import { Background } from '@/widgets';

import cls from './Home.module.scss';

function Home() {
  return (
    <>
      <div className={cls.header}>
        <Header left={<Logo />} right={<HeaderNav />} />
      </div>

      <Background />
      <Hero />
      <MultiTasks />
      <MultiBenefits />
      <MultiplyWithUs />
      <ApplicationModal />
    </>
  );
}

export { Home };
