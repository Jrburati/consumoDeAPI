
import axios from 'axios';

export async function getPokemon(name, signal) {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${name}`,
    { signal, timeout: 10000 },
  );

  return response.data;
}
