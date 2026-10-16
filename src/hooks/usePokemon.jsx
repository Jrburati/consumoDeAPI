
import { useEffect, useState } from "react";
import { getPokemon } from "../api/pokemonApi";

export function usePokemon() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPokemon() {
      try {
        setLoading(true);
        const result = await getPokemon();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemon();
  }, []);

  return { data, loading, error };
}
  