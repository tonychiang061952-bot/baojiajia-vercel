import { useState } from 'react';

type Props = {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function LongTermCareStep({ data, onUpdate, onNext, onBack }: Props) {
  const [longTermCareCost, setLongTermCareCost] = useState(data.longTermCareCost || 50000);

  const handleNext = () => {
    onUpdate({ 
      longTermCare: longTermCareCost,
      longTermCareCost 
    });
    onNext();
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* 左側輔助資訊 */}
        <div className="bg-cream-100 p-8 lg:p-12 flex items-center">
          <div className="w-full space-y-6">
            <div className="mb-8">
              <img
                src="/images/analysis/long-term-care.png"
                alt="長照費用說明"
                className="w-full rounded-lg"
              />
            </div>

            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-cream-900 mb-3 flex items-center">
                <i className="ri-information-line text-teal-600 mr-2"></i>
                為什麼需要長照保障？
              </h4>
              <ul className="space-y-2 text-sm text-cream-600">
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>長照費用持續且龐大</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>減輕家人照護負擔</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>確保照護品質</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右側問題區域 */}
        <div className="p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-teal-600">問題 1/1</span>
              <span className="text-sm text-cream-500">長照需求評估</span>
            </div>
            <div className="w-full bg-cream-300 rounded-full h-2 mb-6">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <h2 className="text-3xl font-bold text-cream-900 mb-4">
              長照費用需求
            </h2>
            <p className="text-lg text-cream-600">
              如果遭遇長照風險，您覺得每個月需要多少費用？
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center bg-cream-100 rounded-lg px-8 py-6 mb-4">
                <span className="text-5xl font-bold text-teal-600">
                  {longTermCareCost.toLocaleString()}
                </span>
                <span className="text-2xl text-cream-600 ml-3">元/月</span>
              </div>
              <p className="text-sm text-cream-500">
                每月長照費用需求
              </p>
            </div>

            <div className="mb-8">
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={longTermCareCost}
                onChange={(e) => setLongTermCareCost(parseInt(e.target.value))}
                className="w-full h-3 bg-cream-300 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(longTermCareCost / 100000) * 100}%, #e5e7eb ${(longTermCareCost / 100000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-cream-500 mt-2">
                <span>0 元</span>
                <span>10 萬</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-cream-200 text-cream-800 rounded-lg hover:bg-cream-300 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              上一步
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              下一步
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
