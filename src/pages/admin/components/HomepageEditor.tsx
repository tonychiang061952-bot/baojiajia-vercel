import { useState, useEffect } from 'react';
import { db as supabase } from '../../../lib/database';

interface HomepageContent {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_button1_text: string;
  hero_button1_link: string;
  hero_button2_text: string;
  hero_button2_link: string;
  hero_image_url: string;
  cta_title: string;
  cta_description: string;
  cta_button1_text: string;
  cta_button1_link: string;
  cta_button2_text: string;
  cta_button2_link: string;
  instagram_text: string;
  instagram_handle: string;
  instagram_url: string;
}

interface Props {
  onBack: () => void;
}

export default function HomepageEditor({ onBack }: Props) {
  const [content, setContent] = useState<HomepageContent | null>({
    id: '',
    hero_title: '我們的願景是\n打破傳統保險業務的框架',
    hero_subtitle: '',
    hero_description: '提供對等、客觀、正確的資訊，\n讓大家在資訊爆炸的環境中有辨別好壞的能力。\n用專業的知識為你在市場中找出最適合的規劃方案！',
    hero_button1_text: '需求分析 DIY',
    hero_button1_link: '/analysis',
    hero_button2_text: '保險知識分享',
    hero_button2_link: '/blog',
    hero_image_url: '',
    cta_title: '開始您的保險規劃之旅',
    cta_description: '先透過「需求分析 DIY」了解自己的保障缺口，或直接預約諮詢，讓保家佳為您量身規劃',
    cta_button1_text: '立即開始需求分析',
    cta_button1_link: '/analysis',
    cta_button2_text: '預約專人諮詢',
    cta_button2_link: '/contact',
    instagram_text: '追蹤我們的 Instagram',
    instagram_handle: '@baojiajia',
    instagram_url: 'https://instagram.com/baojiajia'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('display_order');

      if (error) throw error;

      // 將多筆資料組織成物件格式
      if (data && data.length > 0) {
        const organized: any = {};
        data.forEach((item: any) => {
          organized[item.content_key] = item.content_value;
        });
        setContent(prev => ({ ...prev, ...organized }));
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    try {
      // 先獲取所有現有記錄
      const { data: existingData } = await supabase
        .from('homepage_content')
        .select('*');

      // 更新或新增每個欄位
      const updates = Object.entries(content).map(([key, value]) => {
        if (key === 'id') return null; // Skip ID

        const existing = existingData?.find((item: any) => item.content_key === key);

        if (existing) {
          return supabase
            .from('homepage_content')
            .update({
              content_value: value as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          return supabase
            .from('homepage_content')
            .insert({
              content_key: key,
              content_value: value as string,
              display_order: 0 // You might want to set order logic
            });
        }
      }).filter(Boolean);

      await Promise.all(updates);
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving homepage content:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof HomepageContent, value: string) => {
    if (!content) return;
    setContent({ ...content, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cream-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-center">
          <p className="text-cream-600">無法載入內容</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cream-900 mb-2">首頁內容編輯</h1>
              <p className="text-cream-600">編輯首頁 Hero 區塊和行動呼籲內容</p>
            </div>
          </div>
        </div>

        {/* 首頁最上方的區塊。改版後不再用輪播圖，改成文字式，
            所以這幾個欄位是有效的；hero_image_url 已不再使用，故未列出。 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-cream-900 mb-2 flex items-center">
            <i className="ri-home-4-line text-purple-600 mr-3"></i>
            首頁最上方
          </h2>
          <p className="text-sm text-cream-500 mb-6">首頁一打開看到的標題、說明與兩顆按鈕。</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-cream-800 mb-2">主標題</label>
              <input
                type="text"
                value={content.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-800 mb-2">副標題</label>
              <input
                type="text"
                value={content.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-800 mb-2">說明文字</label>
              <textarea
                rows={3}
                value={content.hero_description}
                onChange={(e) => handleChange('hero_description', e.target.value)}
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-cream-800 mb-2">按鈕一 文字</label>
                <input
                  type="text"
                  value={content.hero_button1_text}
                  onChange={(e) => handleChange('hero_button1_text', e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream-800 mb-2">按鈕一 連結</label>
                <input
                  type="text"
                  value={content.hero_button1_link}
                  onChange={(e) => handleChange('hero_button1_link', e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream-800 mb-2">按鈕二 文字</label>
                <input
                  type="text"
                  value={content.hero_button2_text}
                  onChange={(e) => handleChange('hero_button2_text', e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream-800 mb-2">按鈕二 連結</label>
                <input
                  type="text"
                  value={content.hero_button2_link}
                  onChange={(e) => handleChange('hero_button2_link', e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 行動呼籲區塊的欄位已移除。
            改版後首頁最下方換成全站共用的那一塊（自介 + LINE 領取 + 需求分析 DIY），
            首頁、文章頁、服務項目、服務細頁、關於我們五個頁面共用同一份文案，
            寫在程式碼裡以確保五頁一致。要調整請找工程協助。 */}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-cream-400 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            {saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>
    </div>
  );
}
