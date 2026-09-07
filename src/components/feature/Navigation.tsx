import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGoogleAuth } from '../../auth/GoogleAuthProvider';
import { GoogleSignInButton } from '../GoogleSignInButton';
import { db } from '../../lib/database';

type NavItem = { path: string; label: string };

// 後台改不到選單一直是個問題：這裡原本把七個項目寫死。
// 現在改成讀 navigation_items，讀不到時才用這份保底清單，
// 確保資料庫出問題時導覽列不會整個消失。
const FALLBACK_NAV: NavItem[] = [
  { path: '/', label: '首頁' },
  { path: '/services', label: '服務項目' },
  { path: '/beginner', label: '保險新手村' },
  { path: '/analysis', label: '需求分析 DIY' },
  { path: '/blog', label: '知識專區' },
  { path: '/about', label: '關於我們' },
  { path: '/contact', label: '聯絡我們' },
];

const FALLBACK_LOGO = '/logo.png';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(FALLBACK_NAV);
  const [logoUrl, setLogoUrl] = useState(FALLBACK_LOGO);
  const { user, signOut } = useGoogleAuth();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [nav, settings] = await Promise.all([
          db.from('navigation_items').select('path, label').eq('is_active', true)
            .order('display_order', { ascending: true }),
          db.from('site_settings').select('setting_key, setting_value'),
        ]);
        if (!alive) return;
        const items = (nav.data ?? []).filter((i: any) => i?.path && i?.label);
        if (items.length) setNavItems(items as NavItem[]);
        const logo = (settings.data ?? []).find((r: any) => r.setting_key === 'logo_url')?.setting_value;
        if (logo) setLogoUrl(logo);
      } catch (error) {
        console.error('Navigation settings failed to load:', error);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          <Link to="/" className="cursor-pointer flex items-center">
            <img 
              src={logoUrl} 
              alt="保家佳" 
              className="h-10 sm:h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm lg:text-base text-gray-700 hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 hidden xl:block">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm lg:text-base text-gray-700 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  登出
                </button>
                {user.picture && (
                  <img 
                    src={user.picture}
                    alt="avatar" 
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                )}
              </div>
            ) : (
              <GoogleSignInButton />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl text-gray-700`}></i>
          </button>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-14 sm:top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-100">
              <div className="px-4 py-3 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="pt-2 border-t border-gray-100 mt-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 py-2 px-2">
                        {user.picture && (
                          <img 
                            src={user.picture}
                            alt="avatar" 
                            className="w-8 h-8 rounded-full border border-gray-200"
                          />
                        )}
                        <span className="text-sm text-gray-600 truncate">{user.email}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer px-2"
                      >
                        登出
                      </button>
                    </>
                  ) : (
                    <GoogleSignInButton className="px-2 py-2" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
