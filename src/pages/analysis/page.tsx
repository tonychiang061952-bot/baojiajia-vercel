import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { SEO } from '../../components/SEO';
import PlanTypeStep from './components/PlanTypeStep';
import BasicInfoStep from './components/BasicInfoStep';
import MedicalNeedsStep from './components/MedicalNeedsStep';
import DailyCompensationStep from './components/DailyCompensationStep';
import SurgerySubsidyStep from './components/SurgerySubsidyStep';
import SalaryLossStep from './components/SalaryLossStep';
import LivingExpenseStep from './components/LivingExpenseStep';
import TreatmentCostStep from './components/TreatmentCostStep';
import LongTermCareStep from './components/LongTermCareStep';
import LifeInsuranceStep from './components/LifeInsuranceStep';
import OtherNeedsStep from './components/OtherNeedsStep';
import ResultStep from './components/ResultStep';

export default function AnalysisPage() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('analysis_step');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [formData, setFormData] = useState<any>(() => {
    const saved = localStorage.getItem('analysis_data');
    return saved ? JSON.parse(saved) : {};
  });

  const location = useLocation();
  const [lastLocationKey, setLastLocationKey] = useState<string | null>(null);

  // 初始化或組件掛載時設置初始 key
  useEffect(() => {
    setLastLocationKey(location.key);
  }, []);

  // 監聽路由變化，如果是點擊導航欄（key 改變且不是第一次掛載），則重置問卷
  useEffect(() => {
    if (lastLocationKey && location.key !== lastLocationKey) {
      resetAnalysis();
      setLastLocationKey(location.key);
    }
  }, [location.key]);

  useEffect(() => {
    localStorage.setItem('analysis_step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('analysis_data', JSON.stringify(formData));
  }, [formData]);

  const resetAnalysis = () => {
    localStorage.removeItem('analysis_step');
    localStorage.removeItem('analysis_data');
    setCurrentStep(0);
    setFormData({});
  };

  const updateFormData = (data: any) => {
    setFormData({ ...formData, ...data });
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  // 判斷是否為幼兒保險規劃
  const isChildPlan = formData.planType === 'child';

  const renderStep = () => {
    switch (currentStep) {
      // 第零步：選擇保險類型
      case 0:
        return <PlanTypeStep onSelect={(type) => { updateFormData({ planType: type }); nextStep(); }} />;

      // 第一部分：基本資料
      case 1:
        return <BasicInfoStep data={formData} onUpdate={updateFormData} onNext={nextStep} />;

      // 第二部分：醫療需求（3題）
      case 2:
        return <MedicalNeedsStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <DailyCompensationStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <SurgerySubsidyStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;

      // 第三部分：重症需求（3題）
      case 5:
        return <SalaryLossStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 6:
        return <LivingExpenseStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 7:
        return <TreatmentCostStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;

      // 第四部分：長照需求（1題）
      case 8:
        return <LongTermCareStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;

      // 第五部分：壽險需求（2題）- 幼兒保險規劃跳過此步驟
      case 9:
        if (isChildPlan) {
          // 幼兒保險規劃跳過壽險需求，直接進入其他需求
          setCurrentStep(10);
          return null;
        }
        return <LifeInsuranceStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;

      // 第六部分：其他需求（3題）
      case 10:
        return <OtherNeedsStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;

      // 結果頁面
      case 11:
        return <ResultStep data={formData} onBack={resetAnalysis} />;

      default:
        return <PlanTypeStep onSelect={(type) => { updateFormData({ planType: type }); nextStep(); }} />;
    }
  };

  return (
    <>
      <SEO
        title="保險需求分析 DIY | 保家佳"
        description="透過簡單的問卷，快速分析您的保險需求，量身打造專屬於您的保障藍圖。"
        keywords={["保險需求分析", "保單健診", "需求試算", "保險規劃"]}
        url="/analysis"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://baojiajia.tw/' },
            { '@type': 'ListItem', position: 2, name: '需求分析 DIY' },
          ],
        }}
      />
      <Navigation />
      <div className="min-h-screen bg-cream-100 pb-12 px-4">
        {/* 跟其他頁一致的麵包屑與頁面標題。
            這頁原本執行期沒有任何 h1，靜態快照卻有一個，兩邊對不起來。
            標題文字就是快照裡那一個，沒有新增內容。 */}
        <div className="max-w-6xl mx-auto pt-7 pb-6">
          <nav aria-label="breadcrumb" className="text-[0.8rem] text-cream-600">
            <Link to="/" className="hover:text-teal-600">首頁</Link>
            <span className="mx-1.5 text-cream-400">/</span>
            <span className="text-cream-900">需求分析 DIY</span>
          </nav>
          <h1 className="mt-2.5 font-serif text-[1.6rem] sm:text-[2rem] font-bold leading-[1.4] text-cream-900">
            保險需求分析 DIY
          </h1>
        </div>

        <div className="max-w-6xl mx-auto">
          {renderStep()}
        </div>
      </div>
      <Footer />
    </>
  );
}
