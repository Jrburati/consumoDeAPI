import { useFilme } from '../hooks/useFilme.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';

export default function FavoriteMovie() {
  const { filme, loading: loadingFilme, error: errorFilme } = useFilme();
  const isOnline = useOnlineStatus();

  return (
    <>
      {loadingFilme ? (
        isOnline && <p>Loading...</p>
      ) : errorFilme ? (
        isOnline && <p>Erro ao carregar o filme favorito.</p>
      ) : (
        <>
          <h2>Meu filme favorito é: {filme?.Title}</h2>
          <img
            src={filme?.Poster}
            className="base"
            width="170"
            height="179"
            alt=""
          />
          <p>Nota do IMDB: {filme?.imdbRating}</p>
        </>
      )}
    </>
  );
}
