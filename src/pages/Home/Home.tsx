import { useParams } from 'react-router-dom';

function Home() {
  const { lang } = useParams();

  return <h1>Язык: {lang}</h1>;
}

export { Home };
