
import { useEffect, useState } from "react";
import { getDragonBallCharacter } from "../api/dragonBallApi";

export function useDragonBall() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCharacter() {
      try {
        setLoading(true);
        const result = await getDragonBallCharacter();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacter();
  }, []);

  return { data, loading, error };
}
  