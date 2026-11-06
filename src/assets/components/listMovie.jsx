import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.jsx';

export default function MovieTe() {
  const [movies, setMovies] = useState([]);
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
      setMovies([]);
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
        setMovies([]);
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
        setMovies([]); 
      }
    }, 800);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [query, isOnline]);

  return (
    <div className="card">
      <h2>Busca de Filmes </h2>
      <p>Digite o nome do filme abaixo:</p>
      
      {/* Campo de input  */}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setMovies([]);
          setError(null);
          setLoading(false);
        }}
        placeholder="Buscar filme..."
        style={{ padding: '10px', width: '100%', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      {/* Mostra Carregando, a Lista de Filmes ou "Nenhum filme" */}
      {!isOnline ? (
        <p role="status">Você está offline. Conecte-se à internet para pesquisar filmes.</p>
      ) : loading ? (
        <p>Carregando filmes...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : movies.length > 0 ? (
        <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0 }}>
          {movies.map((movie) => (
            <li key={movie.imdbID} style={{ marginBottom: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>{movie.Title}</strong> ({movie.Year})
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum filme encontrado.</p>
      )}
    </div>
  );
}
