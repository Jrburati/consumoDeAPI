import NavigateButton from '../components/NavigateButton.jsx';
import brtPlayIcon from '../assets/brt-play-icon.svg';

export default function Home() {
  return (
    <main id="center" className="page">
      <img src={brtPlayIcon} width="170" height="170" alt="BRT Play" />
      <h1>BRT Play</h1>
      <nav className="page-navigation" aria-label="Seções do BRT Play">
        <NavigateButton path="/dragonball">Dragon Ball</NavigateButton>
        <NavigateButton path="/pokemon">Pokémon</NavigateButton>
        <NavigateButton path="/filmes">Filmes</NavigateButton>
      </nav>
    </main>
  );
}
