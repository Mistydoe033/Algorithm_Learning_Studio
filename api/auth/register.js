import {
  applyCors,
  ensureReady,
  getBody,
  registerWithStudy,
  sanitizeUsername,
  validatePassword,
  validateUsername,
} from '../_lib/core.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    await ensureReady();
    const body = getBody(req);

    const username = sanitizeUsername(body?.username);
    const password = body?.password;

    if (!validateUsername(username)) {
      res.status(400).json({ error: 'Username must be 3-32 chars: lowercase letters, numbers, underscore.' });
      return;
    }
    if (!validatePassword(password)) {
      res.status(400).json({ error: 'Password must be between 8 and 72 characters.' });
      return;
    }

    const result = await registerWithStudy(username, password);
    if (result.error) {
      res.status(result.status ?? 400).json({ error: result.error });
      return;
    }

    res.status(201).json({ token: result.token, user: result.user, study: result.study });
  } catch (error) {
    console.error('[api/auth/register] error', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
}
