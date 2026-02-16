import {
  applyCors,
  ensureReady,
  getBody,
  getOrCreateStudyByUserId,
  normalizeStudyPayload,
  requireUserId,
  saveStudyByUserId,
} from './_lib/core.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    await ensureReady();

    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Invalid or missing Bearer token.' });
      return;
    }

    if (req.method === 'GET') {
      const study = await getOrCreateStudyByUserId(userId);
      res.status(200).json({ study });
      return;
    }

    const payload = normalizeStudyPayload(getBody(req));
    const study = await saveStudyByUserId(userId, payload);
    res.status(200).json({ study });
  } catch (error) {
    console.error('[api/study] error', error);
    res.status(500).json({ error: 'Failed to process study request.' });
  }
}
