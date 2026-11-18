import { useState } from 'react';

const typeLabels = {
  bug: 'Inseto',
  dark: 'Sombrio',
  dragon: 'Dragão',
  electric: 'Elétrico',
  fairy: 'Fada',
  fire: 'Fogo',
  flying: 'Voador',
  grass: 'Planta',
  poison: 'Venenoso',
  water: 'Água',
  ghost: 'Fantasma',
  ground: 'Terra',
  ice: 'Gelo',
  normal: 'Normal',
  fighting: 'Lutador',
  psychic: 'Psíquico',
  rock: 'Pedra',
  steel: 'Aço',
};

const formatMeasure = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export default function PokemonCard({ name, pokemon }) {
  const [failedImages, setFailedImages] = useState([]);
  const { artwork, fallbackArtwork, types, height, weight } = pokemon ?? {};
  const image = [artwork, fallbackArtwork].find((url) => url && !failedImages.includes(url));

  return (
    <article className="pokemon-card" data-type={types?.[0]}>
      <div className="pokemon-card-artwork">
        {image ? (
          <img
            src={image}
            width="475"
            height="475"
            loading="lazy"
            decoding="async"
            alt=""
            onError={() => setFailedImages((previous) => [...previous, image])}
          />
        ) : (
          <span>Imagem indisponível</span>
        )}
      </div>
      <h2>{name}</h2>
      {pokemon ? (
        <>
          <ul className="pokemon-card-types" aria-label="Tipos">
            {types.map((type) => (
              <li key={type} data-type={type}>{typeLabels[type] ?? type}</li>
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
        </>
      ) : (
        <p>Dados indisponíveis.</p>
      )}
    </article>
  );
}
