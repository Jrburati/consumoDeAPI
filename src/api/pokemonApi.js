
import axios from 'axios';

const pokemonEndpoint = 'https://pokeapi.co/api/v2/pokemon';
const namePageSize = 2000;
const requestTimeout = 10000;

export async function getPokemonNames(signal) {
  const names = [];
  let next;

  do {
    const { data } = await axios.get(`${pokemonEndpoint}/`, {
      params: { limit: namePageSize, offset: names.length },
      signal,
      timeout: requestTimeout,
    });
    names.push(...data.results.map(({ name }) => name));
    next = data.next;
  } while (next);

  return names;
}

export async function getPokemon(name, signal) {
  const { data } = await axios.get(`${pokemonEndpoint}/${name}`, {
    signal,
    timeout: requestTimeout,
  });
  const { sprites, types, height, weight } = data;

  return {
    artwork: sprites.other?.['official-artwork']?.front_default,
    fallbackArtwork: sprites.front_default,
    types: types.map(({ type }) => type.name),
    height,
    weight,
  };
}
