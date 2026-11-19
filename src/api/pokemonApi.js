import axios, { AxiosError } from 'axios';

const pokemonEndpoint = '/api/pokemon';
const requestTimeout = 10000;
const retryableStatuses = [502, 503, 504];

export async function getPokemonNames(signal) {
  const load = async () => {
    const { data } = await axios.get(`${pokemonEndpoint}/catalog`, { signal, timeout: requestTimeout });
    if (!Array.isArray(data?.names)) {
      throw new AxiosError('Resposta inválida do catálogo.', 'INVALID_API_RESPONSE');
    }
    return data.names;
  };
  try {
    return await load();
  } catch (error) {
    const retryable = error.code === 'ERR_NETWORK' || retryableStatuses.includes(error.response?.status);
    if (signal?.aborted || axios.isCancel(error) || !retryable) throw error;
    return load();
  }
}

export async function getPokemon(name, signal) {
  const { data } = await axios.get(`${pokemonEndpoint}/${encodeURIComponent(name)}`, {
    signal,
    timeout: requestTimeout,
  });
  return data;
}
