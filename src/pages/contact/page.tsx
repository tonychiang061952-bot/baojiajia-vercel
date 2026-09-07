import { useState } from 'react';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const CONSULTATION_OPTIONS = [
  { value: 'first-time', label: '首購族諮詢（過去不曾規劃保險）' },
  { value: 'policy-review', label: '舊保單健診（檢視既有保障缺口）' },
  { value: 'budget-adjust', label: '調整保費預算（覺得目前保費負擔太重）' },
  { value: 'specific-coverage', label: '補強特定保障（例如：癌症/醫療/失能/意外）' },
  { value: 'newborn', label: '新生兒/兒童保單規劃' }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    lineId: '',
    gender: '',
    birthDate: '',
    occupation: '',
    annualIncome: '',
    monthlyBudget: '',
    consultationType: '',
    otherConsultation: '',
    additionalMessage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const selectedOption = CONSULTATION_OPTIONS.find(option => option.value === formData.consultationType);
      const consultationDisplayValue = formData.consultationType === 'other'
        ? formData.otherConsultation.trim()
        : selectedOption?.label || '';

      // 只送到自己的 Vercel API，由後端寫入 Neon 並發送通知。
      // 表單資料不再經過任何第三方服務。
      const storageResponse = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          lineId: formData.lineId.trim(),
          gender: formData.gender === 'male' ? '男' : '女',
          birthDate: formData.birthDate,
          occupation: formData.occupation.trim(),
          annualIncome: formData.annualIncome,
          monthlyBudget: formData.monthlyBudget,
          consultationType: consultationDisplayValue || '未指定',
          additionalMessage: formData.additionalMessage.trim(),
        }),
      });

      if (storageResponse.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          phone: '',
          lineId: '',
          gender: '',
          birthDate: '',
          occupation: '',
          annualIncome: '',
          monthlyBudget: '',
          consultationType: '',
          otherConsultation: '',
          additionalMessage: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title="聯絡我們 - 免費保險諮詢 | 保家佳"
        description="有任何保險問題？填表單或加官方 LINE 都可以。我們會完整了解你的狀況後才給予建議。"
        keywords={['聯絡保家佳', '保險諮詢', '免費諮詢', '預約服務']}
        url="/contact"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://baojiajia.tw/' },
            { '@type': 'ListItem', position: 2, name: '聯絡我們' },
          ],
        }}
      />
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="border-b border-cream-300 py-11">
          <h1 className="font-serif text-[1.75rem] sm:text-4xl font-bold text-cream-900 leading-[1.4]">聯絡我們</h1>
          <p className="mt-4 max-w-[52ch] text-base leading-[1.9] text-cream-600">
            有任何問題或需求，歡迎隨時與我們聯繫。填表單或加 LINE 都可以，看你方便。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] items-start gap-9 lg:gap-13 py-11 pb-16">
          <main className="rounded-lg border border-cream-300 bg-white px-5 py-7 sm:px-8">
            <h2 className="font-serif text-[1.3rem] font-bold text-cream-900 mb-2">預約免費諮詢</h2>
            <p className="mb-1 text-[0.9rem] leading-[1.8] text-cream-600">填完之後我會親自看過，再跟你約時間。</p>

            <form onSubmit={handleSubmit} id="contact-form">
              <fieldset className="pt-2">
                <legend className="mb-4 flex items-baseline gap-2.5">
                  <span className="rounded-sm bg-brandgold px-1.5 py-0.5 font-mono text-[0.74rem] font-bold text-brandgold-ink">01</span>
                  <span className="text-base font-bold text-cream-900">怎麼聯絡你</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="name" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">姓名<i className="not-italic text-alert ml-0.5">*</i></label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="請輸入真實姓名" className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="phone" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">聯絡電話<i className="not-italic text-alert ml-0.5">*</i></label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="聯絡電話" className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none" />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="lineId" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">Line ID<i className="not-italic text-alert ml-0.5">*</i></label>
                  <input type="text" id="lineId" name="lineId" value={formData.lineId} onChange={handleChange} required placeholder="Line ID" className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none" />
                </div>
              </fieldset>

              <fieldset className="mt-7 border-t border-cream-300 pt-6">
                <legend className="mb-1.5 flex items-baseline gap-2.5">
                  <span className="rounded-sm bg-brandgold px-1.5 py-0.5 font-mono text-[0.74rem] font-bold text-brandgold-ink">02</span>
                  <span className="text-base font-bold text-cream-900">讓我先了解你的狀況</span>
                </legend>
                <p className="mb-5 text-[0.83rem] leading-[1.75] text-cream-600">
                  保費會因為年齡、職業等級而不同，預算則決定保障的優先順序。先知道這些，第一次聊就能直接談重點，不用從頭問起。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <span className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">性別<i className="not-italic text-alert ml-0.5">*</i></span>
                    <div className="flex gap-6 pt-0.5">
                      {[['male', '男'], ['female', '女']].map(([value, label]) => (
                        <label key={value} className="inline-flex cursor-pointer items-center gap-2 text-[0.92rem] text-cream-900">
                          <input type="radio" name="gender" value={value} checked={formData.gender === value} onChange={handleChange} required className="accent-teal-600" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="birthDate" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">出生年月日<i className="not-italic text-alert ml-0.5">*</i></label>
                    <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} required className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none" />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="occupation" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">職業等級<i className="not-italic text-alert ml-0.5">*</i></label>
                  <select id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} required className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none">
                    <option value="">請選擇</option>
                    <option value="職等1（內勤人員、教師、家管...等）">職等1（內勤人員、教師、家管⋯等）</option>
                    <option value="職等2（外勤人員、業務、工程師...等）">職等2（外勤人員、業務、工程師⋯等）</option>
                    <option value="職等3（一般軍警、遊覽車司機...等）">職等3（一般軍警、遊覽車司機⋯等）</option>
                    <option value="職等4（模板工、水電工、計程車司機...等）">職等4（模板工、水電工、計程車司機⋯等）</option>
                    <option value="職等5（刑警、焊接工、高樓外部清潔工...等）">職等5（刑警、焊接工、高樓外部清潔工⋯等）</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="annualIncome" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">年收入<i className="not-italic text-alert ml-0.5">*</i></label>
                    <select id="annualIncome" name="annualIncome" value={formData.annualIncome} onChange={handleChange} required className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none">
                      <option value="">請選擇</option>
                      {['30萬以下', '30-50萬', '50-70萬', '70-100萬', '100-150萬', '150萬以上'].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="monthlyBudget" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">每月保費預算<i className="not-italic text-alert ml-0.5">*</i></label>
                    <select id="monthlyBudget" name="monthlyBudget" value={formData.monthlyBudget} onChange={handleChange} required className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none">
                      <option value="">請選擇</option>
                      {['3000~5000', '5000~10000', '10000~15000', '15000~20000', '20000以上'].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset className="mt-7 border-t border-cream-300 pt-6">
                <legend className="mb-4 flex items-baseline gap-2.5">
                  <span className="rounded-sm bg-brandgold px-1.5 py-0.5 font-mono text-[0.74rem] font-bold text-brandgold-ink">03</span>
                  <span className="text-base font-bold text-cream-900">你想聊什麼</span>
                </legend>
                <div className="mb-4">
                  <label htmlFor="consultationType" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">諮詢類型<i className="not-italic text-alert ml-0.5">*</i></label>
                  <select id="consultationType" name="consultationType" value={formData.consultationType} onChange={handleChange} required className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none">
                    <option value="">請選擇</option>
                    {CONSULTATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                    <option value="other">其他</option>
                  </select>
                </div>

                {formData.consultationType === 'other' && (
                  <div className="mb-4">
                    <label htmlFor="otherConsultation" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">請說明你的需求<i className="not-italic text-alert ml-0.5">*</i></label>
                    <textarea id="otherConsultation" name="otherConsultation" value={formData.otherConsultation} onChange={handleChange} required maxLength={500} rows={4} placeholder="請詳細說明你的諮詢需求⋯⋯" className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none resize-y leading-[1.8]" />
                    <p className="mt-1.5 text-right text-[0.76rem] text-cream-500">{formData.otherConsultation.length}/500 字元</p>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="additionalMessage" className="mb-1.5 block text-[0.85rem] font-semibold text-cream-900">還有什麼想跟我們說或需要我們協助的嗎？</label>
                  <textarea id="additionalMessage" name="additionalMessage" value={formData.additionalMessage} onChange={handleChange} maxLength={500} rows={4} placeholder="請告訴我們你的想法或需求⋯⋯" className="w-full rounded-md border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-[0.92rem] text-cream-900 focus:border-teal-600 focus:bg-white focus:outline-none resize-y leading-[1.8]" />
                  <p className="mt-1.5 text-right text-[0.76rem] text-cream-500">{formData.additionalMessage.length}/500 字元</p>
                </div>
              </fieldset>

              <p className="mt-6 rounded-md border border-cream-300 bg-cream-100 px-4 py-3.5 text-[0.82rem] leading-[1.8] text-cream-600">
                <b className="text-cream-900">你的資料只會用在這次諮詢。</b>不會經過任何第三方服務。
              </p>

              {submitStatus === 'success' && (
                <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-[0.9rem] text-green-800">
                  感謝你的留言！我們將盡快與你聯繫。
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[0.9rem] text-red-800">
                  送出失敗，請稍後再試，或直接用官方 LINE 私訊我。
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 w-full rounded-md bg-teal-600 py-3.5 text-base font-bold text-white hover:bg-teal-700 disabled:bg-cream-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '送出中⋯⋯' : '送出，我會盡快回覆你'}
              </button>
            </form>
          </main>

          <aside>
            <section className="mb-6">
              <h2 className="mb-3 border-b border-cream-300 pb-2 text-[0.73rem] font-bold tracking-[0.15em] text-cream-600">
                不想填表單？
              </h2>
              <a
                href="https://lin.ee/Z7HOfYBe"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3.5 rounded-md border border-teal-600 bg-teal-600 px-4 py-4"
              >
                <span>
                  <span className="mb-2 block w-fit rounded-sm bg-brandgold px-2 py-0.5 text-[0.66rem] font-bold tracking-[0.14em] text-cream-900">最快</span>
                  <b className="mb-1 block text-base font-bold text-white">加入官方 LINE</b>
                  <span className="block text-[0.81rem] leading-[1.7] text-white/80">
                    直接私訊我，也能下載小資族與新生兒的保險規劃攻略。不會有任何廣告訊息。
                  </span>
                </span>
                <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-[#06C755] text-[0.6rem] font-extrabold text-white">
                  LINE
                </span>
              </a>
              <a
                href="https://www.instagram.com/baojia_jia/"
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3.5 rounded-md border border-cream-300 bg-white px-4 py-4 hover:border-teal-600 transition-colors"
              >
                <span>
                  <b className="mb-1 block text-base font-bold text-cream-900">Instagram @baojia_jia</b>
                  <span className="block text-[0.81rem] leading-[1.7] text-cream-600">1.6 萬人追蹤，200+ 篇保險知識貼文</span>
                </span>
                <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg text-[0.62rem] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#F9CE34,#EE2A7B,#6228D7)' }}>
                  IG
                </span>
              </a>
            </section>

            <section className="mb-6">
              <h2 className="mb-3 border-b border-cream-300 pb-2 text-[0.73rem] font-bold tracking-[0.15em] text-cream-600">
                還沒想好要問什麼
              </h2>
              <Link to="/analysis" className="mb-3 block rounded-md border border-cream-300 bg-white px-4 py-4 hover:border-teal-600 transition-colors">
                <b className="mb-1 block text-base font-bold text-cream-900">需求分析 DIY</b>
                <span className="block text-[0.81rem] leading-[1.7] text-cream-600">
                  三分鐘看出自己的保障缺口，做完會拿到一份專屬的分析報告，帶著它來聊會更有效率。
                </span>
              </Link>
              <Link to="/blog" className="block rounded-md border border-cream-300 bg-white px-4 py-4 hover:border-teal-600 transition-colors">
                <b className="mb-1 block text-base font-bold text-cream-900">先逛保險知識專區</b>
                <span className="block text-[0.81rem] leading-[1.7] text-cream-600">常見的問題大多都寫成文章了</span>
              </Link>
            </section>

            <section>
              <h2 className="mb-3 border-b border-cream-300 pb-2 text-[0.73rem] font-bold tracking-[0.15em] text-cream-600">
                關於回覆
              </h2>
              <p className="text-[0.82rem] leading-[1.8] text-cream-600">
                表單與 LINE 我都會親自看，通常 24 小時內回覆。
              </p>
            </section>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
