import { useEffect, useState } from 'react';
import { getPokemon } from '../api/pokemonApi.js';

const pokemonNames = [
  'pikachu', 'charizard', 'bulbasaur', 'squirtle',
  'gengar', 'eevee', 'snorlax', 'lucario',
];

export function usePokemon() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchGallery() {
      const responses = await Promise.allSettled(
        pokemonNames.map((name) => getPokemon(name, controller.signal)),
      );

      if (controller.signal.aborted) return;

      const pokemon = responses.flatMap((response) =>
        response.status === 'fulfilled' ? [response.value] : [],
      );
      setResults({ pokemon, unavailableCount: pokemonNames.length - pokemon.length });
    }

    fetchGallery();
    return () => controller.abort();
  }, []);

  return results;
}
