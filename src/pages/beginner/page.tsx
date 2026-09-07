import { Link } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import ResourceCta from '../../components/feature/ResourceCta';
import { SEO } from '../../components/SEO';
import beginnerContent from '../../data/beginner-content.json';

/**
 * 保險新手村。
 *
 * 舊版用分頁切換六大保障，React 只把「當前選中的那一種」放進 DOM，
 * 另外五種根本沒有被渲染出來。實測渲染後只剩 775 個中文字，
 * 靜態快照裡卻有 2,216 字——Google 索引的是渲染後的內容，等於 65% 白寫。
 * 改成六種全部展開，內容一直都在頁面上。
 */

type InsuranceType = {
  id: string;
  name: string;
  description: string;
  coverage: string[];
  keyPoints: string[];
  tips: string[];
};

const { insuranceTypes, comparisonData, faqs } = beginnerContent as {
  insuranceTypes: InsuranceType[];
  comparisonData: { aspect: string; singleCompany: string; broker: string }[];
  faqs: { question: string; answer: string }[];
};

const PATHS = [
  {
    tag: '情況一',
    title: '身上完全沒有保險',
    body: '不用先挑商品。先知道自己各項保障大概需要多少額度，之後看到任何建議書都有基準可以對。',
    action: '開始需求分析 DIY →',
    to: '/analysis',
    primary: true,
  },
  {
    tag: '情況二',
    title: '已經有保險，但不確定夠不夠',
    body: '先把手上的保單攤開來看。很多人的問題不是買太少，而是錢花錯地方——該補的沒補，不必要的繳了很多年。',
    action: '了解保單健診 →',
    to: '/services/policy-checkup',
    primary: false,
  },
  {
    tag: '情況三',
    title: '想先自己讀懂再說',
    body: '人身保險就分成六大類，每一類處理的風險不一樣。看完你會知道自己在問的是哪一塊。',
    action: '往下看六大保障 →',
    to: '#six',
    primary: false,
  },
];

const READS = [
  { tag: '醫療險', title: '為什麼大家都說實支實付超重要？跟傳統的醫療險有什麼不同？', slug: 'pay-for-insurance' },
  { tag: '癌症險', title: '癌症治療這麼貴！保障該怎麼規劃？療程型 vs 一次金', slug: 'cancer-insurance-planning-lump-sum-vs-treatment' },
  { tag: '癌症險', title: '癌症治療究竟花多少錢？讓癌友直接告訴你吧！', slug: 'cancer-treatment-insurance' },
  { tag: '幼兒保障', title: '2026 新生兒保險規劃指南：六大重點給孩子最大的保障', slug: 'child-insurance-guide' },
];

export default function Beginner() {
  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title="保險新手村 - 從零開始了解保險 | 保家佳"
        description="人身保險的六大類、該找誰規劃、以及新手最常問的五個問題，一次講完。從零開始，輕鬆了解保險知識。"
        keywords={['保險新手', '六大保障', '壽險', '醫療險', '意外險', '癌症險', '重大傷病險', '失能險']}
        url="/beginner"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://baojiajia.tw/' },
            { '@type': 'ListItem', position: 2, name: '保險新手村' },
          ],
        }}
      />
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="pt-5 text-[0.79rem] text-cream-600">
          <Link to="/" className="hover:text-teal-600">首頁</Link>
          <span className="mx-2 text-cream-500">›</span>
          保險新手村
        </nav>

        <header className="pt-6 pb-9 border-b border-cream-300">
          <h1 className="font-serif text-[1.8rem] sm:text-4xl font-bold text-cream-900 leading-[1.4]">
            保險新手村
          </h1>
          <p className="mt-4 text-base leading-[1.9] text-cream-600">
            從零開始，輕鬆了解保險知識。這一頁把人身保險的六大類、該找誰規劃、以及新手最常問的五個問題，一次講完。
          </p>
        </header>

        {/* 先讓人對號入座，再決定要不要往下讀 */}
        <section className="pt-8 pb-2">
          <p className="mb-6 text-base leading-[1.9] text-cream-900">你目前的需求是哪一個呢？</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {PATHS.map((path) => {
              const inner = (
                <>
                  <span className="w-fit mb-3.5 rounded-sm bg-brandgold px-2.5 py-1 text-[0.67rem] font-bold tracking-[0.15em] text-brandgold-ink">
                    {path.tag}
                  </span>
                  <h3 className={`text-[1.08rem] font-bold leading-relaxed mb-2.5 ${path.primary ? 'text-white' : 'text-cream-900'}`}>
                    {path.title}
                  </h3>
                  <p className={`text-[0.88rem] leading-[1.8] ${path.primary ? 'text-white/85' : 'text-cream-600'}`}>
                    {path.body}
                  </p>
                  <span className={`mt-auto pt-[18px] text-[0.88rem] font-bold ${path.primary ? 'text-brandgold' : 'text-teal-600'}`}>
                    {path.action}
                  </span>
                </>
              );
              const cls = `flex flex-col rounded-lg border px-6 py-6 transition-colors ${
                path.primary
                  ? 'bg-teal-600 border-teal-600 hover:bg-teal-700'
                  : 'bg-white border-cream-300 hover:border-teal-600'
              }`;
              return path.to.startsWith('#')
                ? <a key={path.tag} href={path.to} className={cls}>{inner}</a>
                : <Link key={path.tag} to={path.to} className={cls}>{inner}</Link>;
            })}
          </div>
        </section>

        {/* 六大保障：全部展開，不用分頁 */}
        <section id="six" className="pt-14">
          <h2 className="font-serif text-2xl font-bold text-cream-900 mb-2">認識六大保障</h2>
          <p className="text-[0.95rem] text-cream-600 mb-6">人身保險主要分為六大類，每種保障都有它要處理的風險。</p>

          <div className="flex flex-wrap gap-2 mb-7">
            {insuranceTypes.map((type) => (
              <a
                key={type.id}
                href={`#k-${type.id}`}
                className="rounded-sm border border-cream-300 bg-white px-4 py-1.5 text-[0.86rem] text-cream-600 hover:border-teal-600 hover:text-teal-600 transition-colors"
              >
                {type.name}
              </a>
            ))}
          </div>

          {insuranceTypes.map((type, index) => (
            <article
              key={type.id}
              id={`k-${type.id}`}
              className="mb-5 rounded-lg border border-cream-300 bg-white px-6 py-7 sm:px-8 scroll-mt-24"
            >
              <h3 className="font-serif text-xl font-bold text-cream-900 mb-3 flex items-center gap-3">
                <span className="flex-none w-[30px] h-[30px] rounded-full bg-teal-600 text-white text-[0.8rem] font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                {type.name}
              </h3>
              <p className="text-base leading-[1.95] text-cream-900 mb-5">{type.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[0.72rem] font-bold tracking-[0.14em] text-cream-600 mb-3 pb-2 border-b border-cream-300">
                    保障內容
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {type.coverage.map((item) => (
                      <li key={item} className="relative pl-4 text-[0.9rem] leading-[1.8] text-cream-600 before:absolute before:left-0 before:top-[0.72em] before:w-[5px] before:h-[5px] before:rounded-full before:bg-teal-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[0.72rem] font-bold tracking-[0.14em] text-cream-600 mb-3 pb-2 border-b border-cream-300">
                    重點提醒
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {type.keyPoints.map((item) => (
                      <li key={item} className="relative pl-4 text-[0.9rem] leading-[1.8] text-cream-600 before:absolute before:left-0 before:top-[0.72em] before:w-[5px] before:h-[5px] before:rounded-full before:bg-teal-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-r-md border-l-[3px] border-brandgold-edge bg-brandgold-panel px-5 py-4">
                <h4 className="text-[0.72rem] font-bold tracking-[0.14em] text-brandgold-ink mb-2.5">我的提醒</h4>
                <ul className="flex flex-col gap-2">
                  {type.tips.map((tip) => (
                    <li key={tip} className="relative pl-4 text-[0.89rem] leading-[1.8] text-cream-900 before:absolute before:left-0 before:top-[0.72em] before:w-[5px] before:h-[5px] before:rounded-full before:bg-brandgold-edge">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <section className="pt-10">
          <h2 className="font-serif text-2xl font-bold text-cream-900 mb-2">該找誰規劃？</h2>
          <p className="text-[0.95rem] text-cream-600 mb-6">單一公司業務與保險經紀人業務的差別，在於能拿到的選擇有多少。</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-lg border border-cream-300 bg-white text-[0.9rem]">
              <thead>
                <tr>
                  <th className="bg-cream-50 px-4 py-3.5 text-left" />
                  <th className="bg-cream-50 px-4 py-3.5 text-left text-[0.85rem] font-bold text-cream-900 whitespace-nowrap">單一公司業務</th>
                  <th className="bg-cream-50 px-4 py-3.5 text-left text-[0.85rem] font-bold text-teal-600 whitespace-nowrap">保險經紀人業務</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.aspect} className="border-t border-cream-200">
                    <th className="px-4 py-3.5 text-left align-top font-bold text-cream-900 whitespace-nowrap w-[110px]">{row.aspect}</th>
                    <td className="px-4 py-3.5 align-top leading-[1.75] text-cream-600">{row.singleCompany}</td>
                    <td className="px-4 py-3.5 align-top leading-[1.75] text-cream-900">{row.broker}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pt-12">
          <h2 className="font-serif text-2xl font-bold text-cream-900 mb-2">常見問題</h2>
          <p className="text-[0.95rem] text-cream-600 mb-6">保險新手最常遇到的五個疑問。</p>
          <div className="overflow-hidden rounded-lg border border-cream-300 bg-white">
            {faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0} className="border-b border-cream-200 last:border-b-0 group">
                <summary className="flex cursor-pointer list-none items-center gap-3.5 px-5 py-4 text-[0.98rem] font-bold text-cream-900 hover:bg-cream-50 [&::-webkit-details-marker]:hidden">
                  <span className="flex-none w-7 h-7 rounded-md bg-teal-600 text-white text-[0.74rem] font-semibold flex items-center justify-center">
                    Q{index + 1}
                  </span>
                  {faq.question}
                  <span className="ml-auto text-cream-500 group-open:hidden">＋</span>
                  <span className="ml-auto text-cream-500 hidden group-open:inline">−</span>
                </summary>
                <div className="px-5 pb-5 pl-16 text-[0.93rem] leading-[1.95] text-cream-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="pt-12">
          <h2 className="font-serif text-xl font-bold text-cream-900 mb-1.5">想看得更深入</h2>
          <p className="text-[0.9rem] text-cream-600 mb-5">這幾篇把上面提到的險種拆得更細。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {READS.map((read) => (
              <Link key={read.slug} to={`/blog/${read.slug}`} className="group border-l-[3px] border-brandgold pl-3.5 py-0.5">
                <span className="block text-[0.68rem] font-bold tracking-[0.12em] text-cream-500 mb-1.5">{read.tag}</span>
                <b className="block text-[0.9rem] font-semibold leading-relaxed text-cream-900 group-hover:text-teal-600 transition-colors">
                  {read.title}
                </b>
              </Link>
            ))}
          </div>
        </section>

        <div className="py-14">
          <ResourceCta heading="看完六大保障之後" intro={[
            '如果想知道自己現在缺的是哪一塊，下面兩個入口都不用先聯絡任何人。',
          ]} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
