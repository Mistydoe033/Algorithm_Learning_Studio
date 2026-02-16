import 'dotenv/config';

import express from 'express';

import loginHandler from '../api/auth/login.js';
import registerHandler from '../api/auth/register.js';
import healthHandler from '../api/health.js';
import studyHandler from '../api/study.js';

const PORT = Number(process.env.API_PORT ?? process.env.PORT ?? 8787);

const app = express();
app.use(express.json({ limit: '256kb' }));

app.all('/api/health', healthHandler);
app.all('/api/auth/login', loginHandler);
app.all('/api/auth/register', registerHandler);
app.all('/api/study', studyHandler);

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
