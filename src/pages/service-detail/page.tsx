import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db as supabase } from '../../lib/database';
import Navigation from '../../components/feature/Navigation';
import { SEO } from '../../components/SEO';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  content: string;
  hero_image_url?: string;
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('service_items')
          .select('*')
          .eq('slug', slug)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const item = data[0];

          // service_details is fetched separately rather than as an embedded
          // select: the database client talks to /api/database, which has no
          // equivalent of Supabase's nested resource syntax.
          const { data: details, error: detailsError } = await supabase
            .from('service_details')
            .select('*')
            .eq('service_id', item.id)
            .limit(1);

          if (detailsError) throw detailsError;

          setService({
            id: item.id,
            title: item.title,
            description: item.description,
            icon: item.icon,
            image_url: item.image_url,
            content: details?.[0]?.content || '',
            hero_image_url: details?.[0]?.hero_image_url
          });
        }
      } catch (error) {
        console.error('Error fetching service detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">找不到此服務項目</h2>
          <p className="text-gray-600 mb-6">抱歉，您要查看的服務項目不存在</p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            返回服務項目
          </Link>
        </div>
      </div>
    );
  }

  const ctaBySlug: Record<string, { title: string; description: string; button: string; icon: string }> = {
    'savings-planning': {
      title: '先把目標與現金流整理清楚',
      description: '你不需要先決定要使用什麼工具。帶著目前的收入、支出與想完成的目標，我們先一起找出真正卡住的地方。',
      button: '預約儲蓄理財諮詢',
      icon: 'ri-compass-3-line'
    },
    'retirement-planning': {
      title: '先知道退休後每個月可能差多少',
      description: '帶著勞保、勞退與目前資產資料，我們先盤點已有資源，再把生活期待轉成看得懂的退休現金流。',
      button: '預約退休現金流盤點',
      icon: 'ri-line-chart-line'
    }
  };
  const cta = ctaBySlug[slug || ''] || {
    title: '想把自己的狀況整理清楚嗎？',
    description: '不必先決定要買什麼。把目前的疑問帶來，我們先從現況與需求開始。',
    button: '預約諮詢，先聊聊',
    icon: 'ri-chat-smile-3-line'
  };

  return (
    <div className="min-h-screen bg-cream-100">

      <SEO
        title={`${service.title} | 保家佳專業服務`}
        description={service.description}
        image={service.hero_image_url || service.image_url}
        url={`/services/${slug}`}
        type="article"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": service.title,
          "description": service.description,
          "provider": {
            "@type": "Organization",
            "name": "保家佳"
          },
          "serviceType": service.title
        }}
      />
      {/* 頂部導航 */}
      <Navigation />

      {/* Hero Section - 響應式縮放，PC端寬度1000px，圓角20px */}
      <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="relative h-96 sm:h-80 md:h-96 lg:h-96 w-full bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `url(${service.hero_image_url || service.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            maxWidth: '1000px',
            borderRadius: '20px'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 w-fit transition-colors whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i>
              返回首頁
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                <i className={`${service.icon} text-3xl text-white`}></i>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{service.title}</h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ maxWidth: '1000px' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div
            className={`service-content service-content--${slug} prose max-w-none
              ${slug === 'policy-checkup' ? 'prose-ol:list-none' : 'prose-ol:list-decimal'}
            `}
            dangerouslySetInnerHTML={{ __html: service.content }}
          />

          {/* CTA Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="service-page-cta rounded-2xl p-8 text-center">
              <div className="service-page-cta__icon" aria-hidden="true">
                <i className={cta.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{cta.title}</h3>
              <p className="text-gray-700 mb-6 text-base leading-relaxed max-w-2xl mx-auto">{cta.description}</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  <i className="ri-mail-line"></i>
                  {cta.button}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
