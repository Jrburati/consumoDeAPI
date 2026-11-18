import { useEffect, useState } from 'react';
import { getFilme } from '../api/filmeApi.js';

const favoriteTitles = [
  'Fear and Loathing in Las Vegas',
  'The Hangover',
  'Scary Movie',
  'The Dreamseller',
  'Akira',
  'Pulp Fiction',
  'The Wolf of Wall Street',
  'Scarface',
];

export function useFilme() {
  const [favorites, setFavorites] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFavorites() {
      const responses = await Promise.allSettled(
        favoriteTitles.map((title) => getFilme(title, controller.signal)),
      );

      if (controller.signal.aborted) return;

      const movies = responses.flatMap((response) =>
        response.status === 'fulfilled' ? [response.value] : [],
      );
      setFavorites({ movies, unavailableCount: favoriteTitles.length - movies.length });
    }

    fetchFavorites();
    return () => controller.abort();
  }, []);

  return favorites;
}
