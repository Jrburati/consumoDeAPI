import axios from 'axios';

export async function getFilme(title, signal) {
  const response = await axios.get('/api/movies/title', {
    params: { title },
    signal,
  });

  if (response.data.Response !== 'True') {
    throw new Error('Erro ao buscar filme.');
  }
  return response.data;
}
