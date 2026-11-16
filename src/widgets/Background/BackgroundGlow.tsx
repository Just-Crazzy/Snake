import cls from './Background.module.scss';

const BackgroundGlow = () => {
  return (
    <div className={`${cls.absolute} ${cls['inset-0']}`}>
      <div>
        <div className={`${cls.absolute} ${cls['glow-right']}`} />

        <div className={`${cls.absolute} ${cls['glow-left']}`} />
      </div>
    </div>
  );
};

export default BackgroundGlow;
