import app from './app.js';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.NODE_ENV === 'production' || process.env.PORT ? '0.0.0.0' : '127.0.0.1';

export const server = app.listen(PORT, HOST, () => {
  console.log(`BRT Play disponível em http://${HOST}:${PORT}`);
});

server.on('error', () => {
  console.error(`Não foi possível iniciar o servidor na porta ${PORT}.`);
  process.exit(1);
});
