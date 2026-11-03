import { Hero, MultiBenefits, MultiplyWithUs, MultiTasks } from '@/pages/index';

import { ApplicationModal } from '@/widgets/ApplicationModal';

function Home() {
  return (
    <>
      <Hero />
      <MultiTasks />
      <MultiBenefits />
      <MultiplyWithUs />
      <ApplicationModal />
    </>
  );
}

export { Home };
