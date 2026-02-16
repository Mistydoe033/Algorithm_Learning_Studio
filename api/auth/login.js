import {
  applyCors,
  ensureReady,
  getBody,
  loginWithStudy,
  sanitizeUsername,
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

    if (!validateUsername(username) || typeof password !== 'string') {
      res.status(400).json({ error: 'Invalid credentials format.' });
      return;
    }

    const result = await loginWithStudy(username, password);
    if (result.error) {
      res.status(result.status ?? 400).json({ error: result.error });
      return;
    }

    res.status(200).json({ token: result.token, user: result.user, study: result.study });
  } catch (error) {
    console.error('[api/auth/login] error', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
}
