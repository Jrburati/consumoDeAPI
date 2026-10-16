
import { useEffect, useState } from "react";
import { getFilme } from "../api/filmeApi";

export function useFilme() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFilme() {
      try {
        setLoading(true);
        const result = await getFilme();

        if (result.Response === "False") {
          throw new Error(result.Error || "Erro ao buscar filme");
        }

        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFilme();
  }, []);

  return { filme: data, loading, error };
}

  