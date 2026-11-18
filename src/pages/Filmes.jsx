import NavigateButton from '../components/NavigateButton.jsx';
import FavoriteMovie from '../components/FavoriteMovie.jsx';
import ListMovie from '../components/ListMovie.jsx';
import { useFilme } from '../hooks/useFilme.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';
import './Catalog.css';
import './Filmes.css';

function FavoritesGallery() {
  const favorites = useFilme();

  if (!favorites) {
    return <p role="status">Carregando filmes favoritos…</p>;
  }

  const { movies, unavailableCount } = favorites;

  if (!movies.length) {
    return <p role="status">Não foi possível carregar os filmes favoritos.</p>;
  }

  return (
    <>
      {unavailableCount > 0 && (
        <p className="favorites-status" role="status">Alguns filmes favoritos não puderam ser carregados.</p>
      )}
      <ul className="favorites-gallery">
        {movies.map((movie) => (
          <li key={movie.Title}><FavoriteMovie movie={movie} /></li>
        ))}
      </ul>
    </>
  );
}

export default function Filmes() {
  const isOnline = useOnlineStatus();

  return (
    <main className="page catalog-page filmes-page">
      <header className="catalog-header filmes-header">
        <div>
          <h1>Filmes</h1>
          <p>Explore os favoritos e encontre outros títulos na busca.</p>
        </div>
        <NavigateButton path="/">Voltar para Home</NavigateButton>
      </header>
      <section className="catalog-search filmes-search" aria-labelledby="movie-search-heading">
        <ListMovie />
      </section>
      <section aria-labelledby="favorites-heading">
        <h2 id="favorites-heading">Meus Favoritos</h2>
        {isOnline && <FavoritesGallery />}
      </section>
    </main>
  );
}
