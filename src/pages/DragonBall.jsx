import NavigateButton from '../components/NavigateButton.jsx';
import DragonBallCharacter from '../components/DragonBallCharacter.jsx';
import Profile from '../components/Profile.jsx';
import Counter from '../components/Counter.jsx';
import { useDragonBall } from '../hooks/useDragonBall.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';
import './DragonBall.css';

function DragonBallGallery() {
  const results = useDragonBall();

  if (!results) {
    return <p role="status">Carregando personagens…</p>;
  }

  const { characters, unavailableCount } = results;

  if (!characters.length) {
    return <p role="status">Não foi possível carregar os personagens.</p>;
  }

  return (
    <>
      {unavailableCount > 0 && (
        <p className="dragonball-gallery-status" role="status">Alguns personagens não puderam ser carregados.</p>
      )}
      <ul className="dragonball-gallery">
        {characters.map((character) => (
          <li key={character.id}><DragonBallCharacter character={character} /></li>
        ))}
      </ul>
    </>
  );
}

export default function DragonBall() {
  const isOnline = useOnlineStatus();

  return (
    <main className="page dragonball-page">
      <header className="dragonball-header">
        <h1 id="dragonball-heading">Personagens Dragon Ball</h1>
        <NavigateButton path="/">Voltar para Home</NavigateButton>
      </header>
      <section aria-labelledby="dragonball-heading">
        {isOnline && <DragonBallGallery />}
      </section>
      <section className="dragonball-profile" aria-label="Perfil e contador">
        <Profile />
        <Counter />
      </section>
    </main>
  );
}
