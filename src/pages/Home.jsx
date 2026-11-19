import NavigateButton from '../components/NavigateButton.jsx';
import './Home.css';

const sections = [
  {
    path: '/pokemon',
    category: 'pokemon',
    icon: '/home-pokeball-hologram.png',
    title: 'Pokémon',
    description: 'Conheça os Pokémon e descubra seus tipos.',
  },
  {
    path: '/filmes',
    category: 'filmes',
    icon: '/home-movies-hologram.png',
    title: 'Filmes',
    description: 'Veja os favoritos e busque outros títulos.',
  },
  {
    path: '/dragonball',
    category: 'dragonball',
    icon: '/home-dragonball-hologram.png',
    title: 'Dragon Ball',
    description: 'Explore os personagens e compare seus níveis de ki.',
  },
];

function hideUnavailableArt(event) {
  event.currentTarget.style.visibility = 'hidden';
}

export default function Home() {
  return (
    <main className="page home-page">
      <header className="home-brand">
        <img
          className="home-hero-background"
          src="/home-hero-cyberpunk.png"
          width="2172"
          height="724"
          alt=""
          fetchPriority="high"
          onError={hideUnavailableArt}
        />
        <div className="home-brand-copy">
          <h1>
            <img className="home-brand-wordmark" src="/brt-play-wordmark-clean.svg" width="998" height="260" alt="BRT Play" />
          </h1>
          <p>Explore seus universos.</p>
        </div>
        <div className="home-brand-art">
          <img src="/brt-play-symbol-transparent.png" width="1312" height="1199" alt="" />
        </div>
      </header>
      <nav className="home-catalog" aria-label="Seções do BRT Play">
        {sections.map(({ path, category, icon, title, description }) => (
          <NavigateButton key={path} path={path}>
            <span className="home-card-visual" data-category={category} aria-hidden="true">
              <img
                className="home-card-icon"
                src={icon}
                width="1254"
                height="1254"
                alt=""
                loading="lazy"
                onError={hideUnavailableArt}
              />
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
