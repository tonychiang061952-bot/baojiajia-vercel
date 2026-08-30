import { existsSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}
if (existsSync('.env.local') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env.local');
}

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
const emails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter((email) => /^\S+@\S+\.\S+$/.test(email));
if (!emails.length) throw new Error('Missing valid ADMIN_EMAILS');

const sql = neon(process.env.DATABASE_URL);
await sql.query(
  `insert into admin_users (email)
   select unnest($1::text[])
   on conflict (email) do nothing`,
  [emails],
);
console.log(`Seeded ${emails.length} admin user(s).`);
