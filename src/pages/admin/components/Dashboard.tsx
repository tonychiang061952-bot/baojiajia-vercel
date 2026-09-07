import { useEffect, useState } from 'react';
import { db as supabase } from '../../../lib/database';

/**
 * 後台首頁。
 *
 * 這裡的數字全部是即時查出來的，沒有寫死的假資料——
 * 後台的重點是讓你一眼看出「現在網站是什麼狀態」，
 * 顯示一個看起來很漂亮但不準的數字比不顯示還糟。
 * 查不到的項目會直接說查不到，不會猜。
 */

type Stat = { key: string; value: string; note: string };
type RecentRow = { title: string; when: string; sort: number };
type StatusRow = { ok: boolean; text: React.ReactNode };

const TZ = 'zh-TW';

/** 今天 / 09-06 這種好讀的短日期。 */
function shortDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return '今天';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return '昨天';
  return d.toLocaleDateString(TZ, { month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

export default function Dashboard({ onGo }: { onGo?: (id: string) => void }) {
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [status, setStatus] = useState<StatusRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [posts, services, reviews, downloads, categories] = await Promise.all([
          supabase.from('blog_posts').select('*'),
          supabase.from('service_items').select('*'),
          supabase.from('customer_reviews').select('*'),
          supabase.from('member_submissions').select('*'),
          supabase.from('blog_categories').select('*'),
        ]);

        if (!alive) return;

        const postRows: any[] = posts.data || [];
        const serviceRows: any[] = services.data || [];
        const reviewRows: any[] = reviews.data || [];
        const downloadRows: any[] = downloads.data || [];
        const categoryRows: any[] = categories.data || [];

        const now = new Date();
        const live = postRows.filter((p) => {
          if (p.is_active === false || p.is_published === false) return false;
          if (!p.published_at) return true;
          return new Date(p.published_at) <= now;
        });
        const hidden = postRows.length - live.length;

        const activeServices = serviceRows.filter((s) => s.is_active !== false);
        const pendingReviews = reviewRows.filter((r) => !r.is_approved);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = downloadRows.filter((d) => d.created_at && new Date(d.created_at) >= monthStart);

        setStats([
          {
            key: '公開文章',
            value: String(live.length),
            note: hidden > 0 ? `另有 ${hidden} 篇未公開` : '全部已公開',
          },
          {
            key: '服務項目',
            value: String(serviceRows.length),
            note: activeServices.length === serviceRows.length
              ? '全部啟用中'
              : `${serviceRows.length - activeServices.length} 個已停用`,
          },
          {
            key: '待審評價',
            value: String(pendingReviews.length),
            note: pendingReviews.length ? '審核後才會公開' : '沒有待處理的',
          },
          {
            key: '本月下載',
            value: String(thisMonth.length),
            note: '需求分析報告',
          },
        ]);

        // 最近編輯：文章與服務內容混在一起排，看的是「我最近動過什麼」
        const rows: RecentRow[] = [
          ...postRows.map((p) => ({
            title: p.title || '(未命名文章)',
            iso: p.content_updated_at || p.updated_at || p.published_at,
          })),
          ...serviceRows.map((s) => ({
            title: `${s.title || '(未命名服務)'}（服務項目）`,
            iso: s.updated_at,
          })),
        ]
          .filter((r) => r.iso)
          .map((r) => ({ title: r.title, when: shortDate(r.iso), sort: new Date(r.iso).getTime() }))
          .sort((a, b) => b.sort - a.sort)
          .slice(0, 5);
        setRecent(rows);

        // 網站狀態
        const list: StatusRow[] = [];

        if (pendingReviews.length) {
          list.push({
            ok: false,
            text: <>有 <b>{pendingReviews.length} 則評價待審核</b>，審核後才會出現在首頁。</>,
          });
        } else {
          list.push({ ok: true, text: <>評價沒有待審核的項目。</> });
        }

        // sitemap 直接抓線上那份來看，不用猜
        try {
          const xml = await fetch('/sitemap.xml', { cache: 'no-store' }).then((r) => r.text());
          const locs = xml.match(/<loc>/g)?.length ?? 0;
          const mods = [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1]).sort();
          const newest = mods.length ? mods[mods.length - 1].slice(0, 10) : null;
          list.push({
            ok: locs > 0,
            text: locs
              ? <>sitemap 共 <b>{locs}</b> 個網址{newest ? <>，最後更新 <b>{newest}</b></> : null}。</>
              : <>讀不到 sitemap.xml。</>,
          });
        } catch {
          list.push({ ok: false, text: <>讀不到 sitemap.xml。</> });
        }

        const empty = categoryRows
          .map((c) => ({
            name: c.name,
            count: postRows.filter((p) => p.category === c.name).length,
          }))
          .filter((c) => c.count === 0);
        if (empty.length) {
          list.push({
            ok: false,
            text: <><b>{empty.map((c) => c.name).join('、')}</b> {empty.length > 1 ? '這幾個' : '這個'}分類還是 0 篇，前台不會顯示。</>,
          });
        } else {
          list.push({ ok: true, text: <>每個分類都有文章。</> });
        }

        const noExcerpt = live.filter((p) => !p.excerpt?.trim()).length;
        if (noExcerpt) {
          list.push({
            ok: false,
            text: <>有 <b>{noExcerpt} 篇</b>公開文章沒有摘要，Google 會自己抓一段來當說明。</>,
          });
        }

        setStatus(list);
      } catch (error) {
        console.error('Dashboard 讀取失敗：', error);
        if (alive) setStats(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-cream-300 bg-white px-6 py-14 text-center text-[0.9rem] text-cream-500">
        <i className="ri-loader-4-line mr-2 animate-spin" />
        讀取中…
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-alert/30 bg-red-50 px-6 py-8 text-center text-[0.9rem] text-alert">
        讀不到資料，請重新整理看看。
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="rounded-lg border border-cream-300 bg-white px-5 py-4">
            <span className="text-[0.76rem] text-cream-600">{s.key}</span>
            <div className="mt-1.5 font-serif text-[1.85rem] font-bold leading-tight text-teal-600 tabular-nums">
              {s.value}
            </div>
            <div className="mt-1 text-[0.74rem] text-cream-500">{s.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-cream-300 bg-white px-5 py-5">
          <h2 className="mb-3.5 border-b border-cream-300 pb-3 text-[0.95rem] font-bold text-cream-900">
            最近編輯
          </h2>
          {recent.length ? (
            <ul>
              {recent.map((r) => (
                <li
                  key={r.title + r.sort}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-cream-200 py-2.5 text-[0.87rem] last:border-none last:pb-0"
                >
                  <b className="font-semibold leading-snug text-cream-900">{r.title}</b>
                  <time className="whitespace-nowrap text-[0.76rem] tabular-nums text-cream-500">{r.when}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.86rem] text-cream-500">還沒有編輯紀錄。</p>
          )}
        </section>

        <section className="rounded-lg border border-cream-300 bg-white px-5 py-5">
          <h2 className="mb-3.5 border-b border-cream-300 pb-3 text-[0.95rem] font-bold text-cream-900">
            網站狀態
          </h2>
          <ul className="flex flex-col gap-2.5">
            {status.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.87rem] leading-[1.7] text-cream-600">
                <span
                  className={`mt-[0.55em] h-[7px] w-[7px] flex-none rounded-full ${
                    s.ok ? 'bg-[#12A150]' : 'bg-brandgold-edge'
                  }`}
                />
                <span>{s.text}</span>
              </li>
            ))}
          </ul>
          {onGo && (
            <button
              onClick={() => onGo('customer-reviews')}
              className="mt-4 text-[0.83rem] font-semibold text-teal-600 hover:underline"
            >
              去看評價 →
            </button>
          )}
        </section>
      </div>
    </>
  );
}
