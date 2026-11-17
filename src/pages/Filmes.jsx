import NavigateButton from '../components/NavigateButton.jsx';
import FavoriteMovie from '../components/FavoriteMovie.jsx';
import MovieTe from '../components/ListMovie.jsx';

export default function Filmes() {
  return (
    <main className="page">
      <h1>Filmes</h1>
      <section id="next-steps">
        <div id="social"><FavoriteMovie /></div>
      </section>
      <div className="ticks"></div>
      <section style={{ padding: '20px', borderTop: '2px solid #ccc', marginTop: '20px' }}>
        <MovieTe />
      </section>
      <NavigateButton path="/">Voltar para Home</NavigateButton>
      <section id="spacer"></section>
    </main>
  );
}
