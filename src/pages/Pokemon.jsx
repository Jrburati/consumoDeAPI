import NavigateButton from '../components/NavigateButton.jsx';
import PokemonCard from '../components/PokemonCard.jsx';

export default function Pokemon() {
  return (
    <main className="page">
      <h1>Pokémon</h1>
      <section id="next-steps">
        <div id="docs"><PokemonCard /></div>
      </section>
      <NavigateButton path="/">Voltar para Home</NavigateButton>
    </main>
  );
}
