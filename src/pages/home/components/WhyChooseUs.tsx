import { useEffect, useState } from 'react';
import { db } from '../../../lib/database';

type Feature = { title: string; description: string; image: string };

// 這五項原本寫死在程式碼裡，後台的「特色優勢」改了不會生效。
// 改成讀 features；讀不到時退回目前線上的內容，避免整區空白。
const FALLBACK: Feature[] = [
  { image: '/images/features/simple.svg', title: '有夠簡單', description: '用簡單的圖表，輕鬆構思全方位的保障' },
  { image: '/images/features/clear.svg', title: '有夠清楚', description: '用生活化的語言，讓你清楚了解保障內容' },
  { image: '/images/features/complete.svg', title: '有夠完整', description: '商品的優缺點，業界不敢講的我都敢講' },
  { image: '/images/features/professional.svg', title: '有夠專業', description: '研究各家公司的商品，替你把關不踩雷' },
  { image: '/images/features/detailed.svg', title: '有夠詳細', description: '充分了解你的需求，客製你的保障規劃' },
];

export default function WhyChooseUs() {
  const [features, setFeatures] = useState<Feature[]>(FALLBACK);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await db.from('features').select('title, description, image')
          .eq('is_active', true).order('display_order', { ascending: true });
        if (!alive || !data?.length) return;
        const rows = (data as any[])
          .filter((f) => f?.title)
          .map((f, i) => ({
            title: f.title,
            description: f.description ?? '',
            image: f.image || FALLBACK[i]?.image || '',
          }));
        if (rows.length) setFeatures(rows);
      } catch (error) {
        console.error('Features failed to load:', error);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="bg-white border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-9
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-0">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`flex flex-col items-start gap-1.5 lg:px-5
                        ${index === 0 ? 'lg:pl-0' : 'lg:border-l lg:border-cream-200'}`}
          >
            {feature.image && (
              <img src={feature.image} alt="" aria-hidden="true" loading="lazy" width={38} height={38} className="w-[38px] h-[38px] object-contain mb-0.5" />
            )}
            <b className="text-[0.95rem] font-bold leading-snug text-cream-900">{feature.title}</b>
            <span className="text-[0.8rem] leading-[1.65] text-cream-600">{feature.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
