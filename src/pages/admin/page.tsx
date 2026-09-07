
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '../../auth/GoogleAuthProvider';
import Dashboard from './components/Dashboard';
import ServiceItemEditor from './components/ServiceItemEditor';
import ServiceDetailEditor from './components/ServiceDetailEditor';
import HomepageEditor from './components/HomepageEditor';
import FeaturesEditor from './components/FeaturesEditor';
import CustomerReviewsEditor from './components/CustomerReviewsEditor';
import BlogEditor from './components/BlogEditor';
import AboutEditor from './components/AboutEditor';
import MemberManager from './components/MemberManager';
import NavigationEditor from './components/NavigationEditor';
import SystemSettingsEditor from './components/SystemSettingsEditor';
import SiteSettingsEditor from './components/SiteSettingsEditor';
import StatisticsEditor from './components/StatisticsEditor';
import CategoryManager from './components/CategoryManager';
import ServiceManager from './components/ServiceManager';
import PdfTemplateEditor from './components/PdfTemplateEditor';
import { SEO } from '../../components/SEO';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

type EditMode = 'dashboard' | 'list' | 'service-item' | 'service-detail' | 'homepage' | 'features' | 'customer-reviews' | 'blog' | 'about' | 'member-manager' | 'navigation' | 'site-settings' | 'system-settings' | 'statistics' | 'blog-categories' | 'pdf-template';

export default function AdminPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('dashboard');
  const { signOut } = useGoogleAuth();

  const handleEditItem = (service: ServiceItem) => {
    setSelectedService(service);
    setEditMode('service-item');
  };

  const handleEditDetail = (service: ServiceItem) => {
    setSelectedService(service);
    setEditMode('service-detail');
  };

  const handleBack = () => {
    setEditMode('list');
    setSelectedService(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 分組之後才看得出哪些是內容、哪些是設定。
  // 每一項都標明會影響前台哪裡，改的時候不用猜。
  const menuGroups: {
    group: string;
    items: { id: EditMode; label: string; icon: string; affects?: string; to?: string }[];
  }[] = [
    {
      group: '總覽',
      items: [
        { id: 'dashboard', label: '儀表板', icon: 'ri-dashboard-line' },
      ],
    },
    {
      group: '網站內容',
      items: [
        { id: 'homepage', label: '首頁內容', icon: 'ri-home-4-line', affects: '首頁最上方的標題、說明與兩顆按鈕。', to: '/' },
        { id: 'list', label: '服務項目', icon: 'ri-list-check', affects: '首頁的「我們的服務」、服務項目列表頁，以及六個服務細頁。', to: '/services' },
        { id: 'features', label: '服務特點', icon: 'ri-star-line', affects: '首頁的五個服務特點。', to: '/' },
        { id: 'about', label: '關於我們', icon: 'ri-team-line', affects: '關於我們的成立初衷與核心價值。', to: '/about' },
        { id: 'statistics', label: '資歷數字', icon: 'ri-bar-chart-box-line', affects: '關於我們頁面上，照片旁邊的四個數字。', to: '/about' },
      ],
    },
    {
      group: '文章',
      items: [
        { id: 'blog', label: '知識專區', icon: 'ri-article-line', affects: '保險知識專區的列表與每一篇文章頁。', to: '/blog' },
        { id: 'blog-categories', label: '文章分類', icon: 'ri-folder-settings-line', affects: '知識專區的分類篩選與側欄的分類清單。', to: '/blog' },
      ],
    },
    {
      group: '訪客互動',
      items: [
        { id: 'customer-reviews', label: '真實評價', icon: 'ri-star-smile-line', affects: '首頁的「客戶真實分享」。審核通過才會公開。', to: '/' },
        { id: 'member-manager', label: '下載管理', icon: 'ri-user-search-line', affects: '需求分析 DIY 完成後留下資料、下載報告的名單。' },
      ],
    },
    {
      group: '設定',
      items: [
        { id: 'site-settings', label: '網站設定', icon: 'ri-settings-4-line', affects: '導覽列的 Logo，以及頁尾的 Instagram、Facebook、LINE 連結。' },
        { id: 'navigation', label: '導覽選單', icon: 'ri-menu-line', affects: '網站最上方的導覽列，桌機版與手機版都會跟著變。' },
        { id: 'pdf-template', label: 'PDF 報告模板', icon: 'ri-file-pdf-line', affects: '需求分析 DIY 做完之後，客戶下載的那份報告。' },
        { id: 'system-settings', label: '系統設定', icon: 'ri-settings-2-line' },
      ],
    },
  ];

  const allItems = menuGroups.flatMap((g) => g.items);
  const current = allItems.find((item) =>
    item.id === editMode || (item.id === 'list' && (editMode === 'service-item' || editMode === 'service-detail')));

  const heading = editMode === 'service-item' ? '編輯服務項目'
    : editMode === 'service-detail' ? '編輯服務內容'
    : current?.label ?? '後台';

  const renderContent = () => {
    switch (editMode) {
      case 'service-item':
        return selectedService ? <ServiceItemEditor service={selectedService} onBack={handleBack} /> : null;
      case 'service-detail':
        return selectedService ? <ServiceDetailEditor service={selectedService} onBack={handleBack} /> : null;
      case 'homepage':
        return <HomepageEditor onBack={handleBack} />;
      case 'features':
        return <FeaturesEditor onBack={handleBack} />;
      case 'customer-reviews':
        return <CustomerReviewsEditor onBack={handleBack} />;
      case 'blog':
        return <BlogEditor onBack={handleBack} />;
      case 'about':
        return <AboutEditor onBack={handleBack} />;
      case 'member-manager':
        return <MemberManager />;
      case 'navigation':
        return <NavigationEditor onBack={handleBack} />;
      case 'site-settings':
        return <SiteSettingsEditor onBack={handleBack} />;
      case 'system-settings':
        return <SystemSettingsEditor onBack={handleBack} />;
      case 'statistics':
        return <StatisticsEditor onBack={handleBack} />;
      case 'blog-categories':
        return <CategoryManager onBack={handleBack} />;
      case 'pdf-template':
        return <PdfTemplateEditor onBack={handleBack} />;
      case 'list':
        return <ServiceManager onEditItem={handleEditItem} onEditDetail={handleEditDetail} />;
      case 'dashboard':
      default:
        return <Dashboard onGo={(id) => setEditMode(id as EditMode)} />;
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#F4F5F7] lg:grid-cols-[236px_minmax(0,1fr)]">
      <SEO title="網站管理後台 | 保家佳" description="保家佳網站管理區域。" url="/admin" noindex />

      <aside className="flex flex-col border-r border-cream-300 bg-white lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center gap-2.5 border-b border-cream-300 px-4 py-4">
          <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
          <span>
            <b className="block text-[0.95rem] font-bold tracking-wide text-cream-900">保家佳</b>
            <span className="block text-[0.7rem] text-cream-500">網站管理</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3.5">
          {menuGroups.map((group) => (
            <div key={group.group} className="mb-4">
              <h2 className="mb-1.5 px-2 text-[0.66rem] font-bold tracking-[0.16em] text-cream-500">{group.group}</h2>
              {group.items.map((item) => {
                const active = item.id === editMode
                  || (item.id === 'list' && (editMode === 'service-item' || editMode === 'service-detail'));
                return (
                  <button
                    key={item.id}
                    onClick={() => { setEditMode(item.id); if (item.id === 'list') setSelectedService(null); }}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[0.88rem] transition-colors ${
                      active ? 'bg-teal-600 font-semibold text-white' : 'text-cream-600 hover:bg-cream-100 hover:text-cream-900'
                    }`}
                  >
                    <i className={`${item.icon} w-4 text-center text-[0.9rem] ${active ? 'opacity-100' : 'opacity-70'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-cream-300 p-3">
          <a href="/" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.86rem] text-cream-600 hover:bg-cream-100">
            <i className="ri-external-link-line w-4 text-center" />
            看網站前台
          </a>
          <button onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[0.86rem] text-cream-600 hover:bg-red-50 hover:text-red-600">
            <i className="ri-logout-box-line w-4 text-center" />
            登出
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-6 sm:px-8 sm:py-7">
        {/* 每一頁上方都有同一條標題列，才知道自己現在在後台的哪裡。 */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-[1.45rem] font-bold text-cream-900">{heading}</h1>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-cream-300 bg-white px-3.5 py-2 text-[0.82rem] font-semibold text-teal-600 hover:border-teal-600"
          >
            <i className="ri-external-link-line" />
            開啟網站前台
          </a>
        </div>

        {current?.affects && (
          <div className="mb-5 grid grid-cols-1 items-center gap-3.5 rounded-lg border border-brandgold-edge bg-brandgold-panel px-5 py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandgold text-brandgold-ink">
              <i className="ri-arrow-right-up-line" />
            </span>
            <span>
              <b className="block text-[0.9rem] font-bold text-cream-900">這一區會影響前台哪裡</b>
              <span className="mt-0.5 block text-[0.82rem] leading-[1.7] text-cream-600">{current.affects}</span>
            </span>
            {current.to && (
              <a href={current.to} target="_blank" rel="noopener noreferrer"
                 className="whitespace-nowrap rounded-md bg-teal-600 px-4 py-2 text-[0.82rem] font-semibold text-white hover:bg-teal-700">
                前往查看 →
              </a>
            )}
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}
