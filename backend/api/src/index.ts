import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const HOST = process.env['HOST'] ?? '0.0.0.0';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log('');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│   Ashok Raj Lodge & Restaurant — API        │');
    console.log(`│   Server:  http://${HOST}:${PORT}             │`);
    console.log(`│   Env:     ${process.env['NODE_ENV'] ?? 'development'}                      │`);
    console.log('└─────────────────────────────────────────────┘');
    console.log('');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

start();
