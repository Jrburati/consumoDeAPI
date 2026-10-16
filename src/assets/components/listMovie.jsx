import { useState, useEffect } from 'react';

export default function MovieTe() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(''); 

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        // Chave da API 
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=59ab1eb9`);
        const data = await response.json();
        
        if (data.Response === 'True') {
          setMovies(data.Search);
        } else {
          setMovies([]); 
        }
      } catch (error) {
        console.error("Erro ao buscar filmes:", error);
      } finally {
        setLoading(false);
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

    return () => clearTimeout(delayDebounceFn);
  }, [query]); 

  return (
    <div className="card">
      <h2>Busca de Filmes </h2>
      <p>Digite o nome do filme abaixo:</p>
      
      {/* Campo de input  */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar filme..."
        style={{ padding: '10px', width: '100%', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      {/* Mostra Carregando, a Lista de Filmes ou "Nenhum filme" */}
      {loading ? (
        <p>Carregando filmes...</p>
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