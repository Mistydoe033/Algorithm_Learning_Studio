import 'dotenv/config';

import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const PORT = Number(process.env.API_PORT ?? process.env.PORT ?? 8787);
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET missing; using development fallback. Set JWT_SECRET in .env for production.');
}

const useSsl = DATABASE_URL.includes('sslmode=require') || process.env.PGSSL === 'true';
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

function sanitizeUsername(input) {
  return String(input ?? '').trim().toLowerCase();
}

function validateUsername(username) {
  return /^[a-z0-9_]{3,32}$/.test(username);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 72;
}

function parseNonNegativeInt(value, fallback = 0) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return Math.floor(num);
}

function normalizeWeakStats(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof key !== 'string' || key.length > 96) continue;
    const missCount = parseNonNegativeInt(value, -1);
    if (missCount >= 0) out[key] = missCount;
  }
  return out;
}

function normalizeStudyPayload(body) {
  const difficulty = body?.lastDifficulty;
  return {
    weakStats: normalizeWeakStats(body?.weakStats),
    quizAttempts: parseNonNegativeInt(body?.quizAttempts, 0),
    totalCorrect: parseNonNegativeInt(body?.totalCorrect, 0),
    totalQuestions: parseNonNegativeInt(body?.totalQuestions, 0),
    lastPattern: typeof body?.lastPattern === 'string' ? body.lastPattern.slice(0, 64) : 'hash_set',
    lastDifficulty: difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard' ? difficulty : 'medium',
  };
}

function signToken(user) {
  return jwt.sign({ sub: String(user.id), username: user.username }, JWT_SECRET, { expiresIn: '30d' });
}

function readAuthToken(headerValue) {
  if (!headerValue || !headerValue.startsWith('Bearer ')) return null;
  return headerValue.slice('Bearer '.length).trim();
}

function authRequired(req, res, next) {
  const token = readAuthToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Missing Bearer token.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = Number(payload?.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({ error: 'Invalid token subject.' });
      return;
    }
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(32) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS study_progress (
      user_id BIGINT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
      weak_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
      quiz_attempts INTEGER NOT NULL DEFAULT 0,
      total_correct INTEGER NOT NULL DEFAULT 0,
      total_questions INTEGER NOT NULL DEFAULT 0,
      last_pattern VARCHAR(64) NOT NULL DEFAULT 'hash_set',
      last_difficulty VARCHAR(16) NOT NULL DEFAULT 'medium',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function formatStudyRow(row) {
  return {
    weakStats: row?.weak_stats && typeof row.weak_stats === 'object' ? row.weak_stats : {},
    quizAttempts: row?.quiz_attempts ?? 0,
    totalCorrect: row?.total_correct ?? 0,
    totalQuestions: row?.total_questions ?? 0,
    lastPattern: row?.last_pattern ?? 'hash_set',
    lastDifficulty: row?.last_difficulty ?? 'medium',
    updatedAt: row?.updated_at ?? null,
  };
}

async function getOrCreateStudyByUserId(userId) {
  const selectRes = await pool.query(
    `
      SELECT weak_stats, quiz_attempts, total_correct, total_questions, last_pattern, last_difficulty, updated_at
      FROM study_progress
      WHERE user_id = $1
    `,
    [userId],
  );

  if (selectRes.rows.length > 0) {
    return formatStudyRow(selectRes.rows[0]);
  }

  const insertRes = await pool.query(
    `
      INSERT INTO study_progress (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
      RETURNING weak_stats, quiz_attempts, total_correct, total_questions, last_pattern, last_difficulty, updated_at
    `,
    [userId],
  );

  return formatStudyRow(insertRes.rows[0]);
}

async function saveStudyByUserId(userId, payload) {
  const res = await pool.query(
    `
      INSERT INTO study_progress (
        user_id,
        weak_stats,
        quiz_attempts,
        total_correct,
        total_questions,
        last_pattern,
        last_difficulty,
        updated_at
      )
      VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        weak_stats = EXCLUDED.weak_stats,
        quiz_attempts = EXCLUDED.quiz_attempts,
        total_correct = EXCLUDED.total_correct,
        total_questions = EXCLUDED.total_questions,
        last_pattern = EXCLUDED.last_pattern,
        last_difficulty = EXCLUDED.last_difficulty,
        updated_at = NOW()
      RETURNING weak_stats, quiz_attempts, total_correct, total_questions, last_pattern, last_difficulty, updated_at
    `,
    [
      userId,
      JSON.stringify(payload.weakStats),
      payload.quizAttempts,
      payload.totalCorrect,
      payload.totalQuestions,
      payload.lastPattern,
      payload.lastDifficulty,
    ],
  );

  return formatStudyRow(res.rows[0]);
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const username = sanitizeUsername(req.body?.username);
  const password = req.body?.password;

  if (!validateUsername(username)) {
    res.status(400).json({ error: 'Username must be 3-32 chars: lowercase letters, numbers, underscore.' });
    return;
  }
  if (!validatePassword(password)) {
    res.status(400).json({ error: 'Password must be between 8 and 72 characters.' });
    return;
  }

  try {
    const exists = await pool.query('SELECT id FROM app_users WHERE username = $1 LIMIT 1', [username]);
    if (exists.rows.length > 0) {
      res.status(409).json({ error: 'Username already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      `INSERT INTO app_users (username, password_hash) VALUES ($1, $2) RETURNING id, username`,
      [username, passwordHash],
    );

    const user = { id: Number(userRes.rows[0].id), username: userRes.rows[0].username };
    const study = await getOrCreateStudyByUserId(user.id);
    const token = signToken(user);

    res.status(201).json({ token, user, study });
  } catch (error) {
    console.error('[register] error', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const username = sanitizeUsername(req.body?.username);
  const password = req.body?.password;

  if (!validateUsername(username) || typeof password !== 'string') {
    res.status(400).json({ error: 'Invalid credentials format.' });
    return;
  }

  try {
    const userRes = await pool.query('SELECT id, username, password_hash FROM app_users WHERE username = $1 LIMIT 1', [username]);
    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const userRow = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const user = { id: Number(userRow.id), username: userRow.username };
    const study = await getOrCreateStudyByUserId(user.id);
    const token = signToken(user);

    res.json({ token, user, study });
  } catch (error) {
    console.error('[login] error', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

app.get('/api/study', authRequired, async (req, res) => {
  try {
    const study = await getOrCreateStudyByUserId(req.userId);
    res.json({ study });
  } catch (error) {
    console.error('[study:get] error', error);
    res.status(500).json({ error: 'Failed to read study progress.' });
  }
});

app.put('/api/study', authRequired, async (req, res) => {
  try {
    const payload = normalizeStudyPayload(req.body);
    const study = await saveStudyByUserId(req.userId, payload);
    res.json({ study });
  } catch (error) {
    console.error('[study:put] error', error);
    res.status(500).json({ error: 'Failed to save study progress.' });
  }
});

async function start() {
  await ensureSchema();
  await pool.query('SELECT 1');

  app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('[startup] fatal error', error);
  process.exit(1);
});
