import NavigateButton from '../components/NavigateButton.jsx';
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
        <div className="home-brand-copy">
          <h1>BRT <span>Play</span></h1>
          <p>Explore seus universos.</p>
        </div>
        <div className="home-brand-art">
          <img src="/brt-play-logo-cyberpunk.png" width="1254" height="1254" alt="" />
        </div>
      </header>
      <nav className="home-catalog" aria-label="Seções do BRT Play">
        {sections.map(({ path, category, title, description }) => (
          <NavigateButton key={path} path={path}>
            <span className="home-card-visual" data-category={category} aria-hidden="true">
              <span className="home-card-icon" />
            </span>
            <span className="home-card-content">
              <span className="home-card-title">{title}</span>
              <span className="home-card-description">{description}</span>
              <span className="home-card-action" aria-hidden="true">Acessar <span>→</span></span>
            </span>
          </NavigateButton>
        ))}
      </nav>
    </main>
  );
}
