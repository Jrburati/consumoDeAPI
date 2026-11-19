import { Router } from 'express';

const router = Router();
const endpoint = 'https://pokeapi.co/api/v2/pokemon/';
const spritePrefix = 'https://raw.githubusercontent.com/PokeAPI/sprites/';
const catalogPageSize = 2000;
const requestTimeout = 8000;

class PokemonError extends Error {
  constructor(status, code, message = 'Serviço de Pokémon indisponível.') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const invalidResponse = () => new PokemonError(502, 'INVALID_UPSTREAM_RESPONSE');
const invalidName = () => new PokemonError(400, 'INVALID_NAME', 'Informe um nome de Pokémon válido.');
const isName = value => typeof value === 'string' && value.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const isMeasure = value => Number.isSafeInteger(value) && value >= 0;
const spriteUrl = value => typeof value === 'string' && value.startsWith(spritePrefix) ? value : null;
const sendError = (res, error) => res.status(error.status).set('Cache-Control', 'no-store')
  .json({ error: error.message, code: error.code });

async function fetchPokemon(url, signal, isDetail = false) {
  let response;
  try {
    response = await fetch(url, { signal, redirect: 'error' });
    if (response.ok) return await response.json();
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof SyntaxError) throw invalidResponse();
    throw new PokemonError(502, 'UPSTREAM_NETWORK');
  }

  await response.body?.cancel().catch(() => {});
  if (isDetail && response.status === 404) {
    throw new PokemonError(404, 'POKEMON_NOT_FOUND', 'Pokémon não encontrado.');
  }
  const status = [429, 503].includes(response.status) ? 503 : response.status === 504 ? 504 : 502;
  throw new PokemonError(status, 'UPSTREAM_HTTP');
}

async function getCatalog(_req, signal) {
  const names = new Set();
  let next;
  do {
    const url = new URL(endpoint);
    url.searchParams.set('limit', catalogPageSize);
    url.searchParams.set('offset', names.size);
    const page = await fetchPokemon(url, signal);
    if (!Array.isArray(page?.results) || (page.next !== null && (!page.next || typeof page.next !== 'string'))) {
      throw invalidResponse();
    }
    next = page.next;
    if (next && !page.results.length) throw invalidResponse();
    for (const entry of page.results) {
      if (!isName(entry?.name) || names.has(entry.name)) throw invalidResponse();
      names.add(entry.name);
    }
  } while (next);
  return { names: [...names] };
}

async function getDetails(req, signal) {
  const { name } = req.params;
  if (!isName(name)) throw invalidName();

  const data = await fetchPokemon(new URL(`${name}/`, endpoint), signal, true);
  const { sprites, types, height, weight } = data ?? {};
  if (!sprites || typeof sprites !== 'object' || Array.isArray(sprites) ||
    !Array.isArray(types) || types.some(entry => !isName(entry?.type?.name)) ||
    !isMeasure(height) || !isMeasure(weight)) {
    throw invalidResponse();
  }
  return {
    artwork: spriteUrl(sprites.other?.['official-artwork']?.front_default),
    fallbackArtwork: spriteUrl(sprites.front_default),
    types: types.map(({ type }) => type.name),
    height,
    weight,
  };
}

function handleRequest(load) {
  return async (req, res) => {
    const controller = new AbortController();
    const timeout = AbortSignal.timeout(requestTimeout);
    const signal = AbortSignal.any([controller.signal, timeout]);
    const onClose = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.on('close', onClose);
    try {
      const data = await load(req, signal);
      signal.throwIfAborted();
      res.set('Cache-Control', 'no-store').json(data);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (timeout.aborted) return sendError(res, new PokemonError(504, 'UPSTREAM_TIMEOUT'));
      if (error instanceof PokemonError) return sendError(res, error);
      return sendError(res, new PokemonError(500, 'INTERNAL_ERROR'));
    } finally {
      res.off('close', onClose);
    }
  };
}

router.get('/catalog', handleRequest(getCatalog));
router.get('/:name', handleRequest(getDetails));
// Express can reject malformed percent encoding before entering the route handler.
router.use((error, _req, res, next) => {
  if (error instanceof URIError) return sendError(res, invalidName());
  return next(error);
});

export default router;
