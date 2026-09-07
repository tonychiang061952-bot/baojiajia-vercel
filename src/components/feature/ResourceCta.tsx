import { Link } from 'react-router-dom';

/**
 * 全站共用的行動呼籲面板。
 *
 * 首頁、文章頁、服務項目、服務細頁、關於我們、保險新手村都用這一個，
 * 文案刻意寫在這裡而不是資料庫——六個頁面必須一致，
 * 各自從資料庫讀反而會改一頁其他頁沒跟上。要調整文案直接改這個檔案。
 */

const LINE_URL = 'https://lin.ee/Z7HOfYBe';

type Magnet = 'newborn' | 'general';

const MAGNETS: Record<Magnet, string> = {
  newborn: '新生兒保險規劃攻略',
  general: '小資族保險規劃攻略',
};

type Props = {
  /** 標題。預設是文章頁那一句；其他頁面可以換成自己的開場。 */
  heading?: string;
  /** 領取的懶人包。新生兒相關的文章給新生兒版，其餘給小資族版。 */
  magnet?: Magnet;
  /** 開場白。不給就用預設的自我介紹。 */
  intro?: string[];
  /** 主要兩個入口之外，額外的一條（例如服務頁的「預約保單健診」）。 */
  extra?: { title: string; description: string; to: string; action: string };
};

const DEFAULT_INTRO = [
  '哈囉～我是保家佳的昊恩，是一位保險經紀人業務。深耕保險業多年，在 Instagram 上累積分享超過 200 篇保險知識文章，希望能夠降低與消費者之間的資訊落差，保障你們「知的權利」。',
  '我們不只是能協助你比較多家商品，我們會依據你的需求，在保險市場上找尋最適合你的規劃方式。',
];

export default function ResourceCta({
  heading = '看完之後，如果還有拿不定主意的地方',
  magnet = 'general',
  intro = DEFAULT_INTRO,
  extra,
}: Props) {
  return (
    <section className="bg-brandgold-panel border-t-4 border-brandgold-edge rounded-b-lg px-6 py-8 sm:px-10 sm:py-9">
      <p className="text-xs font-semibold tracking-[0.02em] text-brandgold-ink mb-3">保家佳</p>
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-teal-600 leading-relaxed mb-5">
        {heading}
      </h2>

      {intro.map((paragraph) => (
        <p key={paragraph.slice(0, 12)} className="text-[0.95rem] leading-[1.9] text-cream-900 mb-4">
          {paragraph}
        </p>
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 mb-5">
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md border border-teal-600 bg-teal-600 px-5 py-5 hover:bg-teal-700 transition-colors"
        >
          <span className="block text-[0.7rem] font-bold tracking-[0.14em] text-brandgold mb-2">免費領取</span>
          <b className="block text-base font-bold text-white mb-1.5">{MAGNETS[magnet]}</b>
          <span className="block text-[0.83rem] leading-relaxed text-white/80">
            加入官方 LINE 就能下載，也可以直接私訊我
          </span>
        </a>

        <Link
          to="/analysis"
          className="block rounded-md border border-brandgold-edge bg-white px-5 py-5 hover:border-teal-600 transition-colors"
        >
          <span className="block text-[0.7rem] font-bold tracking-[0.14em] text-brandgold-ink mb-2">自己先算算看</span>
          <b className="block text-base font-bold text-cream-900 mb-1.5">需求分析 DIY</b>
          <span className="block text-[0.83rem] leading-relaxed text-cream-600">
            三分鐘看出自己的保障缺口
          </span>
        </Link>
      </div>

      {extra && (
        <Link
          to={extra.to}
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-2 sm:gap-5 rounded-md border border-brandgold-edge px-5 py-4 mb-5 hover:border-teal-600 hover:bg-white transition-colors"
        >
          <span>
            <b className="block text-[0.98rem] font-bold text-cream-900">{extra.title}</b>
            <span className="block text-[0.82rem] leading-relaxed text-cream-600 mt-0.5">
              {extra.description}
            </span>
          </span>
          <span className="text-[0.85rem] font-semibold text-teal-600 whitespace-nowrap">
            {extra.action} →
          </span>
        </Link>
      )}

      <p className="text-[0.86rem] leading-relaxed text-cream-600">
        LINE 官方不會有任何廣告訊息，可以安心加入～任何保險問題都可以詢問，我們會完整了解你的狀況後才給予建議。
      </p>
    </section>
  );
}
