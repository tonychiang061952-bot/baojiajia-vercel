import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import ResourceCta from '../../components/feature/ResourceCta';
import { db as supabase } from '../../lib/database';
import { SEO } from '../../components/SEO';

/**
 * 關於我們。
 *
 * 改版前整頁沒有「人」——團隊區塊是關閉的，也沒有創辦人的照片或資歷，
 * 但每一篇文章的作者署名都連到這一頁。保險是 Google 定義的 YMYL 主題，
 * 官方文件明講「信任是最重要的」，作者署名要能連到看得出這個人是誰的頁面。
 */

type AboutContent = {
  mission_title: string;
  content_value: string;
  intro_visible: boolean;
};

type CoreValue = { id: string; title: string; description: string };
type Stat = { id: string; label: string; value: string; display_order: number };

const FALLBACK_STORY = [
  '哈囉～我是保家佳的昊恩，是一位保險經紀人業務。深耕保險業多年，在 Instagram 上累積分享超過 200 篇保險知識文章，希望能夠降低與消費者之間的資訊落差，保障你們「知的權利」。',
  '在保險市場上，因為有成千上萬的商品、密密麻麻的條款、艱澀難懂的專業術語，又甚至是一些不公開的銷售話術⋯⋯等。導致一般人想要看懂保險真的是困難重重！也因此保險業總是被說是個「水很深」的行業。',
  '可是，如果想找保險業務了解，每一個業務各說各的好，是真是假難以分辨！又或是怕找了業務會遇到強迫推銷、人情壓力的問題。',
  '保家佳的成立，就是希望能創造一個沒有推銷壓力的知識環境，我們希望用白話文的說明讓保險變得簡單易懂，也陪著你破解那些討人厭的話術！我們相信，唯有真正了解保險，才能做出最適合自己的決策。',
  '我們也希望能陪伴你走過人生每個重要的階段，為你和家人建立最完善的保障。',
  '我們不只是能協助你比較多家商品，我們會依據你的需求，在保險市場上找尋最適合你的規劃方式。',
];

const FALLBACK_STATS: { label: string; value: string }[] = [
  { value: '7 年', label: '保險業年資' },
  { value: '1.6 萬+', label: 'IG 追蹤人數' },
  { value: '200+', label: 'IG 知識貼文' },
  { value: '500+', label: '服務過的客戶' },
];

const FALLBACK_VALUES = [
  { title: '知識分享', description: '透過淺顯易懂的內容，讓保險知識不再是專業術語，而是每個人都能理解的生活常識。' },
  { title: '真誠服務', description: '不推銷、不話術，用真心傾聽客戶需求，提供最適合的保險建議。' },
  { title: '專業透明', description: '保單條款、費用結構完全透明，用專業知識為客戶把關每一份保單。' },
  { title: '社群互動', description: '透過 Instagram 與客戶互動，建立保險知識社群，一起學習成長。' },
];

// 這三句是這一段的骨架：問題 → 我們的解法 → 我們的信念。標多了就等於沒有重點。
const EMPHASIS = [
  '「水很深」的行業',
  '沒有推銷壓力的知識環境',
  '唯有真正了解保險，才能做出最適合自己的決策',
];

function withEmphasis(text: string) {
  // 同一段裡可能有兩句要標（「沒有推銷壓力的知識環境」和「唯有真正了解保險…」
  // 就在同一段），所以要全部掃過，不能只找第一個。
  const parts: (string | React.ReactElement)[] = [text];
  EMPHASIS.forEach((phrase, pi) => {
    for (let i = parts.length - 1; i >= 0; i--) {
      const chunk = parts[i];
      if (typeof chunk !== 'string' || !chunk.includes(phrase)) continue;
      const [before, ...rest] = chunk.split(phrase);
      parts.splice(i, 1,
        before,
        <em key={`em-${pi}`} className="not-italic font-bold text-teal-600">{phrase}</em>,
        rest.join(phrase),
      );
    }
  });
  return <>{parts.map((part, i) => <Fragment key={i}>{part}</Fragment>)}</>;
}

export default function About() {
  const [story, setStory] = useState<string[]>(FALLBACK_STORY);
  const [coreValues, setCoreValues] = useState(FALLBACK_VALUES);
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [instagram, setInstagram] = useState('https://www.instagram.com/baojia_jia/');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [about, values, statRows, settings] = await Promise.all([
          supabase.from('about_content').select('*').single(),
          supabase.from('core_values').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          supabase.from('statistics').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          supabase.from('site_settings').select('setting_key, setting_value'),
        ]);
        if (!alive) return;

        const content = (about.data as AboutContent | null)?.content_value;
        if (content?.trim()) {
          const paragraphs = content.split(/\r?\n/).map((p) => p.trim()).filter(Boolean);
          // 開場的自我介紹寫在程式碼裡，後面接資料庫的成立初衷，最後是收尾。
          if (paragraphs.length) setStory([FALLBACK_STORY[0], ...paragraphs, FALLBACK_STORY[FALLBACK_STORY.length - 1]]);
        }
        if ((values.data as CoreValue[])?.length) setCoreValues(values.data as CoreValue[]);
        if ((statRows.data as Stat[])?.length) setStats(statRows.data as Stat[]);
        const ig = (settings.data as any[])?.find((r) => r.setting_key === 'instagram_url')?.setting_value;
        if (ig) setInstagram(ig);
      } catch (error) {
        console.error('About content failed to load:', error);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title="關於保家佳 | 保險知識分享"
        description="保家佳致力於創造沒有推銷壓力的保險知識環境。我們提供專業、客觀的保險諮詢，協助你破解保險話術，找到最適合自己的保障。"
        keywords={['關於保家佳', '保險顧問', '保險諮詢', '核心價值']}
        url="/about"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              name: '保家佳',
              url: 'https://baojiajia.tw',
              logo: 'https://baojiajia.tw/logo.png',
              sameAs: ['https://www.instagram.com/baojia_jia/', 'https://www.facebook.com/Baojiajia.tw'],
              founder: { '@type': 'Person', name: '昊恩', jobTitle: '保家佳創辦人' },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://baojiajia.tw/' },
                { '@type': 'ListItem', position: 2, name: '關於我們' },
              ],
            },
          ],
        }}
      />
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-11 border-b border-cream-300">
          <h1 className="font-serif text-[1.8rem] sm:text-4xl font-bold text-cream-900 leading-[1.4]">關於保家佳</h1>
          <p className="mt-4 text-base leading-[1.9] text-cream-600 max-w-[40rem]">
            我們相信「保險」是保護「家庭」的「最佳」工具。名字就是這樣來的。
          </p>
        </header>

        <section className="py-13 sm:py-14">
          <div className="rounded-lg border border-cream-300 bg-white px-6 py-8 sm:px-10 sm:py-9">
            <h2 className="font-serif text-[1.35rem] sm:text-[1.7rem] font-bold text-cream-900 leading-snug mb-5 pb-5 border-b border-cream-300">
              保家佳的成立初衷
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_272px] gap-9 lg:gap-12 items-center">
              {/* 這裡不要再加寬度上限。格線已經算好剩下多少空間，
                  再壓一層 max-width 只會讓文字擠成一長條、右邊空一大片。 */}
              <div>
                {story.map((paragraph) => (
                  <p key={paragraph.slice(0, 14)} className="mb-4 last:mb-0 text-[1.06rem] leading-[1.95] text-cream-900">
                    {withEmphasis(paragraph)}
                  </p>
                ))}
              </div>

              <div>
                <span className="block overflow-hidden rounded-md border border-cream-300 bg-gradient-to-b from-teal-50 to-cream-100">
                  <img
                    src="/images/team/haoen.webp"
                    alt="保家佳創辦人昊恩"
                    width={620}
                    height={826}
                    className="w-full aspect-[4/5] object-contain object-bottom"
                  />
                </span>
                <h3 className="font-serif text-[1.3rem] font-bold text-cream-900 mt-4 mb-1.5">昊恩</h3>

                {/* 頭銜與 IG 同一行。欄寬 272px，兩個加起來放得下。 */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  <p className="text-[0.88rem] font-semibold text-teal-600 whitespace-nowrap">保家佳創辦人</p>

                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-100 py-1 pl-1 pr-3 text-[0.78rem] font-semibold text-cream-900 whitespace-nowrap hover:border-teal-600 hover:text-teal-600 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white"
                          style={{ background: 'linear-gradient(135deg,#C13584,#E1306C,#F77737)' }}>
                      IG
                    </span>
                    @baojia_jia
                  </a>
                </div>

                <ul className="mt-4 pt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-cream-300">
                  {stats.map((stat) => (
                    <li key={stat.label}>
                      <b className="block font-serif text-[1.2rem] font-bold text-teal-600 leading-tight whitespace-nowrap">
                        {stat.value}
                      </b>
                      <span className="block text-[0.75rem] leading-snug text-cream-600 mt-1 whitespace-nowrap">
                        {stat.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white border-t border-cream-300 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-[1.4rem] font-bold text-cream-900 mb-1.5">我們的核心價值</h2>
          <p className="text-[0.92rem] text-cream-600 mb-7">這些價值觀是保家佳的根基。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value, index) => (
              <div
                key={value.title}
                className={`max-sm:py-4 max-sm:border-t max-sm:border-cream-200 sm:px-6 lg:px-6
                            ${index === 0 ? 'sm:pl-0 max-sm:border-t-0' : 'sm:border-l sm:border-cream-200'}
                            ${index === 2 ? 'lg:border-l lg:pl-6' : ''}`}
              >
                <span className="block font-mono text-[0.75rem] text-cream-500 mb-2">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <b className="block text-[1.05rem] font-bold text-cream-900 mb-2">{value.title}</b>
                <p className="text-[0.85rem] leading-[1.8] text-cream-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <ResourceCta
          heading="我想提供給你的資源："
          intro={['看完之後如果覺得我們的想法跟你合得來，這裡有兩個不用先聯絡任何人就能開始的入口。']}
        />
      </div>

      <Footer />
    </div>
  );
}
