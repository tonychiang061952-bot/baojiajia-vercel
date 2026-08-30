import { OAuth2Client } from 'google-auth-library';
import { requiredEnv } from '../_lib/env.js';
import {
  createSession,
  expiredSessionCookie,
  isAdminEmail,
  readSession,
  sessionCookie,
  type SessionUser,
} from '../_lib/session.js';

function body(request: any) {
  if (typeof request.body === 'string') return JSON.parse(request.body || '{}');
  return request.body ?? {};
}

export default async function handler(request: any, response: any) {
  try {
    if (request.method === 'GET') {
      const user = await readSession(request);
      return response.status(200).json({ user });
    }

    if (request.method === 'DELETE') {
      response.setHeader('Set-Cookie', expiredSessionCookie());
      return response.status(204).end();
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST, DELETE');
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const { credential } = body(request);
    if (typeof credential !== 'string' || !credential) {
      return response.status(400).json({ error: 'Missing Google credential' });
    }

    const clientId = requiredEnv('GOOGLE_CLIENT_ID');
    const google = new OAuth2Client(clientId);
    const ticket = await google.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return response.status(401).json({ error: 'Google account email is not verified' });
    }

    const email = payload.email.toLowerCase();
    const user: SessionUser = {
      id: payload.sub,
      email,
      name: payload.name,
      picture: payload.picture,
      role: (await isAdminEmail(email)) ? 'admin' : 'member',
    };
    const token = await createSession(user);
    response.setHeader('Set-Cookie', sessionCookie(token));
    return response.status(200).json({ user });
  } catch (error) {
    console.error('Google authentication failed:', error);
    return response.status(401).json({ error: 'Google authentication failed' });
  }
}
