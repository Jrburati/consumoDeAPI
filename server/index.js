import app from './app.js';

export const server = app.listen(3001, '127.0.0.1', () => {
  console.log('Backend disponível em http://127.0.0.1:3001');
});

server.on('error', () => {
  console.error('Não foi possível iniciar o backend na porta 3001.');
  process.exit(1);
});
