import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';

const typeLabels = {
  movie: 'Filme',
  series: 'Série',
  episode: 'Episódio',
  game: 'Jogo',
};

function MovieSearchResult({ movie }) {
  const { Title: title, Year: year, Poster: poster, Type: type } = movie;
  const [failedPoster, setFailedPoster] = useState(null);
  const posterUrl = poster?.trim();
  const hasPoster = posterUrl && posterUrl !== 'N/A' && posterUrl !== failedPoster;
  const typeLabel = type && type !== 'N/A' ? (typeLabels[type] ?? type) : null;

  return (
    <article className="search-movie">
      <div className="search-movie-poster">
        {hasPoster ? (
          <img src={posterUrl} alt="" onError={() => setFailedPoster(posterUrl)} />
        ) : (
          <span>Pôster indisponível</span>
        )}
      </div>
      <div className="search-movie-details">
        <h3>{title}</h3>
        <div className="search-movie-meta">
          <span>{year}</span>
          {typeLabel && <span className="search-movie-type">{typeLabel}</span>}
        </div>
      </div>
    </article>
  );
}

export default function MovieTe() {
  const [movies, setMovies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(''); 
  const [error, setError] = useState(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) return;
    const controller = new AbortController();

    const fetchMovies = async () => {
      if (!navigator.onLine || controller.signal.aborted) return;
      setLoading(true);
      setError(null);
      setMovies(null);
      try {
        const params = new URLSearchParams({ query });
        const response = await fetch(`/api/movies/search?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Erro ao buscar filmes. Tente novamente.');
        }
        const data = await response.json();
        if (controller.signal.aborted) return;
        
        if (data.Response === 'True') {
          setMovies(data.Search);
        } else if (data.Error === 'Movie not found!') {
          setMovies([]);
        } else {
          throw new Error('Erro ao buscar filmes. Tente novamente.');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setMovies(null);
        setError('Erro ao buscar filmes. Tente novamente.');
        console.error("Erro ao buscar filmes:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    // Debounce: espera 800ms 
    const delayDebounceFn = setTimeout(() => {
      if (query.trim() !== '') {
        fetchMovies();
      } else {
        setMovies(null);
      }
    }, 800);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [query, isOnline]);

  return (
    <div className="card">
      <h2 id="movie-search-heading">Busca de Filmes</h2>
      <label htmlFor="movie-search">Digite o nome do filme abaixo</label>
      
      {/* Campo de input  */}
      <input
        id="movie-search"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setMovies(null);
          setError(null);
          setLoading(false);
        }}
        placeholder="Buscar filme..."
      />

      {/* Mostra Carregando, a Lista de Filmes ou "Nenhum filme" */}
      {!isOnline ? (
        <p role="status">Você está offline. Conecte-se à internet para pesquisar filmes.</p>
      ) : loading ? (
        <p>Carregando filmes...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : movies?.length > 0 ? (
        <ul className="movie-search-results">
          {movies.map((movie) => (
            <li key={movie.imdbID}>
              <MovieSearchResult movie={movie} />
            </li>
          ))}
        </ul>
      ) : movies?.length === 0 ? (
        <p>Nenhum filme encontrado.</p>
      ) : null}
    </div>
  );
}
