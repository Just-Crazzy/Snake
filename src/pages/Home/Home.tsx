import { useState } from 'react';

import cls from './Home.module.scss';

function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <section className={cls.center}>
        <h1>Счетчик чекните</h1>
        <button type="button" className={cls.counter} onClick={() => setCount((count) => count + 1)}>
          Ткнули {count}
        </button>
      </section>
    </>
  );
}

export { Home };
