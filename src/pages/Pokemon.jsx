import NavigateButton from '../components/NavigateButton.jsx';
import PokemonCard from '../components/PokemonCard.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';
import { usePokemon } from '../hooks/usePokemon.jsx';
import './Pokemon.css';

function PokemonGallery() {
  const results = usePokemon();

  if (!results) {
    return <p className="pokemon-gallery-status" role="status">Carregando a galeria de Pokémon…</p>;
  }

  const { pokemon, unavailableCount } = results;

  if (!pokemon.length) {
    return <p className="pokemon-gallery-status" role="status">Não foi possível carregar a galeria de Pokémon.</p>;
  }

  return (
    <>
      {unavailableCount > 0 && (
        <p className="pokemon-gallery-status" role="status">Alguns Pokémon não puderam ser carregados.</p>
      )}
      <ul className="pokemon-gallery" aria-label="Galeria de Pokémon">
        {pokemon.map((entry) => (
          <li key={entry.name}><PokemonCard pokemon={entry} /></li>
        ))}
      </ul>
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
