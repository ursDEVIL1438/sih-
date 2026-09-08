import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

// Helpful Node version check
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (isNaN(nodeMajor) || nodeMajor < 16) {
  console.warn(`[JALDRISHTI X] Detected Node.js ${process.versions.node}. Node 16+ is recommended for ES modules and modern deps.`);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', system: 'JALDRISHTI X BACKEND CORE', uptime: process.uptime() });
});

process.on('uncaughtException', (err) => {
  console.error('[JALDRISHTI X] Uncaught Exception:', err && err.stack ? err.stack : err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[JALDRISHTI X] Unhandled Rejection:', reason);
});

try {
  app.listen(PORT, () => {
    console.log(`[JALDRISHTI X BACKEND] Running on port ${PORT}`);
  });
} catch (err) {
  console.error('[JALDRISHTI X] Failed to start server:', err && err.stack ? err.stack : err);
  process.exit(1);
}
