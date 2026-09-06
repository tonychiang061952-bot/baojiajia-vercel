import { sql } from './_lib/neon.js';
import { consumeRateLimit } from './_lib/rateLimit.js';

// 「今天」一律以台北時間計算：伺服器跑在 UTC，不換算的話計數器會在早上八點歸零。
const TAIPEI_TODAY = "(now() at time zone 'Asia/Taipei')::date";

// 爬蟲會把數字灌大到沒有意義。這裡只擋明確表明身分的機器人；
// 偽裝成瀏覽器的爬蟲擋不掉，但那類流量本來就不多。
const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|outbrain|pinterest|vkshare|w3c_validator|headlesschrome|lighthouse|gtmetrix|pingdom|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|ccbot|claudebot|perplexity/i;

function userAgent(request: any): string {
  const raw = request.headers?.['user-agent'];
  return (Array.isArray(raw) ? raw[0] : raw) || '';
}

async function readTotals() {
  const rows = (await sql.query(
    `select
       coalesce(sum(hits), 0)::bigint as total,
       coalesce(sum(hits) filter (where day = ${TAIPEI_TODAY}), 0)::bigint as today
     from page_views`,
  )) as Record<string, any>[];
  const row = rows[0] || {};
  return { today: Number(row.today ?? 0), total: Number(row.total ?? 0) };
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // 計數器不該被快取，否則所有人看到同一個凍結的數字。
  response.setHeader('Cache-Control', 'no-store');

  try {
    // GET 只讀不寫，給沒有要計數的呼叫端用。
    if (request.method === 'GET') {
      return response.status(200).json(await readTotals());
    }

    // 機器人照樣拿得到數字，只是不列入計算。
    if (BOT.test(userAgent(request))) {
      return response.status(200).json({ ...(await readTotals()), counted: false });
    }

    // 同一個 IP 每分鐘最多 10 次，擋掉腳本灌水。超過就退回唯讀。
    const allowed = await consumeRateLimit(request, 'pageviews', 10, 60);
    if (!allowed) {
      return response.status(200).json({ ...(await readTotals()), counted: false });
    }

    const rows = (await sql.query(
      `insert into page_views (day, hits) values (${TAIPEI_TODAY}, 1)
       on conflict (day) do update set hits = page_views.hits + 1
       returning hits`,
    )) as Record<string, any>[];

    const totals = await readTotals();
    return response.status(200).json({ ...totals, counted: true, todayRows: Number(rows[0]?.hits ?? 0) });
  } catch (error) {
    return response.status(500).json({
      error: { message: error instanceof Error ? error.message : 'Unable to read page views' },
    });
  }
}
