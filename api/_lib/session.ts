import { SignJWT, jwtVerify } from 'jose';
import { requiredEnv } from './env';
import { sql } from './neon';

export const SESSION_COOKIE = 'baojiajia_session';

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: 'admin' | 'member';
};

const encoder = new TextEncoder();

function sessionKey() {
  return encoder.encode(requiredEnv('SESSION_SECRET'));
}

function readCookie(header?: string) {
  const cookie = header
    ?.split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(SESSION_COOKIE.length + 1);
}

export async function isAdminEmail(email: string) {
  const rows = await sql.query(
    'select 1 from admin_users where lower(email) = lower($1) limit 1',
    [email],
  );
  return rows.length > 0;
}

export async function readSession(request: { headers?: { cookie?: string } }): Promise<SessionUser | null> {
  const token = readCookie(request.headers?.cookie);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ['HS256'] });
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      (payload.role !== 'admin' && payload.role !== 'member')
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    name: user.name,
    picture: user.picture,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(sessionKey());
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

export function expiredSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
