import express from 'express';
import {
  generateToken,
  verifyToken,
  revokeToken,
  listSessions
} from './tokenService.js';

const router = express.Router();

// Generate token
router.post('/generate', async (req, res) => {
  const { userId, deviceId, fingerprint } = req.body;
  if (!userId || !deviceId || !fingerprint) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const tokenData = await generateToken({ userId, deviceId, fingerprint });
  res.json(tokenData);
});

// Verify token
router.post('/verify', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const result = await verifyToken(token);
  if (!result.valid) return res.status(401).json({ valid: false });
  res.json(result);
});

// Revoke token
router.post('/revoke', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const revoked = await revokeToken(token);
  res.json({ revoked });
});

// List sessions for a user
router.get('/sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  const sessions = await listSessions(userId);
  res.json(sessions);
});

export default router;
