import { useEffect, useState } from 'react';
import { getDragonBallCharacters } from '../api/dragonBallApi.js';

const pageSize = 12;

function normalizeName(name) {
  return typeof name === 'string' ? name.trim().toLowerCase() : '';
}

export function useDragonBall() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [catalogLimit, setCatalogLimit] = useState(pageSize);
  const [searchLimit, setSearchLimit] = useState(pageSize);
  const term = normalizeName(query);
  const searching = term !== '';
  const limit = searching ? searchLimit : catalogLimit;
  const matches = (searching ? catalog?.filter(({ name }) => normalizeName(name).includes(term)) : catalog) ?? [];

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCharacters() {
      try {
        const characters = await getDragonBallCharacters(controller.signal);
        if (!controller.signal.aborted) setCatalog(characters);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }

    fetchCharacters();
    return () => controller.abort();
  }, []);

  function changeQuery(value) {
    if (normalizeName(value) !== term) setSearchLimit(pageSize);
    setQuery(value);
  }

  function loadMore() {
    const setLimit = searching ? setSearchLimit : setCatalogLimit;
    setLimit((previous) => previous + pageSize);
  }

  return {
    characters: matches.slice(0, limit),
    total: matches.length,
    error,
    loading: catalog === null && !error,
    query,
    changeQuery,
    searching,
    hasMore: limit < matches.length,
    loadMore,
  };
}
