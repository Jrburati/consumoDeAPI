
import { useEffect, useState } from "react";
import { getPerson } from "../api/personApi";

export function usePerson() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPerson() {
      try {
        setLoading(true);
        const result = await getPerson();
        setData({ ...result, nome: "Buratti" });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPerson();
  }, []);

return { perfil: data, loading, error };
}
