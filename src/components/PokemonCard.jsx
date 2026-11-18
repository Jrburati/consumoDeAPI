const typeLabels = {
  electric: 'Elétrico',
  fire: 'Fogo',
  flying: 'Voador',
  grass: 'Planta',
  poison: 'Venenoso',
  water: 'Água',
  ghost: 'Fantasma',
  normal: 'Normal',
  fighting: 'Lutador',
  steel: 'Aço',
};

const formatMeasure = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export default function PokemonCard({ pokemon }) {
  const { name, sprites, types, height, weight } = pokemon;
  const artwork = sprites.other?.['official-artwork']?.front_default || sprites.front_default;

  return (
    <article className="pokemon-card" data-type={types[0]?.type.name}>
      <div className="pokemon-card-artwork">
        {artwork && <img src={artwork} width="475" height="475" alt="" />}
      </div>
      <h2>{name}</h2>
      <ul className="pokemon-card-types" aria-label="Tipos">
        {types.map(({ type }) => (
          <li key={type.name} data-type={type.name}>{typeLabels[type.name] ?? type.name}</li>
        ))}
      </ul>
      <dl className="pokemon-card-measures">
        <div>
          <dt>Altura</dt>
          <dd>{formatMeasure.format(height / 10)} m</dd>
        </div>
        <div>
          <dt>Peso</dt>
          <dd>{formatMeasure.format(weight / 10)} kg</dd>
        </div>
      </dl>
    </article>
  );
}
