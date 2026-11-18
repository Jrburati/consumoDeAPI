import { useState } from 'react';

function displayValue(value) {
  return value?.toString().trim() || 'Não informado';
}

export default function DragonBallCharacter({ character }) {
  const { name, image, race, gender, ki, affiliation } = character;
  const [failedImage, setFailedImage] = useState(null);
  const imageUrl = image?.trim();
  const displayName = name === 'Celula' ? 'Cell' : name?.trim() || 'Personagem sem nome';
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
          <img src={imageUrl} alt="" onError={() => setFailedImage(imageUrl)} />
        ) : (
          <span>Imagem indisponível</span>
        )}
      </div>
      <h2>{displayName}</h2>
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
