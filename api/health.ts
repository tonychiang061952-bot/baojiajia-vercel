import { neon } from '@neondatabase/serverless';

const REQUIRED_ENV = ['DATABASE_URL', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];

// Deliberately imports nothing from ./_lib: if every other endpoint fails while
// this one answers, the fault is in how the runtime resolves our own modules
// rather than in the database or the environment.
export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const env: Record<string, boolean> = {};
  for (const name of REQUIRED_ENV) env[name] = Boolean(process.env[name]);

  const runtime = { node: process.version, cwd: process.cwd() };

  let database: { ok: boolean; records?: number; message?: string };
  const url = process.env.DATABASE_URL;
  if (!url) {
    database = { ok: false, message: 'DATABASE_URL is not set' };
  } else {
    try {
      const rows = await neon(url).query('select count(*)::int as count from app_records');
      database = { ok: true, records: (rows as Record<string, any>[])[0].count };
    } catch (error) {
      database = { ok: false, message: error instanceof Error ? error.message : 'Database unreachable' };
    }
  }

  return response.status(database.ok ? 200 : 503).json({ env, runtime, database });
}
