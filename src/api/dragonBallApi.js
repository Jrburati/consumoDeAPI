import axios from 'axios';

const catalogPageSize = 100;

export async function getDragonBallCharacters(signal) {
  const characters = [];
  let totalPages = 1;

  for (let page = 1; page <= totalPages; page += 1) {
    const { data } = await axios.get('https://dragonball-api.com/api/characters', {
      params: { page, limit: catalogPageSize },
      signal,
      timeout: 10000,
    });
    characters.push(...data.items.filter((item) => item && typeof item === 'object'));
    totalPages = data.meta.totalPages;
  }

  return characters;
}
