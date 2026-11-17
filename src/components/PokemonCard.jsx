import { usePokemon } from '../hooks/usePokemon.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';

export default function PokemonCard() {
  const { poke, loading: loadingPoke, error: errorPoke } = usePokemon();
  const isOnline = useOnlineStatus();

  return (
    <>
      {loadingPoke ? (
        isOnline && <p>Loading...</p>
      ) : errorPoke ? (
        isOnline && <p>Erro ao carregar o Pokémon.</p>
      ) : (
        <>
          <h2>{poke?.species?.name}</h2>
          <img
            src={poke?.sprites?.front_shiny}
            className="base"
            width="170"
            height="179"
            alt=""
          />
          <p>Meu Pet</p>
        </>
      )}
    </>
  );
}
