import NavigateButton from '../components/NavigateButton.jsx';
import DragonBallCharacter from '../components/DragonBallCharacter.jsx';
import Profile from '../components/Profile.jsx';
import Counter from '../components/Counter.jsx';
import { useDragonBall } from '../hooks/useDragonBall.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';
import './DragonBall.css';

function DragonBallGallery() {
  const {
    characters, total, error, loading, query, changeQuery, searching, hasMore, loadMore,
  } = useDragonBall();

  return (
    <>
      <div className="dragonball-search">
        <label htmlFor="dragonball-search">Buscar personagem por nome</label>
        <input
          id="dragonball-search"
          type="search"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
        />
      </div>
      {loading && <p role="status">Carregando personagens…</p>}
      {error && <p role="status">Não foi possível carregar os personagens.</p>}
      {!loading && !error && total === 0 && (
        <p role="status">{searching ? 'Nenhum personagem encontrado.' : 'O catálogo está vazio.'}</p>
      )}
      {characters.length > 0 && (
        <>
          <p className="dragonball-catalog-count">{characters.length} de {total} personagens</p>
          <ul className="dragonball-gallery">
            {characters.map((character, index) => (
              <li key={character.id ?? `entry-${index}`}>
                <DragonBallCharacter character={character} />
              </li>
            ))}
          </ul>
        </>
      )}
      {hasMore && (
        <button className="dragonball-load-more" type="button" onClick={loadMore}>
          Carregar mais
        </button>
      )}
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
