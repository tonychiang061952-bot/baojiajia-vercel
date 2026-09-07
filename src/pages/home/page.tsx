
import { Link } from 'react-router-dom';
import Hero from './components/Hero';
import AnalysisIntro from './components/AnalysisIntro';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import LineMagnet from './components/LineMagnet';
import LatestPosts from './components/LatestPosts';
import Testimonials from './components/Testimonials';
import ResourceCta from '../../components/feature/ResourceCta';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { SEO } from '../../components/SEO';

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://baojiajia.tw/#organization",
        "name": "保家佳",
        "url": "https://baojiajia.tw/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://baojiajia.tw/logo.png",
          "width": 256,
          "height": 253
        },
        "description": "致力於保險知識分享及提供專業的保險諮詢服務。",
        "sameAs": [
          "https://www.instagram.com/baojia_jia/",
          "https://www.facebook.com/Baojiajia.tw"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "areaServed": "TW",
          "availableLanguage": "zh-TW"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://baojiajia.tw/#website",
        "url": "https://baojiajia.tw/",
        "name": "保家佳",
        "description": "保險理財知識分享",
        "publisher": {
          "@id": "https://baojiajia.tw/#organization"
        },
        "inLanguage": "zh-TW"
      },
      {
        "@type": "WebPage",
        "@id": "https://baojiajia.tw/#webpage",
        "url": "https://baojiajia.tw/",
        "name": "保家佳 | 保險理財知識分享",
        "isPartOf": {
          "@id": "https://baojiajia.tw/#website"
        },
        "about": {
          "@id": "https://baojiajia.tw/#organization"
        },
        "description": "致力於保險知識分享及提供專業的保險諮詢服務。透過淺顯易懂的方式，讓您真正了解保險、善用保險，為家人建立完整的保護網。",
        "inLanguage": "zh-TW"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title="保家佳 | 保險理財知識分享"
        description="致力於保險知識分享及提供專業的保險諮詢服務。透過淺顯易懂的方式，讓您真正了解保險、善用保險，為家人建立完整的保護網。"
        keywords={["保家佳", "保險規劃", "保險知識", "醫療保險", "壽險", "意外險", "儲蓄險", "退休規劃"]}
        schema={schema}
      />
      <Navigation />
      <Hero />
      <AnalysisIntro />
      <WhyChooseUs />
      <LineMagnet />
      <LatestPosts />
      <Services />
      <Testimonials />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <ResourceCta heading="開始你的保險規劃之旅" />
      </div>
      <Footer />
    </div>
  );
}
