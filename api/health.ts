import { sql } from './_lib/neon';

const REQUIRED_ENV = ['DATABASE_URL', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];

// Reports only whether each variable is set, never its value.
export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const env: Record<string, boolean> = {};
  for (const name of REQUIRED_ENV) env[name] = Boolean(process.env[name]);

  let database: { ok: boolean; records?: number; message?: string };
  try {
    const rows = await sql.query('select count(*)::int as count from app_records');
    database = { ok: true, records: rows[0].count };
  } catch (error) {
    database = { ok: false, message: error instanceof Error ? error.message : 'Database unreachable' };
  }

  return response.status(database.ok ? 200 : 503).json({ env, database });
}
