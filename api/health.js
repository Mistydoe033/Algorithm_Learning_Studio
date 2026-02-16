import { applyCors, ensureReady } from './_lib/core.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    await ensureReady();
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[api/health] error', error);
    res.status(500).json({ ok: false });
  }
}
