import { createServer } from 'vite';
import { server } from './index.js';

try {
  const vite = await createServer();
  await vite.listen();
  vite.printUrls();

  const close = async () => {
    await vite.close();
    server.close(() => process.exit(0));
    server.closeAllConnections();
  };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
} catch {
  console.error('Não foi possível iniciar o Vite.');
  server.close(() => process.exit(1));
}
