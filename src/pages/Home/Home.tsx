import { useParams } from 'react-router-dom';

function Home() {
  return <Section1 />;
  return <Section1 />;
  const { lang } = useParams();

  return <h1>Язык: {lang}</h1>;
}

export { Home };
