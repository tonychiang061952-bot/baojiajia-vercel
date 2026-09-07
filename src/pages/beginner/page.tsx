import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { SEO } from '../../components/SEO';
import beginnerContent from '../../data/beginner-content.json';

interface InsuranceType {
  id: string;
  name: string;
  icon: string;
  description: string;
  coverage: string[];
  tips: string[];
  keyPoints: string[];
}

const { insuranceTypes, comparisonData, faqs } = beginnerContent as {
  insuranceTypes: InsuranceType[];
  comparisonData: { aspect: string; singleCompany: string; broker: string }[];
  faqs: { question: string; answer: string }[];
};

export default function BeginnerPage() {
  const [selectedType, setSelectedType] = useState('life');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const currentInsurance = insuranceTypes.find(type => type.id === selectedType) || insuranceTypes[0];

  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title="保險新手村 - 從零開始了解保險 | 保家佳"
        description="專為保險新手設計的入門指南，介紹壽險、醫療險、意外險等六大保障，教您如何規劃最適合自己的保險方案。"
        keywords={["保險新手", "保險入門", "保險知識", "六大保障", "保險規劃"]}
        url="/beginner"
      />
      <Navigation />

      {/* Hero Section */}
      <div className="border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-cream-900">保險新手村</h1>
          <p className="text-sm sm:text-base text-cream-600 mt-2 max-w-2xl">
            從零開始，輕鬆了解保險知識
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section 1: 認識六大保障 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">認識六大保障</h2>
            <p className="text-lg text-gray-600">人身保險主要分為六大類，每種保障都有其重要性</p>
          </div>

          {/* Insurance Type Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {insuranceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${selectedType === type.id
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow border border-gray-200'
                  }`}
              >
                {type.name}
              </button>
            ))}
          </div>

          {/* Insurance Detail Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center">
                <i className={`${currentInsurance.icon} text-3xl text-teal-600`}></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{currentInsurance.name}</h3>
            </div>

            <div className="mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">{currentInsurance.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-shield-check-line text-2xl text-teal-600"></i>
                  保障內容
                </h4>
                <ul className="space-y-3">
                  {currentInsurance.coverage.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-teal-500 text-xl mt-1 flex-shrink-0"></i>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-lightbulb-line text-2xl text-amber-500"></i>
                  重點提醒
                </h4>
                <ul className="space-y-3">
                  {currentInsurance.keyPoints.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <i className="ri-star-fill text-amber-500 text-xl mt-1 flex-shrink-0"></i>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-information-line text-2xl text-teal-600"></i>
                專家小提醒
              </h4>
              <ul className="space-y-2">
                {currentInsurance.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <i className="ri-arrow-right-s-line text-teal-600 text-xl mt-1 flex-shrink-0"></i>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: 該找誰規劃？ */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">該找誰規劃？</h2>
            <p className="text-lg text-gray-600">選對專業顧問，讓保險規劃更完善</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-6 px-8">
              <h3 className="text-2xl font-bold text-center">單一公司業務 vs 保險經紀人業務</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-4 px-6 text-center text-lg font-bold text-gray-900 border-b-2 border-gray-200 w-1/5">比較項目</th>
                    <th className="py-4 px-6 text-center text-lg font-bold text-gray-900 border-b-2 border-gray-200 w-2/5">單一公司業務</th>
                    <th className="py-4 px-6 text-center text-lg font-bold text-teal-600 border-b-2 border-teal-200 bg-teal-50 w-2/5">保險經紀人業務 ⭐</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">服務範圍</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">僅能銷售所屬公司的保險商品</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">可銷售多家保險公司的商品</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">保障規劃</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">受限單一公司商品，選擇有限</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">可從多家公司中挑選出最適合的商品，客製化你的保障內容</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">保費比較</td>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-700 font-medium">相同，各家保險公司的商品費率不會因通路不同改變</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">理賠協助</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">協助申請理賠</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">協助申請理賠，並可協調多家公司</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">客觀性</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">可能較偏向推薦自家商品</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">較客觀，以客戶需求為優先</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">專業度</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">熟悉自家商品</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">需了解多家公司商品，專業要求更高</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-lightbulb-flash-line text-2xl text-white"></i>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">為什麼建議找保險經紀人業務？</h4>
                  <p className="text-gray-700 leading-relaxed">
                    保險經紀人業務可以從多家保險公司中，為您挑選最適合的商品組合，不受限於單一公司的產品線。就像是您的「保險採購專家」，站在您的立場，客觀比較各家商品的優缺點和保費，幫您規劃出最符合需求且最具 CP 值的保障方案。此外，當需要理賠時，保險經紀人業務可以協助處理多家公司的理賠申請，讓您更省時省力。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: 常見問題解答 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">常見問題解答</h2>
            <p className="text-lg text-gray-600">解答保險新手最常遇到的疑問</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">Q{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-left">{faq.question}</h3>
                  </div>
                  <i className={`ri-arrow-${expandedFaq === index ? 'up' : 'down'}-s-line text-2xl text-gray-400 flex-shrink-0`}></i>
                </button>
                <div className={`px-8 pb-6 ${expandedFaq === index ? '' : 'hidden'}`}>
                  <div className="pl-14 pr-4">
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-3xl mx-auto">
          <Link
            to="/analysis"
            className="group relative px-10 py-5 bg-teal-500 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:bg-teal-600 transition-all duration-300 flex items-center gap-3 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-calculator-line text-2xl"></i>
            試算自己的保險需求
            <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
          </Link>
          <Link
            to="/contact"
            className="group relative px-10 py-5 bg-white text-teal-600 border-2 border-teal-500 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all duration-300 flex items-center gap-3 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-customer-service-2-line text-2xl"></i>
            立即諮詢
            <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
