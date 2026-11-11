import express from 'express';
import { fileURLToPath } from 'node:url';

const app = express();

function movieRequest(parameter, omdbParameter) {
  return async (req, res) => {
    const value = req.query[parameter];
    if (typeof value !== 'string' || !value.trim() || value.length > 200) {
      return res.status(400).json({ Response: 'False', Error: 'Informe um título válido de até 200 caracteres.' });
    }

    const apiKey = process.env.OMDB_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({ Response: 'False', Error: 'Serviço de filmes indisponível.' });
    }

    const controller = new AbortController();
    const onClose = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.on('close', onClose);

    try {
      const params = new URLSearchParams({ [omdbParameter]: value.trim(), apikey: apiKey });
      const response = await fetch(`https://www.omdbapi.com/?${params}`, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
      });
      if (!response.ok) {
        return res.status(response.status === 429 ? 503 : 502).json({ Response: 'False', Error: 'Serviço de filmes indisponível.' });
      }

      const data = await response.json();
      if (data?.Response === 'False') {
        if (data.Error === 'Movie not found!') {
          return res.status(omdbParameter === 's' ? 200 : 404).json({ Response: 'False', Error: 'Movie not found!' });
        }
        if (data.Error === 'Too many results.') {
          return res.status(422).json({ Response: 'False', Error: 'Informe um título mais específico.' });
        }
        return res.status(data.Error === 'Request limit reached!' ? 503 : 502).json({ Response: 'False', Error: 'Serviço de filmes indisponível.' });
      }

      // Retorna apenas os campos usados pela interface, sem repassar dados de autenticação.
      const safeValue = value => typeof value === 'string' ? value.replaceAll(apiKey, '[redacted]') : '';
      if (data?.Response !== 'True') throw new Error('Invalid movie response');
      if (omdbParameter === 's') {
        if (!Array.isArray(data.Search) || data.Search.some(movie => !movie || typeof movie !== 'object')) {
          throw new Error('Invalid movie response');
        }
        return res.json({
          Response: 'True',
          Search: data.Search.map(movie => ({
            Title: safeValue(movie.Title), Year: safeValue(movie.Year), imdbID: safeValue(movie.imdbID),
          })),
        });
      }
      if (typeof data.Title !== 'string') throw new Error('Invalid movie response');
      return res.json({ Response: 'True', Title: safeValue(data.Title), Poster: safeValue(data.Poster), imdbRating: safeValue(data.imdbRating) });
    } catch (error) {
      if (controller.signal.aborted) return;
      return res.status(error.name === 'TimeoutError' ? 504 : 502).json({ Response: 'False', Error: 'Não foi possível consultar os filmes. Tente novamente.' });
    } finally {
      res.off('close', onClose);
    }
  };
}

app.get('/api/movies/search', movieRequest('query', 's'));
app.get('/api/movies/title', movieRequest('title', 't'));
// API requests must never fall through to the frontend or its SPA fallback.
app.use('/api', (req, res) => res.status(404).json({ Error: 'Rota não encontrada.' }));
app.use(express.static(fileURLToPath(new URL('../dist', import.meta.url))));
app.get('/{*path}', (req, res) => {
  res.sendFile(fileURLToPath(new URL('../dist/index.html', import.meta.url)));
});

export default app;
