import { useEffect, useState } from 'react';
import { getDragonBallCharacter } from '../api/dragonBallApi.js';

const characterIds = {
  Goku: 1,
  Vegeta: 2,
  Gohan: 10,
  Piccolo: 3,
  Freezer: 5,
  Cell: 9,
  'Majin Buu': 32,
  Trunks: 16,
};

export function useDragonBall() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCharacters() {
      const ids = Object.values(characterIds);
      const responses = await Promise.allSettled(
        ids.map((id) => getDragonBallCharacter(id, controller.signal)),
      );

      if (controller.signal.aborted) return;

      const characters = responses.flatMap((response) =>
        response.status === 'fulfilled' ? [response.value] : [],
      );
      setResults({ characters, unavailableCount: ids.length - characters.length });
    }

    fetchCharacters();
    return () => controller.abort();
  }, []);

  return results;
}
