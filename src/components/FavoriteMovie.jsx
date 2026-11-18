import { useState } from 'react';

export default function FavoriteMovie({ movie }) {
  const { Poster: poster, Title: title, Year: year, imdbRating: rating } = movie;
  const [failedPoster, setFailedPoster] = useState(null);
  const hasPoster = poster && poster !== 'N/A' && poster !== failedPoster;
  const hasRating = rating && rating !== 'N/A';

  return (
    <article className="favorite-movie">
      <div className="favorite-movie-poster">
        {hasPoster ? (
          <img src={poster} alt="" onError={() => setFailedPoster(poster)} />
        ) : (
          <span>Pôster indisponível</span>
        )}
      </div>
      <div className="favorite-movie-details">
        <h3>{title}</h3>
        <div className="favorite-movie-meta">
          <span>{year}</span>
          <span className="favorite-movie-rating">
            IMDb <strong>{hasRating ? rating.replace('.', ',') : 'sem nota'}</strong>
          </span>
        </div>
      </div>
    </article>
  );
}
