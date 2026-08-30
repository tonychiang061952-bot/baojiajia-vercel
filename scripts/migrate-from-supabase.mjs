import { existsSync, writeFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

// Copies the content tables of the previous Supabase project into app_records,
// keeping each row's original id so cross-table references (service_details ->
// service_items) still resolve. Every collection it touches is replaced
// wholesale, and the current contents are written to a backup file first.
//
//   node scripts/migrate-from-supabase.mjs <supabase-url> <publishable-key>

if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing DATABASE_URL');

const supabaseUrl = process.argv[2] || process.env.SUPABASE_URL;
const supabaseKey = process.argv[3] || process.env.SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Usage: node scripts/migrate-from-supabase.mjs <supabase-url> <publishable-key>');
}

// Only collections the site renders. contact_submissions, member_submissions
// and user_download_limits hold personal data and are left alone.
const COLLECTIONS = [
  'about_content', 'blog_categories', 'blog_posts', 'carousel_settings',
  'contact_info', 'core_values', 'customer_reviews', 'features',
  'hero_carousel', 'homepage_content', 'navigation_items', 'pdf_templates',
  'service_details', 'service_items', 'site_settings', 'statistics',
  'system_settings', 'team_members', 'testimonials',
];

const sql = neon(databaseUrl);

async function fetchTable(table) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to read ${table}: HTTP ${response.status} ${await response.text()}`);
  }
  return response.json();
}

// id, created_at and updated_at are columns on app_records; everything else
// belongs in the jsonb payload.
function toRecord(row) {
  const { id, created_at, updated_at, ...data } = row;
  return {
    id,
    created_at: created_at ?? null,
    updated_at: updated_at ?? null,
    data,
  };
}

const backup = await sql.query('select collection, id, data, created_at, updated_at from app_records');
const backupPath = `app_records-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(backupPath, JSON.stringify(backup, null, 2));
console.log(`Backed up ${backup.length} existing record(s) to ${backupPath}.\n`);

let migrated = 0;
for (const collection of COLLECTIONS) {
  const rows = await fetchTable(collection);
  if (!rows.length) {
    console.log(`${collection}: source is empty, left untouched.`);
    continue;
  }

  const records = rows.map(toRecord);
  await sql.transaction([
    sql.query('delete from app_records where collection = $1', [collection]),
    sql.query(
      `insert into app_records (id, collection, data, created_at, updated_at)
       select
         (item ->> 'id')::uuid,
         $1,
         item -> 'data',
         coalesce((item ->> 'created_at')::timestamptz, now()),
         coalesce((item ->> 'updated_at')::timestamptz, now())
       from jsonb_array_elements($2::jsonb) as item`,
      [collection, JSON.stringify(records)],
    ),
  ]);

  migrated += records.length;
  console.log(`${collection}: replaced with ${records.length} record(s) from Supabase.`);
}

const totals = await sql.query(
  'select collection, count(*)::int as count from app_records group by 1 order by 1',
);
console.log(`\nMigrated ${migrated} record(s). app_records now holds:`);
for (const row of totals) console.log(`  ${row.collection.padEnd(20)} ${row.count}`);
