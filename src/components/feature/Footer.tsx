import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VisitorCounter from '../VisitorCounter';
import { db } from '../../lib/database';

// 社群連結原本寫死在這裡，後台的「網站設定」改了也不會生效。
// 改成讀 site_settings，讀不到時退回目前正在用的網址。
const FALLBACK_SOCIAL = {
  instagram_url: 'https://www.instagram.com/baojia_jia/',
  facebook_url: 'https://www.facebook.com/Baojiajia.tw',
  line_url: 'https://lin.ee/Z7HOfYBe',
};

export default function Footer() {
  const [social, setSocial] = useState(FALLBACK_SOCIAL);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await db.from('site_settings').select('setting_key, setting_value');
        if (!alive || !data) return;
        const next = { ...FALLBACK_SOCIAL };
        for (const row of data as any[]) {
          const value = (row?.setting_value ?? '').trim();
          if (value && row.setting_key in next) (next as any)[row.setting_key] = value;
        }
        setSocial(next);
      } catch (error) {
        console.error('Footer settings failed to load:', error);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <footer className="bg-cream-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ fontFamily: '"Pacifico", serif' }}>保家佳</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed max-w-md">
            用知識守護每個家庭，讓保險不再艱澀難懂
          </p>
          <div className="flex space-x-3 sm:space-x-4">
            <a 
              href={social.instagram_url} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <i className="ri-instagram-line text-lg sm:text-xl"></i>
            </a>
            <a 
              href={social.facebook_url} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <i className="ri-facebook-fill text-lg sm:text-xl"></i>
            </a>
            <a 
              href={social.line_url} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <i className="ri-line-fill text-lg sm:text-xl"></i>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              保家佳 All rights reserved.
            </p>
            <VisitorCounter />
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-teal-400 text-xs sm:text-sm transition-colors cursor-pointer">
              隱私政策
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-teal-400 text-xs sm:text-sm transition-colors cursor-pointer">
              服務條款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
