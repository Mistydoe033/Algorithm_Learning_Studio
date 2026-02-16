import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

function assertDatabaseUrl() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in environment variables.');
  }
}

function getPool() {
  assertDatabaseUrl();
  if (!globalThis.__algoStudioPool) {
    const useSsl = DATABASE_URL.includes('sslmode=require') || process.env.PGSSL === 'true';
    globalThis.__algoStudioPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalThis.__algoStudioPool;
}

async function ensureSchema() {
  const pool = getPool();

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

export async function ensureReady() {
  if (!globalThis.__algoStudioReadyPromise) {
    globalThis.__algoStudioReadyPromise = (async () => {
      await ensureSchema();
      await getPool().query('SELECT 1');
    })();
  }
  await globalThis.__algoStudioReadyPromise;
}

export function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function sanitizeUsername(input) {
  return String(input ?? '').trim().toLowerCase();
}

export function validateUsername(username) {
  return /^[a-z0-9_]{3,32}$/.test(username);
}

export function validatePassword(password) {
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

export function normalizeStudyPayload(body) {
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

export function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function signToken(user) {
  return jwt.sign({ sub: String(user.id), username: user.username }, JWT_SECRET, { expiresIn: '30d' });
}

function readAuthToken(req) {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

export function requireUserId(req) {
  const token = readAuthToken(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = Number(payload?.sub);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return userId;
  } catch {
    return null;
  }
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

export async function getOrCreateStudyByUserId(userId) {
  const pool = getPool();

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

export async function saveStudyByUserId(userId, payload) {
  const pool = getPool();

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

export async function registerWithStudy(username, password) {
  const pool = getPool();

  const exists = await pool.query('SELECT id FROM app_users WHERE username = $1 LIMIT 1', [username]);
  if (exists.rows.length > 0) {
    return { error: 'Username already exists.', status: 409 };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userRes = await pool.query('INSERT INTO app_users (username, password_hash) VALUES ($1, $2) RETURNING id, username', [
    username,
    passwordHash,
  ]);

  const user = { id: Number(userRes.rows[0].id), username: userRes.rows[0].username };
  const study = await getOrCreateStudyByUserId(user.id);
  const token = signToken(user);

  return { user, study, token };
}

export async function loginWithStudy(username, password) {
  const pool = getPool();

  const userRes = await pool.query('SELECT id, username, password_hash FROM app_users WHERE username = $1 LIMIT 1', [username]);
  if (userRes.rows.length === 0) {
    return { error: 'Invalid username or password.', status: 401 };
  }

  const userRow = userRes.rows[0];
  const isMatch = await bcrypt.compare(password, userRow.password_hash);
  if (!isMatch) {
    return { error: 'Invalid username or password.', status: 401 };
  }

  const user = { id: Number(userRow.id), username: userRow.username };
  const study = await getOrCreateStudyByUserId(user.id);
  const token = signToken(user);

  return { user, study, token };
}
