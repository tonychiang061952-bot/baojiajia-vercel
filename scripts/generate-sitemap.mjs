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

const newestDate = (...values) => {
  const dates = values
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString().slice(0, 10);
};

const isTrue = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  return value === true || value === 'true';
};

const hasVisibleContent = (html) => String(html ?? '')
  .replace(/<[^>]*>/g, ' ')
  .replaceAll('&nbsp;', ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .length > 0;

const makeUrlTag = ({ loc, lastmod, changefreq, priority }) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : null,
  `    <changefreq>${changefreq}</changefreq>`,
  `    <priority>${priority}</priority>`,
  '  </url>',
].filter(Boolean).join('\n');

const staticUrls = ({ blogLastmod, servicesLastmod }) => [
  { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.95' },
  { loc: `${SITE_URL}/blog`, lastmod: blogLastmod, changefreq: 'weekly', priority: '0.90' },
  { loc: `${SITE_URL}/analysis`, changefreq: 'weekly', priority: '0.85' },
  { loc: `${SITE_URL}/beginner`, changefreq: 'monthly', priority: '0.80' },
  { loc: `${SITE_URL}/services`, lastmod: servicesLastmod, changefreq: 'monthly', priority: '0.75' },
  { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.60' },
  { loc: `${SITE_URL}/terms`, changefreq: 'yearly', priority: '0.30' },
  { loc: `${SITE_URL}/privacy`, changefreq: 'yearly', priority: '0.30' },
];

const main = async () => {
  let rows = [];
  if (sql) {
    try {
      rows = await sql.query(
        `select id::text, collection, data, created_at, updated_at
         from app_records
         where collection = any($1::text[])`,
        [['blog_posts', 'service_items', 'service_details']],
      );
    } catch (error) {
      console.warn('Unable to load dynamic sitemap URLs; generating static sitemap only.', error instanceof Error ? error.message : error);
    }
  } else {
    console.warn('Missing DATABASE_URL; generating static sitemap only.');
  }

  const serviceDetails = new Map(
    rows
      .filter((row) => row.collection === 'service_details')
      .map((row) => [String(row.data?.service_id ?? ''), row]),
  );

  const serviceRows = rows.filter((row) => row.collection === 'service_items' && isTrue(row.data?.is_active, true));
  const serviceUrls = serviceRows.flatMap((row) => {
    const slug = String(row.data?.slug ?? '').trim();
    const detail = serviceDetails.get(row.id);
    if (!slug || !detail || !hasVisibleContent(detail.data?.content)) {
      console.warn(`Skipping incomplete service page in sitemap: ${slug || row.id}`);
      return [];
    }
    return [{
      loc: `${SITE_URL}/services/${slug}`,
      lastmod: newestDate(row.updated_at, row.data?.updated_at, detail.updated_at, detail.data?.updated_at),
      changefreq: 'monthly',
      priority: '0.70',
    }];
  });

  const blogRows = rows.filter((row) => (
    row.collection === 'blog_posts'
    && isTrue(row.data?.is_active, true)
    && isTrue(row.data?.is_published)
    && String(row.data?.slug ?? '').trim()
    && hasVisibleContent(row.data?.content)
  ));
  const blogUrls = blogRows.map((row) => ({
    loc: `${SITE_URL}/blog/${String(row.data.slug).trim()}`,
    lastmod: newestDate(row.updated_at, row.data?.updated_at, row.data?.published_at),
    changefreq: 'monthly',
    priority: '0.70',
  }));

  const blogLastmod = newestDate(...blogUrls.map((url) => url.lastmod));
  const servicesLastmod = newestDate(...serviceUrls.map((url) => url.lastmod));
  const fixedUrls = staticUrls({ blogLastmod, servicesLastmod });
  const dynamicUrls = [...blogUrls, ...serviceUrls];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '',
    ...[...fixedUrls, ...dynamicUrls].map(makeUrlTag),
    '',
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf8');
  console.log(`Generated sitemap.xml with ${fixedUrls.length + dynamicUrls.length} URLs.`);
};

main().catch((error) => {
  console.error('generate-sitemap failed:', error);
  process.exit(1);
});
