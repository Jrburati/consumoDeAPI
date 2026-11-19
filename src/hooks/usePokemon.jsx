import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import { getPokemon, getPokemonNames } from '../api/pokemonApi.js';

const pageSize = 24;
const detailConcurrency = 6;
const searchDelay = 250;

function normalizeQuery(query) {
  return query.trim().toLowerCase().replace(/\s+/g, '-');
}

export function usePokemon() {
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(false);
  const [query, setQuery] = useState('');
  const [catalogLimit, setCatalogLimit] = useState(pageSize);
  const [searchLimit, setSearchLimit] = useState(pageSize);
  const [details, setDetails] = useState(() => new Map());
  const term = normalizeQuery(query);
  const searching = term !== '';
  const limit = searching ? searchLimit : catalogLimit;

  const matches = useMemo(
    () => searching ? catalog?.filter((name) => name.includes(term)) : catalog,
    [catalog, searching, term],
  );
  const visibleNames = useMemo(() => matches?.slice(0, limit) ?? [], [matches, limit]);
  const getPendingNames = useEffectEvent(
    (names) => names.filter((name) => !details.has(name)),
  );

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCatalog() {
      try {
        const names = await getPokemonNames(controller.signal);
        if (!controller.signal.aborted) setCatalog(names);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn('Falha ao carregar o catálogo de Pokémon.', {
          code: error.response?.data?.code ?? error.code,
          status: error.response?.status,
        });
        setCatalogError(true);
      }
    }

    fetchCatalog();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const pendingNames = getPendingNames(visibleNames);
    if (!pendingNames.length) return;

    const controller = new AbortController();

    async function fetchDetails() {
      for (let start = 0; start < pendingNames.length; start += detailConcurrency) {
        const batch = pendingNames.slice(start, start + detailConcurrency);
        const responses = await Promise.allSettled(
          batch.map((name) => getPokemon(name, controller.signal)),
        );
        if (controller.signal.aborted) return;

        setDetails((previous) => {
          const updated = new Map(previous);
          responses.forEach((response, index) => {
            updated.set(batch[index], response.status === 'fulfilled' ? response.value : null);
          });
          return updated;
        });
      }
    }

    const timer = setTimeout(fetchDetails, searching ? searchDelay : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [visibleNames, searching]);

  const entries = visibleNames
    .filter((name) => details.has(name))
    .map((name) => ({ name, pokemon: details.get(name) }));

  function changeQuery(value) {
    if (normalizeQuery(value) !== term) setSearchLimit(pageSize);
    setQuery(value);
  }

  function loadMore() {
    const setLimit = searching ? setSearchLimit : setCatalogLimit;
    setLimit((previous) => previous + pageSize);
  }

  return {
    catalogError,
    catalogLoading: catalog === null && !catalogError,
    entries,
    detailsLoading: entries.length < visibleNames.length,
    query,
    changeQuery,
    searching,
    total: matches?.length ?? 0,
    hasMore: visibleNames.length < (matches?.length ?? 0),
    loadMore,
  };
}
