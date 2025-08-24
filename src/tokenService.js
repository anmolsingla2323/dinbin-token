import jwt from 'jsonwebtoken';
import prisma from './db.js';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRY = '1h'; // adjust as needed

export async function generateToken({ userId, deviceId, fingerprint }) {
  const sessionId = uuidv4();
  const payload = { userId, sessionId };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

  await prisma.token.create({
    data: {
      token,
      userId,
      fingerprint,
      deviceId,
      sessionId
    }
  });

  return { token, sessionId };
}

export async function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const session = await prisma.token.findUnique({ where: { token } });
    if (!session || session.isRevoked) return { valid: false };
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

export async function revokeToken(token) {
  const session = await prisma.token.update({
    where: { token },
    data: { isRevoked: true }
  });
  return session.isRevoked;
}

export async function listSessions(userId) {
  return prisma.token.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}
