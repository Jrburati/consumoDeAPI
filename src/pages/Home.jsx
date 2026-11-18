import NavigateButton from '../components/NavigateButton.jsx';
import brtPlayIcon from '../assets/brt-play-icon.svg';
import './Home.css';

const sections = [
  {
    path: '/pokemon',
    category: 'pokemon',
    title: 'Pokémon',
    description: 'Conheça os Pokémon e descubra seus tipos.',
  },
  {
    path: '/filmes',
    category: 'filmes',
    title: 'Filmes',
    description: 'Veja os favoritos e busque outros títulos.',
  },
  {
    path: '/dragonball',
    category: 'dragonball',
    title: 'Dragon Ball',
    description: 'Explore os personagens e compare seus níveis de ki.',
  },
];

export default function Home() {
  return (
    <main className="page home-page">
      <header className="home-brand">
        <img src={brtPlayIcon} width="96" height="96" alt="" />
        <h1>BRT Play</h1>
      </header>
      <nav className="home-catalog" aria-label="Seções do BRT Play">
        {sections.map(({ path, category, title, description }) => (
          <NavigateButton key={path} path={path}>
            <span className="home-card-visual" data-category={category} aria-hidden="true">
              <span className="home-card-icon" />
            </span>
            <span className="home-card-content">
              <span className="home-card-title">{title}</span>
              <span className="home-card-arrow" aria-hidden="true">→</span>
              <span className="home-card-description">{description}</span>
            </span>
          </NavigateButton>
        ))}
      </nav>
    </main>
  );
}
