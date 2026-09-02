import { neon } from '@neondatabase/serverless';

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch {
    // Deployment environments provide DATABASE_URL directly.
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const OLD_ORIGIN = 'https://baojiajia-insurance.vercel.app';
const CANONICAL_ORIGIN = 'https://baojiajia.tw';
const applyChanges = process.argv.includes('--apply');
const sql = neon(databaseUrl);

const affected = await sql.query(
  `select id::text, data ->> 'slug' as slug,
          (length(data ->> 'content') - length(replace(data ->> 'content', $1, ''))) / length($1) as link_count
   from app_records
   where collection = 'blog_posts'
     and coalesce(data ->> 'content', '') like '%' || $1 || '%'
   order by data ->> 'slug'`,
  [OLD_ORIGIN],
);

const totalLinks = affected.reduce((sum, row) => sum + Number(row.link_count || 0), 0);
console.log(`Found ${totalLinks} old-domain links across ${affected.length} articles.`);
for (const row of affected) {
  console.log(`${row.slug || row.id}: ${row.link_count}`);
}

if (!applyChanges || affected.length === 0) process.exit(0);

const updated = await sql.query(
  `update app_records
   set data = jsonb_set(
         jsonb_set(
           data,
           '{content}',
           to_jsonb(replace(data ->> 'content', $1, $2))
         ),
         '{updated_at}',
         to_jsonb(now()::text)
       ),
       updated_at = now()
   where collection = 'blog_posts'
     and coalesce(data ->> 'content', '') like '%' || $1 || '%'
   returning id::text, data ->> 'slug' as slug`,
  [OLD_ORIGIN, CANONICAL_ORIGIN],
);

const remaining = await sql.query(
  `select count(*)::int as article_count
   from app_records
   where collection = 'blog_posts'
     and coalesce(data ->> 'content', '') like '%' || $1 || '%'`,
  [OLD_ORIGIN],
);

if (Number(remaining[0]?.article_count || 0) !== 0) {
  throw new Error('Old-domain links remain after the update');
}

console.log(`Updated ${updated.length} articles to use ${CANONICAL_ORIGIN}.`);
