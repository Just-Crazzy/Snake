import cls from './Background.module.scss';

const BackgroundBase = () => {
  return (
    <div
      className={`${cls.absolute} ${cls['inset-0']}`}
      style={{
        background: 'linear-gradient(111deg, #DC8400 -5%, #560080 50%, #220032 95%)',
      }}
    />
  );
};

export default BackgroundBase;
