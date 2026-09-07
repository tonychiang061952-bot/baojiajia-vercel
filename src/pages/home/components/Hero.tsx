import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db as supabase } from '../../../lib/database';

/**
 * 首頁最上方。
 *
 * 舊版是滿版輪播圖，有三個問題：第二張沒有標題，5 秒後 h1 會從畫面上消失；
 * 70% 的黑色遮罩把照片壓成一片黑；第二張的文案整段壓在圖片裡，Google 讀不到。
 * 改成文字式之後 h1 固定存在，文案也全部是真文字。
 */

type HeroContent = {
  title: string;
  subtitle: string;
  description: string;
  button1_text: string;
  button1_link: string;
  button2_text: string;
  button2_link: string;
};

const FALLBACK: HeroContent = {
  title: '我們的願景是',
  subtitle: '打破傳統保險業務的框架',
  description: '提供對等、客觀、正確的資訊，讓大家在資訊爆炸的環境中有辨別好壞的能力。用專業的知識為你在市場中找出最適合的規劃方案！',
  button1_text: '需求分析 DIY',
  button1_link: '/analysis',
  button2_text: '保險知識分享',
  button2_link: '/blog',
};

export default function Hero() {
  const [content, setContent] = useState<HeroContent>(FALLBACK);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.from('homepage_content').select('content_key, content_value');
        if (!alive || !data) return;
        const map: Record<string, string> = {};
        for (const row of data as any[]) {
          if (row?.content_key) map[row.content_key] = row.content_value ?? '';
        }
        setContent({
          title: map.hero_title?.trim() || FALLBACK.title,
          subtitle: map.hero_subtitle?.trim() || FALLBACK.subtitle,
          description: map.hero_description?.trim() || FALLBACK.description,
          button1_text: map.hero_button1_text?.trim() || FALLBACK.button1_text,
          button1_link: map.hero_button1_link?.trim() || FALLBACK.button1_link,
          button2_text: map.hero_button2_text?.trim() || FALLBACK.button2_text,
          button2_link: map.hero_button2_link?.trim() || FALLBACK.button2_link,
        });
      } catch (error) {
        console.error('Hero content failed to load:', error);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14
                      grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-5 lg:gap-14 lg:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-cream-600 mb-4">保家佳</p>
          <h1 className="font-serif font-bold text-cream-900 leading-[1.4] text-[1.9rem] sm:text-4xl md:text-[2.6rem]">
            {content.title}
            <span className="block text-teal-600 text-[0.68em] mt-2">{content.subtitle}</span>
          </h1>
          <p className="mt-5 text-base leading-[1.95] text-cream-600 whitespace-pre-line max-w-[52ch]">
            {content.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link
            to={content.button1_link}
            className="inline-block rounded-md bg-teal-600 px-6 py-3 text-[0.92rem] font-semibold text-white hover:bg-teal-700 transition-colors whitespace-nowrap"
          >
            {content.button1_text}
          </Link>
          <Link
            to={content.button2_link}
            className="inline-block rounded-md border border-teal-600 px-6 py-3 text-[0.92rem] font-semibold text-teal-600 hover:bg-teal-50 transition-colors whitespace-nowrap"
          >
            {content.button2_text}
          </Link>
        </div>
      </div>
    </section>
  );
}
