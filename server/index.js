import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', system: 'JALDRISHTI X BACKEND CORE', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`[JALDRISHTI X BACKEND] Running on port ${PORT}`);
});
