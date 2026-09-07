import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db as supabase } from '../../../lib/database';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  slug: string;
  display_order: number;
}

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('service_items')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="border-b border-cream-300 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-cream-900">我們的服務</h2>
            <p className="mt-2 text-[0.9rem] text-cream-600">載入中⋯⋯</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-cream-300 py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="font-serif text-2xl font-bold text-cream-900">我們的服務</h2>
            <p className="mt-2 text-[0.9rem] text-cream-600">不同人生階段，需要處理的問題不一樣</p>
          </div>
          <Link to="/services" className="text-[0.86rem] font-semibold text-teal-600 hover:underline underline-offset-4 whitespace-nowrap">
            看全部服務 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.slug}`}
              className="group flex flex-col overflow-hidden rounded-md border border-cream-300 bg-cream-50 hover:border-teal-600 transition-colors"
            >
              <div className="aspect-[16/9] overflow-hidden bg-cream-200">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[1.05rem] font-bold text-cream-900 mb-2">{service.title}</h3>
                <p className="text-[0.85rem] leading-[1.75] text-cream-600 line-clamp-3">{service.description}</p>
                <span className="mt-auto pt-4 text-[0.83rem] font-semibold text-teal-600">閱讀完整介紹 →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
