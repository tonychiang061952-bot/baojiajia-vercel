import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { neon } from '@neondatabase/serverless';

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch {
    // Deployment environments provide DATABASE_URL directly.
  }
}

const SITE_URL = 'https://baojiajia.tw';
const OUT_DIR = new URL('../out/', import.meta.url);
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for prerendering');

const sql = neon(databaseUrl);
const builtTemplate = await readFile(new URL('index.html', OUT_DIR), 'utf8');
const template = builtTemplate
  .replace(/\s*<title data-rh="true">[\s\S]*?<\/title>/g, '')
  .replace(/\s*<(?:meta|link) data-rh="true"[^>]*>/g, '')
  .replace(/\s*<script data-rh="true"[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/\s*<style id="seo-prerender-style">[\s\S]*?<\/style>/g, '');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const absoluteUrl = (value, fallback = '') => {
  const candidate = String(value || fallback).trim();
  if (!candidate) return '';
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return `${SITE_URL}${candidate.startsWith('/') ? candidate : `/${candidate}`}`;
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

const safeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');
// 靜態快照也要輸出 BreadcrumbList，否則會跟 React 端渲染出來的結構化資料不一致。
const crumbs = (...trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首頁', item: `${SITE_URL}/` },
    ...trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: t.name,
      ...(t.path ? { item: `${SITE_URL}${t.path}` } : {}),
    })),
  ],
});

const routeUrl = (path) => `${SITE_URL}${path === '/' ? '/' : path}`;

const rows = await sql.query(
  `select id::text, collection, data, created_at, updated_at
   from app_records
   where collection = any($1::text[])
   order by created_at asc`,
  [[
    'about_content', 'blog_posts', 'features', 'hero_carousel', 'homepage_content',
    'navigation_items', 'service_details', 'service_items',
  ]],
);

// Preserve collection names after flattening the JSON records.
const recordsByCollection = new Map();
for (const row of rows) {
  const record = {
    ...(row.data ?? {}),
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
  const current = recordsByCollection.get(row.collection) || [];
  current.push(record);
  recordsByCollection.set(row.collection, current);
}

const collection = (name) => recordsByCollection.get(name) || [];
const serviceDetails = new Map(collection('service_details').map((detail) => [String(detail.service_id), detail]));
const services = collection('service_items')
  .filter((service) => isTrue(service.is_active, true))
  .map((service) => ({ ...service, detail: serviceDetails.get(String(service.id)) }))
  .filter((service) => service.slug && hasVisibleContent(service.detail?.content))
  .sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0));
const posts = collection('blog_posts')
  .filter((post) => (
    isTrue(post.is_active, true)
    && isTrue(post.is_published)
    && post.slug
    && hasVisibleContent(post.content)
  ))
  .sort((a, b) => new Date(b.updated_at || b.published_at).getTime() - new Date(a.updated_at || a.published_at).getTime());

const features = collection('features')
  .filter((feature) => isTrue(feature.is_active, true))
  .sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0));

const homepageValues = Object.fromEntries(
  collection('homepage_content').map((item) => [item.content_key, item.content_value]),
);
const aboutIntro = collection('about_content').find((item) => item.content_key === 'about_intro')?.content_value || '';

const navigation = () => `
  <header class="seo-static-header">
    <a class="seo-static-brand" href="/">保家佳</a>
    <nav aria-label="主要導覽">
      <a href="/">首頁</a>
      <a href="/services">服務項目</a>
      <a href="/beginner">保險新手村</a>
      <a href="/analysis">需求分析 DIY</a>
      <a href="/blog">知識專區</a>
      <a href="/about">關於我們</a>
      <a href="/contact">聯絡我們</a>
    </nav>
  </header>`;

const footer = () => `
  <footer class="seo-static-footer">
    <p>保家佳｜用知識守護每個家庭，讓保險不再艱澀難懂</p>
    <p>保家佳 All rights reserved.</p>
    <p><a href="/privacy">隱私權政策</a>　<a href="/terms">服務條款</a></p>
  </footer>`;

const layout = (content) => `
  <div class="seo-static-snapshot">
    ${navigation()}
    <main>${content}</main>
    ${footer()}
  </div>`;

const cardList = (items) => `<div class="seo-static-grid">${items.join('')}</div>`;

const beginnerContent = JSON.parse(
  await readFile(new URL('../src/data/beginner-content.json', import.meta.url), 'utf8'),
);

const beginnerSnapshot = () => {
  const types = beginnerContent.insuranceTypes.map((type) => `
      <section id="type-${escapeHtml(type.id)}">
        <h3>${escapeHtml(type.name)}</h3>
        <p>${escapeHtml(type.description)}</p>
        <h4>保障內容</h4>
        <ul>${type.coverage.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <h4>重點提醒</h4>
        <ul>${type.keyPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <h4>專家小提醒</h4>
        <ul>${type.tips.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>`).join('');

  const comparison = beginnerContent.comparisonData.map((row) => `
        <tr><th scope="row">${escapeHtml(row.aspect)}</th><td>${escapeHtml(row.singleCompany)}</td><td>${escapeHtml(row.broker)}</td></tr>`).join('');

  const faq = beginnerContent.faqs.map((item) => `
      <h3>${escapeHtml(item.question)}</h3>
      <p>${escapeHtml(item.answer)}</p>`).join('');

  return `
      <h1>保險新手村</h1>
      <p class="seo-static-lead">從零開始，輕鬆了解保險知識。</p>
      <h2>認識六大保障</h2>
      <p>人身保險主要分為六大類，每種保障都有其重要性。</p>${types}
      <h2>該找誰規劃？</h2>
      <p>選對專業顧問，讓保險規劃更完善。以下比較單一公司業務與保險經紀人業務的差異。</p>
      <table>
        <thead><tr><th scope="col">比較項目</th><th scope="col">單一公司業務</th><th scope="col">保險經紀人業務</th></tr></thead>
        <tbody>${comparison}
        </tbody>
      </table>
      <h2>常見問題解答</h2>
      <p>解答保險新手最常遇到的疑問。</p>${faq}
      <a class="seo-static-cta" href="/analysis">試算自己的保險需求</a>`;
};
const pageSchema = (path, title, description) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: routeUrl(path),
});

// 一頁可能同時有 WebPage 與 BreadcrumbList（或首頁的 Organization）。
// 兩個獨立的 <script> 也可以，但併成一個 @graph 比較好讓爬蟲把它們視為同一頁的敘述。
const withPageSchema = (page) => {
  const base = pageSchema(page.path, page.title, page.description);
  if (!page.schema) return base;
  const drop = ({ '@context': _ignored, ...rest }) => rest;
  const extra = page.schema['@graph'] ? page.schema['@graph'] : [drop(page.schema)];
  return { '@context': 'https://schema.org', '@graph': [drop(base), ...extra] };
};

const prerenderStyle = `
  <style id="seo-prerender-style">
    .seo-static-snapshot{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1f2937;background:#fff;line-height:1.75}
    .seo-static-header,.seo-static-footer{padding:20px max(24px,calc((100% - 1120px)/2));background:#fff;border-bottom:1px solid #e5e7eb}
    .seo-static-header{display:flex;gap:28px;align-items:center;justify-content:space-between;flex-wrap:wrap}
    .seo-static-brand{font-size:24px;font-weight:800;color:#0f766e;text-decoration:none}
    .seo-static-header nav{display:flex;gap:18px;flex-wrap:wrap}.seo-static-header a,.seo-static-footer a{color:#374151;text-decoration:none}
    .seo-static-snapshot main{max-width:1120px;margin:0 auto;padding:56px 24px}.seo-static-snapshot h1{font-size:clamp(32px,5vw,52px);line-height:1.2;margin:0 0 20px}
    .seo-static-snapshot h2{font-size:28px;line-height:1.3;margin:40px 0 16px}.seo-static-snapshot h3{font-size:21px;line-height:1.4;margin:26px 0 10px}
    .seo-static-snapshot p,.seo-static-snapshot li{font-size:17px}.seo-static-snapshot img{max-width:100%;height:auto}
    .seo-static-lead{font-size:20px!important;color:#4b5563;max-width:800px}.seo-static-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin:30px 0}
    .seo-static-card{display:block;padding:22px;border:1px solid #e5e7eb;border-radius:16px;color:inherit;text-decoration:none}.seo-static-card h2,.seo-static-card h3{margin-top:0}
    .seo-static-cta{display:inline-block;margin-top:20px;padding:12px 20px;border-radius:10px;background:#0d9488;color:#fff!important;text-decoration:none}
    .seo-static-footer{border-top:1px solid #e5e7eb;border-bottom:0;background:#111827;color:#d1d5db}.seo-static-footer a{color:#d1d5db}
    @media(max-width:760px){.seo-static-header nav{gap:12px;font-size:14px}.seo-static-snapshot main{padding-top:36px}}
  </style>`;

function headMarkup(page) {
  const canonical = routeUrl(page.path);
  const image = absoluteUrl(page.image, '/hero.png');
  const tags = [
    `<title data-rh="true">${escapeHtml(page.title)}</title>`,
    `<meta data-rh="true" name="description" content="${escapeHtml(page.description)}">`,
    page.noindex ? '<meta data-rh="true" name="robots" content="noindex, nofollow">' : null,
    `<link data-rh="true" rel="canonical" href="${escapeHtml(page.canonical || canonical)}">`,
    `<meta data-rh="true" property="og:type" content="${page.type === 'article' ? 'article' : 'website'}">`,
    `<meta data-rh="true" property="og:url" content="${escapeHtml(page.canonical || canonical)}">`,
    `<meta data-rh="true" property="og:title" content="${escapeHtml(page.title)}">`,
    `<meta data-rh="true" property="og:description" content="${escapeHtml(page.description)}">`,
    `<meta data-rh="true" property="og:image" content="${escapeHtml(image)}">`,
    '<meta data-rh="true" property="og:site_name" content="保家佳">',
    '<meta data-rh="true" name="twitter:card" content="summary_large_image">',
    `<meta data-rh="true" name="twitter:title" content="${escapeHtml(page.title)}">`,
    `<meta data-rh="true" name="twitter:description" content="${escapeHtml(page.description)}">`,
    `<meta data-rh="true" name="twitter:image" content="${escapeHtml(image)}">`,
    page.publishedTime ? `<meta data-rh="true" property="article:published_time" content="${escapeHtml(page.publishedTime)}">` : null,
    page.modifiedTime ? `<meta data-rh="true" property="article:modified_time" content="${escapeHtml(page.modifiedTime)}">` : null,
    page.schema ? `<script data-rh="true" type="application/ld+json">${safeJson(page.schema)}</script>` : null,
    prerenderStyle,
  ];
  return tags.filter(Boolean).join('\n  ');
}

function renderHtml(page) {
  const withHead = template.replace('</head>', `  ${headMarkup(page)}\n</head>`);
  const root = `<div id="root" data-prerendered="true">${page.snapshot}</div>\n</body>`;
  const rootPattern = /<div id="root"(?:\s+data-prerendered="true")?>[\s\S]*<\/body>/;
  if (!rootPattern.test(withHead)) throw new Error(`Unable to inject prerendered body for ${page.path}`);
  return withHead.replace(rootPattern, root);
}

async function writeRoute(page) {
  const relativeFile = page.path === '/' ? 'index.html' : `${page.path.replace(/^\//, '')}.html`;
  const file = join(OUT_DIR.pathname, relativeFile);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, renderHtml(page), 'utf8');
  console.log(`Prerendered ${page.path}`);
}

const staticPages = [
  {
    path: '/',
    title: '保家佳 | 保險理財知識分享',
    description: '致力於保險知識分享及提供專業的保險諮詢服務。透過淺顯易懂的方式，讓您真正了解保險、善用保險，為家人建立完整的保護網。',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: '保家佳',
      url: `${SITE_URL}/`,
      // logo 要放真正的品牌 logo，尺寸也要跟檔案相符；hero.png 是 1920×1080 的主視覺，不是 logo。
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 256,
        height: 253,
      },
      description: '致力於保險知識分享及提供專業的保險諮詢服務。',
      sameAs: [
        'https://www.instagram.com/baojia_jia/',
        'https://www.facebook.com/Baojiajia.tw',
      ],
    },
    snapshot: layout(`
      <h1>${escapeHtml([homepageValues.hero_title, homepageValues.hero_subtitle].filter(Boolean).join('｜') || '保家佳')}</h1>
      <p class="seo-static-lead">${escapeHtml(homepageValues.hero_description || '用知識守護每個家庭，讓保險不再艱澀難懂。')}</p>
      <h2>服務項目</h2>
      ${cardList(services.map((service) => `<a class="seo-static-card" href="/services/${escapeHtml(service.slug)}"><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.description)}</p></a>`))}
      <h2>保家佳的服務特點</h2>
      ${cardList(features.map((feature) => `<div class="seo-static-card"><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.description)}</p></div>`))}
      <a class="seo-static-cta" href="/analysis">立即開始需求分析</a>`),
  },
  {
    path: '/services',
    title: '專業保險服務項目 | 保家佳',
    schema: crumbs({ name: '服務項目' }),
    description: '提供全方位的專業保險服務，包括保單健診、醫療保障規劃、退休理財方案等，為您的未來提供最完善的保障。',
    snapshot: layout(`
      <h1>我們的服務</h1>
      <p class="seo-static-lead">每個人的狀況不一樣，需要處理的問題也不一樣。依照你現在的位置，找到最接近的那一個。</p>
      ${cardList(services.map((service) => `<a class="seo-static-card" href="/services/${escapeHtml(service.slug)}"><h2>${escapeHtml(service.title)}</h2><p>${escapeHtml(service.description)}</p></a>`))}
      <a class="seo-static-cta" href="/contact">立即諮詢</a>`),
  },
  {
    path: '/blog',
    title: '保險知識專區 | 保家佳',
    schema: crumbs({ name: '保險知識專區' }),
    description: '最專業的保險知識分享，包含醫療險、意外險、儲蓄險等各類保險理財觀念，讓您輕鬆搞懂保險。',
    snapshot: layout(`
      <h1>保險知識分享</h1>
      <p class="seo-static-lead">用淺顯易懂的方式，讓保險不再艱澀難懂。</p>
      ${cardList(posts.map((post) => `<a class="seo-static-card" href="/blog/${escapeHtml(post.slug)}"><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.excerpt)}</p></a>`))}`),
  },
  {
    path: '/beginner',
    title: '保險新手村 - 從零開始了解保險 | 保家佳',
    schema: crumbs({ name: '保險新手村' }),
    description: '專為保險新手設計的入門指南，介紹壽險、醫療險、意外險等六大保障，教您如何規劃最適合自己的保險方案。',
    snapshot: layout(beginnerSnapshot()),
  },
  {
    path: '/analysis',
    title: '保險需求分析 DIY | 保家佳',
    description: '透過簡單的問卷，快速分析您的保險需求，量身打造專屬於您的保障藍圖。',
    schema: crumbs({ name: '需求分析 DIY' }),
    snapshot: layout('<h1>保險需求分析 DIY</h1><p class="seo-static-lead">透過問卷盤點家庭責任、醫療、收入中斷、壽險與長期照顧等保障需求。</p><p>分析結果僅供初步規劃參考，實際投保仍應依個人狀況與正式契約條款確認。</p>'),
  },
  {
    path: '/about',
    title: '關於我們 - 保家佳 | 您的家庭保險顧問',
    schema: crumbs({ name: '關於我們' }),
    description: '保家佳致力於創造沒有推銷壓力的保險知識環境。我們提供專業、客觀的保險諮詢，協助您破解保險話術，找到最適合自己的保障。',
    snapshot: layout(`<h1>保家佳的命名由來</h1><p class="seo-static-lead">${escapeHtml(aboutIntro || '保家佳希望用清楚、客觀的資訊，協助每個家庭理解保障與規劃選擇。')}</p><h2>我們的核心價值</h2><p>提供對等、客觀、正確的資訊，降低保險市場中的資訊落差。</p>`),
  },
  {
    path: '/contact',
    title: '聯絡我們 - 免費保險諮詢 | 保家佳',
    schema: crumbs({ name: '聯絡我們' }),
    description: '有任何保險問題？歡迎預約免費諮詢。我們的專業團隊將為您提供客觀、專業的保險建議。',
    snapshot: layout('<h1>聯絡我們</h1><p class="seo-static-lead">有任何保險問題，歡迎留下需求，讓保家佳協助您釐清保障與規劃方向。</p><h2>立即預約免費諮詢</h2><p>請在互動頁面載入後填寫聯絡表單，或透過官方社群管道與我們聯繫。</p>'),
  },
  {
    path: '/terms',
    title: '服務條款 | 保家佳',
    description: '保家佳服務條款說明，包含服務內容、使用者義務、免責聲明等重要資訊。',
    snapshot: layout('<h1>服務條款</h1><h2>條款接受</h2><p>使用本網站即表示您同意遵守本網站公布的服務條款。</p><h2>服務內容與免責聲明</h2><p>網站資訊用於一般性知識與初步規劃參考，實際權利義務以正式契約及適用規範為準。</p><h2>聯絡我們</h2><p>對服務條款有任何疑問，請透過聯絡頁與保家佳聯繫。</p>'),
  },
  {
    path: '/privacy',
    title: '隱私權政策 | 保家佳',
    description: '保家佳隱私權保護政策說明，我們重視您的隱私權，並致力於保護您的個人資料安全。',
    snapshot: layout('<h1>隱私權政策</h1><h2>個人資料的蒐集、處理及利用</h2><p>保家佳依網站服務需要蒐集與處理必要資料，並採取合理措施保護資料安全。</p><h2>Cookie 與政策修正</h2><p>網站可能使用 Cookie 改善服務；政策更新時將於本頁公告。</p>'),
  },
];

for (const page of staticPages) {
  page.schema = withPageSchema(page);
  await writeRoute(page);
}

for (const service of services) {
  const path = `/services/${service.slug}`;
  await writeRoute({
    path,
    title: `${service.title} | 保家佳專業服務`,
    description: service.description,
    image: service.detail?.hero_image_url || service.image_url,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          name: service.title,
          description: service.description,
          url: `${SITE_URL}${path}`,
          provider: { '@type': 'Organization', name: '保家佳', url: SITE_URL },
          serviceType: service.title,
        },
        crumbs({ name: '服務項目', path: '/services' }, { name: service.title }),
      ],
    },
    snapshot: layout(`
      <p><a href="/services">服務項目</a></p>
      <h1>${escapeHtml(service.title)}</h1>
      <p class="seo-static-lead">${escapeHtml(service.description)}</p>
      <article>${service.detail.content}</article>
      <a class="seo-static-cta" href="/contact">立即諮詢</a>`),
  });
}

for (const post of posts) {
  const path = `/blog/${post.slug}`;
  const canonical = `${SITE_URL}${path}`;
  const page = {
    path,
    canonical,
    type: 'article',
    title: `${post.title} | 保家佳保險知識`,
    description: post.meta_description || post.excerpt,
    image: post.image_url,
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
    // 用 @graph 同時宣告文章與麵包屑。Breadcrumb 是 Google 仍支援的 rich result，
    // 而預渲染的靜態 HTML 是 Google 先讀到的那一份，所以要在這裡也補上，
    // 不能只加在 React 元件裡。
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: post.title,
          image: post.image_url ? [absoluteUrl(post.image_url)] : [],
          datePublished: post.published_at,
          // 用「實質更新日」而不是資料庫的最後寫入時間；
          // 改錯字不該對 Google 宣稱這篇文章更新過。
          dateModified: post.content_updated_at || post.published_at,
          author: { '@type': 'Organization', name: post.author || '保家佳', url: `${SITE_URL}/about` },
          publisher: { '@type': 'Organization', name: '保家佳', url: SITE_URL },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: '知識專區', item: `${SITE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: post.category },
          ],
        },
      ],
    },
    snapshot: layout(`
      <p><a href="/">首頁</a> › <a href="/blog">知識專區</a> › ${escapeHtml(post.category)}</p>
      <article>
        <h1>${escapeHtml(post.title)}</h1>
        <p>作者：${escapeHtml(post.author || '保家佳')}　發布日期：${escapeHtml(String(post.published_at || '').slice(0, 10))}</p>
        ${post.excerpt ? `<p class="seo-static-lead">${escapeHtml(post.excerpt)}</p>` : ''}
        ${post.content}
      </article>`),
  };
  await writeRoute(page);

  // Legacy ID URLs remain readable but declare the slug URL as canonical.
  await writeRoute({ ...page, path: `/blog/id/${post.id}`, canonical });
}

for (const adminPath of ['/admin', '/admin/login']) {
  await writeRoute({
    path: adminPath,
    title: adminPath.endsWith('/login') ? '管理員登入 | 保家佳' : '網站管理後台 | 保家佳',
    description: '保家佳網站管理區域。',
    noindex: true,
    snapshot: '<div class="seo-static-snapshot"><main><h1>網站管理區域</h1><p>此頁面不提供搜尋引擎索引。</p></main></div>',
  });
}

await writeRoute({
  path: '/404',
  canonical: `${SITE_URL}/404`,
  title: '404 找不到頁面 | 保家佳',
  description: '抱歉，您要查看的頁面不存在。',
  noindex: true,
  snapshot: layout('<h1>404 找不到頁面</h1><p>抱歉，您要查看的頁面不存在。</p><a class="seo-static-cta" href="/">返回首頁</a>'),
});
await writeFile(new URL('404.html', OUT_DIR), renderHtml({
  path: '/404',
  canonical: `${SITE_URL}/404`,
  title: '404 找不到頁面 | 保家佳',
  description: '抱歉，您要查看的頁面不存在。',
  noindex: true,
  snapshot: layout('<h1>404 找不到頁面</h1><p>抱歉，您要查看的頁面不存在。</p><a class="seo-static-cta" href="/">返回首頁</a>'),
}), 'utf8');

console.log(`Prerendered ${staticPages.length + services.length + (posts.length * 2) + 3} route files.`);
