import cls from './Background.module.scss';
import BackgroundBase from './BackgroundBase';
import BackgroundGlow from './BackgroundGlow';
import GridMesh from './GridMesh';

const Background = () => {
  return (
    <div
      className={`${cls.fixed} ${cls['-inset-3']} ${cls['overflow-hidden']} ${cls['-z-1']}`}
    >
      <BackgroundBase />
      <BackgroundGlow />
      <GridMesh />
    </div>
  );
};

export { Background };
