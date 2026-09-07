import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db as supabase } from '../../lib/database';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { SEO } from '../../components/SEO';
import ResourceCta from '../../components/feature/ResourceCta';

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
  const [allServices, setAllServices] = useState<{ slug: string; title: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('service_items').select('slug, title, description')
          .eq('is_active', true).order('display_order', { ascending: true });
        setAllServices((data as any[]) ?? []);
      } catch (error) {
        console.error('Other services failed to load:', error);
      }
    })();
  }, []);

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

  // 每一頁自己的收尾。預約一律進 /contact 的表單（那裡有「舊保單健診」的選項）。
  const bookingBySlug: Record<string, { label: string; title: string; description: string }> = {
    'policy-checkup': { label: '免費', title: '預約保單健診', description: '留下聯絡方式，我們約時間一起看你手上的保單' },
    'savings-planning': { label: '免費', title: '預約儲蓄理財諮詢', description: '帶著目前的收入、支出與想完成的目標，我們先一起找出真正卡住的地方' },
    'retirement-planning': { label: '免費', title: '預約退休現金流盤點', description: '帶著勞保、勞退與目前資產資料，我們先盤點已有資源' },
  };
  const booking = bookingBySlug[slug || ''] || {
    label: '免費',
    title: '預約諮詢',
    description: '不必先決定要買什麼。把目前的疑問帶來，我們先從現況與需求開始。',
  };

  const others = allServices.filter((s2) => s2.slug !== slug);

  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title={`${service.title} | 保家佳專業服務`}
        description={service.description}
        image={service.hero_image_url || service.image_url}
        url={`/services/${slug}`}
        type="article"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              name: service.title,
              description: service.description,
              provider: { '@type': 'Organization', name: '保家佳' },
              serviceType: service.title,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://baojiajia.tw/' },
                { '@type': 'ListItem', position: 2, name: '服務項目', item: 'https://baojiajia.tw/services' },
                { '@type': 'ListItem', position: 3, name: service.title },
              ],
            },
          ],
        }}
      />
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="pt-5 text-[0.79rem] text-cream-600">
          <Link to="/" className="hover:text-teal-600">首頁</Link>
          <span className="mx-2 text-cream-500">›</span>
          <Link to="/services" className="hover:text-teal-600">服務項目</Link>
          <span className="mx-2 text-cream-500">›</span>
          {service.title}
        </nav>

        <header className="pt-6 max-w-[760px]">
          <span className="inline-block rounded-sm bg-brandgold px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.16em] text-brandgold-ink mb-4">
            服務項目
          </span>
          <h1 className="font-serif text-[1.8rem] sm:text-4xl font-bold text-cream-900 leading-[1.4] mb-4">
            {service.title}
          </h1>
          <p className="border-l-[3px] border-brandgold pl-4 text-[1.03rem] leading-[1.9] text-cream-900">
            {service.description}
          </p>
        </header>

        {(service.hero_image_url || service.image_url) && (
          <figure className="mt-8 max-w-[860px]">
            <img
              src={service.hero_image_url || service.image_url}
              alt={service.title}
              className="w-full aspect-[16/9] object-cover rounded-md border border-cream-300"
            />
          </figure>
        )}

        <div
          className={`service-content service-content--${slug} max-w-[64ch] pt-6
            ${slug === 'policy-checkup' ? 'prose-ol:list-none' : 'prose-ol:list-decimal'}`}
          dangerouslySetInnerHTML={{ __html: service.content }}
        />

        <Link
          to="/contact"
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3 sm:gap-5 max-w-[64ch]
                     mt-10 rounded-md border border-brandgold-edge bg-brandgold-panel px-6 py-5
                     hover:border-teal-600 transition-colors"
        >
          <span>
            <span className="block text-[0.66rem] font-bold tracking-[0.16em] text-brandgold-ink mb-1">{booking.label}</span>
            <b className="block text-[1.12rem] font-bold text-cream-900">{booking.title}</b>
            <span className="block text-[0.85rem] leading-relaxed text-cream-600 mt-1">{booking.description}</span>
          </span>
          <span className="rounded-md bg-teal-600 px-5 py-2.5 text-[0.88rem] font-semibold text-white whitespace-nowrap text-center">
            前往預約 →
          </span>
        </Link>

        {others.length > 0 && (
          <section className="mt-12 pt-8 border-t border-cream-300">
            <h2 className="font-serif text-xl font-bold text-cream-900 mb-5">其他服務</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to={`/services/${o.slug}`}
                  className="group block rounded-md border border-cream-300 bg-white px-4 py-4 hover:border-teal-600 transition-colors"
                >
                  <b className="block text-[0.9rem] font-bold text-cream-900 mb-1 group-hover:text-teal-600 transition-colors">
                    {o.title}
                  </b>
                  <span className="block text-[0.78rem] leading-relaxed text-cream-600 line-clamp-2">
                    {o.description}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="py-14">
          <ResourceCta heading="我想提供給你的資源：" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
