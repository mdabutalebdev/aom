import app from './app';
import config from './app/config';
import { dbConnect } from './app/utils/dbConnect';

const PORT = config.port || 5000;

async function startServer() {
  // ─── Database Connection ───────────────────────────────────
  // Phase 1: the HTTP server must boot and serve the health check
  // EVEN IF the database is missing/unreachable, so the foundation
  // is verifiable without a live MongoDB. We therefore attempt the
  // connection but never let a failure prevent app.listen().
  try {
    await dbConnect();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      '⚠️  Database connection failed — starting server without DB. ' +
        'Set DATABASE_URL in .env to enable persistence.',
      error instanceof Error ? error.message : error,
    );
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 AOM Online Madrasa Server is running on http://localhost:${PORT}`);
  });
}

startServer();

// For Vercel serverless
export default app;
