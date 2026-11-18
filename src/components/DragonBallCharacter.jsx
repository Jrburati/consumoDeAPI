import { useState } from 'react';

function displayValue(value) {
  return value?.toString().trim() || 'Não informado';
}

export default function DragonBallCharacter({ character }) {
  const { name, image, race, gender, ki, affiliation } = character;
  const [failedImage, setFailedImage] = useState(null);
  const imageUrl = typeof image === 'string' ? image.trim() : '';
  const displayName = typeof name === 'string' ? name.trim() : '';
  const details = [
    ['Raça', race],
    ['Gênero', gender],
    ['Ki', ki],
    ['Afiliação', affiliation],
  ];

  return (
    <article className="dragonball-character">
      <div className="dragonball-character-image">
        {imageUrl && imageUrl !== failedImage ? (
          <img
            src={imageUrl}
            loading="lazy"
            decoding="async"
            alt=""
            onError={() => setFailedImage(imageUrl)}
          />
        ) : (
          <span>Imagem indisponível</span>
        )}
      </div>
      <h2>{displayName || 'Personagem sem nome'}</h2>
      <dl className="dragonball-character-details">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{displayValue(value)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
