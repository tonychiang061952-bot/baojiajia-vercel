import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}

const SITE_URL = 'https://baojiajia.tw';
const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const toIsoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const makeUrlTag = ({ loc, lastmod, changefreq, priority }) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : null,
  `    <changefreq>${changefreq}</changefreq>`,
  `    <priority>${priority}</priority>`,
  '  </url>',
].filter(Boolean).join('\n');

const staticUrls = (today) => [
  { loc: `${SITE_URL}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
  { loc: `${SITE_URL}/about`, lastmod: today, changefreq: 'monthly', priority: '0.95' },
  { loc: `${SITE_URL}/blog`, lastmod: today, changefreq: 'weekly', priority: '0.90' },
  { loc: `${SITE_URL}/analysis`, lastmod: today, changefreq: 'weekly', priority: '0.85' },
  { loc: `${SITE_URL}/beginner`, lastmod: today, changefreq: 'monthly', priority: '0.80' },
  { loc: `${SITE_URL}/services`, lastmod: today, changefreq: 'monthly', priority: '0.75' },
  { loc: `${SITE_URL}/contact`, lastmod: today, changefreq: 'monthly', priority: '0.60' },
  { loc: `${SITE_URL}/terms`, lastmod: today, changefreq: 'yearly', priority: '0.30' },
  { loc: `${SITE_URL}/privacy`, lastmod: today, changefreq: 'yearly', priority: '0.30' },
];

const main = async () => {
  const today = new Date().toISOString().slice(0, 10);
  let rows = [];
  if (sql) {
    try {
      rows = await sql.query(
        `select collection, data, updated_at
         from app_records
         where collection = any($1::text[])
           and coalesce(data->>'is_active', 'true') = 'true'
           and data ? 'slug'`,
        [['blog_posts', 'service_items']],
      );
    } catch (error) {
      console.warn('Unable to load dynamic sitemap URLs; generating static sitemap only.', error instanceof Error ? error.message : error);
    }
  } else {
    console.warn('Missing DATABASE_URL; generating static sitemap only.');
  }

  const dynamicUrls = rows.flatMap((row) => {
    const slug = String(row.data?.slug ?? '').trim();
    if (!slug) return [];
    const prefix = row.collection === 'blog_posts' ? '/blog/' : '/services/';
    return [{
      loc: `${SITE_URL}${prefix}${slug}`,
      lastmod: toIsoDate(row.data?.updated_at) || toIsoDate(row.data?.published_at) || toIsoDate(row.updated_at) || today,
      changefreq: 'monthly',
      priority: '0.70',
    }];
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '',
    ...[...staticUrls(today), ...dynamicUrls].map(makeUrlTag),
    '',
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf8');
  console.log(`Generated sitemap.xml with ${staticUrls(today).length + dynamicUrls.length} URLs.`);
};

main().catch((error) => {
  console.error('generate-sitemap failed:', error);
  process.exit(1);
});
