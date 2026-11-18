import NavigateButton from '../components/NavigateButton.jsx';
import PokemonCard from '../components/PokemonCard.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';
import { usePokemon } from '../hooks/usePokemon.jsx';
import './Pokemon.css';

function PokemonGallery() {
  const {
    catalogError, catalogLoading, entries, detailsLoading, query, changeQuery,
    searching, total, hasMore, loadMore,
  } = usePokemon();
  const loading = catalogLoading || detailsLoading;

  return (
    <>
      <div className="pokemon-search">
        <label htmlFor="pokemon-search">Buscar Pokémon por nome</label>
        <input
          id="pokemon-search"
          type="search"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          placeholder="Ex.: Pikachu"
        />
      </div>
      {catalogError && (
        <p role="status">Não foi possível carregar o catálogo de Pokémon.</p>
      )}
      {!catalogError && !loading && total === 0 && (
        <p role="status">{searching ? 'Nenhum Pokémon encontrado.' : 'O catálogo está vazio.'}</p>
      )}
      {entries.length > 0 && (
        <>
          <p className="pokemon-catalog-count">{entries.length} de {total} Pokémon</p>
          <ul className="pokemon-gallery" aria-label="Galeria de Pokémon">
            {entries.map(({ name, pokemon }) => (
              <li key={name}><PokemonCard name={name} pokemon={pokemon} /></li>
            ))}
          </ul>
        </>
      )}
      {loading && <p className="pokemon-gallery-status" role="status">Carregando Pokémon…</p>}
      {hasMore && (
        <button className="pokemon-load-more" type="button" onClick={loadMore} disabled={loading}>
          Carregar mais
        </button>
      )}
    </>
  );
}

export default function Pokemon() {
  const isOnline = useOnlineStatus();

  return (
    <main className="page pokemon-page">
      <header className="pokemon-page-header">
        <h1>Pokémon</h1>
        <NavigateButton path="/">Voltar para Home</NavigateButton>
      </header>
      {isOnline && <PokemonGallery />}
    </main>
  );
}
