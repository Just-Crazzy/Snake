import cls from './Background.module.scss';

const BackgroundGlow = () => {
  return (
    <div className={`${cls.absolute} ${cls['inset-0']}`}>
      <div>
        <div
          className={`${cls.absolute} ${cls['w-150']} ${cls['h-150']} ${cls['-right-37-5']} ${cls['-top-25']} ${cls['rounded-full']}`}
          style={{
            background: '#14091A',
            filter: 'blur(8.75rem)',
            opacity: 0.4,
          }}
        />

        <div
          className={`${cls.absolute} ${cls['w-200']} ${cls['h-200']} ${cls['-left-75']} ${cls['top-25']} ${cls['rounded-full']}`}
          style={{
            background: '#14091A',
            filter: 'blur(10rem)',
            opacity: 0.3,
          }}
        />
      </div>
    </div>
  );
};

export default BackgroundGlow;
