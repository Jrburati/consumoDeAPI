import axios from 'axios';

export async function getDragonBallCharacter(id, signal) {
  const response = await axios.get(
    `https://dragonball-api.com/api/characters/${id}`,
    { signal, timeout: 10000 },
  );

  return response.data;
}
