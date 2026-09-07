import { Link } from 'react-router-dom';

/**
 * 需求分析 DIY 的介紹。
 *
 * 這一整段文案原本是壓在首頁第二張輪播圖片裡的，Google 一個字都讀不到。
 * 改成真文字之後，這是首頁上內容量最大的一塊。
 * 右邊三頁是需求分析報告實際的內頁，讓人看得到做完會拿到什麼。
 */

const STEPS = ['了解自己的需求', '了解各險種的保障與功能', '看懂保單的基本條款'];

const PAGES = [
  { src: '/images/report/life.jpg', alt: '報告中的壽險頁，算出你的身故理賠金需求額度', cls: 'w-[54%] left-0 top-[11%] -rotate-[5deg] z-10' },
  { src: '/images/report/checklist.jpg', alt: '報告中的各險種注意事項頁，列出投保前該向業務員確認的問題', cls: 'w-[54%] right-0 top-[8%] rotate-[5deg] z-20' },
  { src: '/images/report/medical.jpg', alt: '報告中的醫療險頁，列出常見自費項目行情與你的醫療險需求額度', cls: 'w-[60%] left-[20%] top-0 z-30' },
];

export default function AnalysisIntro() {
  return (
    <section className="bg-white border-b border-cream-300 py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                      grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-10 lg:gap-14 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-cream-600 mb-4">需求分析 DIY</p>
          <h2 className="font-serif text-2xl sm:text-[1.75rem] font-bold text-cream-900 leading-snug mb-5">
            客製化自己的專屬保障
          </h2>

          <p className="text-[0.97rem] leading-[1.95] text-cream-600 mb-4 max-w-[44ch]">
            保險市場上，充滿各種資訊落差，又因為商品眾多，業務員各說各的好！是真是假不得而知！
          </p>
          <p className="text-[0.97rem] leading-[1.95] text-cream-600 mb-4 max-w-[44ch]">
            絕大多數的人即使已經規劃了保險，卻不知道自己擁有什麼保障！往往是需要理賠的時候才發現保障不如自己的想像。
          </p>
          <p className="text-[0.97rem] leading-[1.95] text-cream-900 font-semibold mb-3 max-w-[44ch]">
            要克服這樣的資訊落差，不需要變成保險專家，只要：
          </p>

          <ol className="flex flex-col gap-2.5 mb-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-base font-semibold text-cream-900">
                <span className="flex-none w-[26px] h-[26px] rounded-full bg-teal-600 text-white text-[0.8rem] font-bold
                                 flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <p className="text-[0.97rem] leading-[1.95] text-cream-600 mb-6 max-w-[44ch]">
            就能規劃出最適合自己的保障內容！
          </p>

          <Link
            to="/analysis"
            className="inline-block rounded-md bg-teal-600 px-6 py-3 text-[0.92rem] font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            立即試算你的保險需求，取得你的專屬報告
          </Link>
        </div>

        <div className="max-w-[400px] w-full mx-auto lg:mx-0 order-first lg:order-none">
          <div className="relative w-full" style={{ aspectRatio: '1 / 0.94' }}>
            {PAGES.map((page) => (
              <img
                key={page.src}
                src={page.src}
                alt={page.alt}
                loading="lazy"
                width={520}
                height={736}
                className={`absolute bg-white rounded border border-cream-300 shadow-[0_14px_34px_rgba(31,58,95,0.17)] ${page.cls}`}
              />
            ))}
          </div>
          <p className="mt-4 text-[0.83rem] leading-relaxed text-cream-600">
            <b className="block text-[0.92rem] font-bold text-cream-900 mb-1">
              做完需求分析，你會拿到一份專屬的分析報告
            </b>
            只有先了解自己的需求，才不會被業務員牽著鼻子走
          </p>
        </div>
      </div>
    </section>
  );
}
