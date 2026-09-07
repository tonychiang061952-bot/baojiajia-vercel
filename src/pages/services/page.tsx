import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db as supabase } from '../../lib/database';
import { SEO } from '../../components/SEO';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import ResourceCta from '../../components/feature/ResourceCta';

/**
 * 服務項目。
 *
 * 舊版跟首頁的服務區塊幾乎一模一樣（同樣六張卡、同樣文案、同樣版型），
 * 對讀者和 Google 來說都沒有提供首頁沒有的東西。
 * 改成依「你現在在哪個位置」分成三種情況，這是首頁做不到的引導。
 */

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  slug: string;
  display_order: number;
};

const GROUPS = [
  {
    tag: '情況一',
    title: '已經買了保險，但不確定夠不夠',
    body: '先不用急著加買。把手上的保單攤開來看，往往會發現保費花在不需要的地方，而真正該補的缺口反而是空的。',
    slugs: ['policy-checkup'],
    wide: true,
    alt: false,
  },
  {
    tag: '情況二',
    title: '還沒規劃，看你現在在哪個階段',
    body: '同樣一份保障，給剛出生的孩子、給有房貸的爸媽、給準備退休的長輩，重點完全不同。年齡決定了什麼該先補、什麼可以晚一點。',
    slugs: ['children-protection', 'adult-protection', 'senior-protection'],
    wide: false,
    alt: true,
  },
  {
    tag: '情況三',
    title: '保障之外，還想處理錢的問題',
    body: '保險負責的是「出事的時候不要垮」，這兩項處理的是另一件事：沒出事的那幾十年，錢要怎麼安排。',
    slugs: ['savings-planning', 'retirement-planning'],
    wide: false,
    alt: false,
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('service_items').select('*')
          .eq('is_active', true).order('display_order', { ascending: true });
        setServices((data as ServiceItem[]) ?? []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const bySlug = (slug: string) => services.find((s) => s.slug === slug);

  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title="服務項目 | 保家佳"
        description="保單健診、幼兒／成人／銀髮保障諮詢、儲蓄理財與退休規劃。依照你現在的狀況，找到最接近的那一個。"
        keywords={['保險服務', '保單健診', '醫療保障', '退休規劃', '保險諮詢']}
        url="/services"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://baojiajia.tw/' },
            { '@type': 'ListItem', position: 2, name: '服務項目' },
          ],
        }}
      />
      <Navigation />

      <header className="border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-11">
          <h1 className="font-serif text-[1.75rem] sm:text-4xl font-bold text-cream-900 leading-[1.4]">我們的服務</h1>
          <p className="mt-4 text-base leading-[1.9] text-cream-600 max-w-[56ch]">
            每個人的狀況不一樣，需要處理的問題也不一樣。下面依照「你現在在哪個位置」分成三種情況，找到最接近你的那一個就可以了。
          </p>
        </div>
      </header>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-cream-600">載入中⋯⋯</div>
      ) : (
        GROUPS.map((group) => (
          <section
            key={group.tag}
            className={`py-14 ${group.alt ? 'bg-white border-y border-cream-300' : ''}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-7">
                <span className="inline-block rounded-sm bg-brandgold px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.16em] text-brandgold-ink mb-3">
                  {group.tag}
                </span>
                <h2 className="font-serif text-[1.4rem] font-bold text-cream-900 leading-snug">{group.title}</h2>
                <p className="mt-2 text-[0.92rem] leading-[1.85] text-cream-600 max-w-[52ch]">{group.body}</p>
              </div>

              {group.wide ? (
                group.slugs.map((slug) => {
                  const s = bySlug(slug);
                  if (!s) return null;
                  return (
                    <Link
                      key={slug}
                      to={`/services/${s.slug}`}
                      className={`grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)] overflow-hidden rounded-md border border-cream-300 hover:border-teal-600 transition-colors ${group.alt ? 'bg-cream-100' : 'bg-white'}`}
                    >
                      <div className="overflow-hidden bg-cream-200 max-md:aspect-[16/9]">
                        {s.image_url && <img src={s.image_url} alt={s.title} loading="lazy" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex flex-col justify-center px-7 py-7">
                        <h3 className="text-xl font-bold text-cream-900 mb-2.5">{s.title}</h3>
                        <p className="text-[0.92rem] leading-[1.85] text-cream-600">{s.description}</p>
                        <span className="mt-4 text-[0.88rem] font-semibold text-teal-600">閱讀完整介紹 →</span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${group.slugs.length === 3 ? 'lg:grid-cols-3' : ''}`}>
                  {group.slugs.map((slug) => {
                    const s = bySlug(slug);
                    if (!s) return null;
                    return (
                      <Link
                        key={slug}
                        to={`/services/${s.slug}`}
                        className={`flex flex-col overflow-hidden rounded-md border border-cream-300 hover:border-teal-600 transition-colors ${group.alt ? 'bg-cream-100' : 'bg-white'}`}
                      >
                        <div className="aspect-[16/9] overflow-hidden bg-cream-200">
                          {s.image_url && <img src={s.image_url} alt={s.title} loading="lazy" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex flex-1 flex-col px-5 py-5">
                          <h3 className="text-[1.08rem] font-bold text-cream-900 mb-2">{s.title}</h3>
                          <p className="text-[0.86rem] leading-[1.8] text-cream-600">{s.description}</p>
                          <span className="mt-auto pt-4 text-[0.85rem] font-semibold text-teal-600">閱讀完整介紹 →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        ))
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <ResourceCta
          heading="我想提供給你的資源："
          extra={{
            title: '預約保單健診',
            description: '留下聯絡方式，我們約時間一起看你手上的保單',
            to: '/contact',
            action: '前往預約',
          }}
        />
      </div>

      <Footer />
    </div>
  );
}
