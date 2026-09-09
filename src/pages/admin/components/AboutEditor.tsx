import { useState, useEffect } from 'react';
import { db as supabase } from '../../../lib/database';

/**
 * 後台「關於我們」。
 *
 * 改版前這一頁是三張卡片的選單，點進去有九個欄位，但前台一個都沒讀：
 * 前台的成立初衷讀 about_content.story_value（舊資料是 content_value），
 * 四個數字讀 statistics，團隊區塊在改版時就整個拿掉了。
 * 所以使用者在這裡改什麼，網站上都不會變。
 *
 * 現在的原則：這裡只留真的會影響前台的欄位，順序也照前台由上到下排。
 * 不在這裡改的東西，最下面那張卡會講清楚要去哪裡改。
 */

// 前台 src/pages/about/page.tsx 的預設文案。資料庫還沒有 story_value 時，
// 用它把目前線上顯示的六段拼回來當作編輯器的初始值——一個字都不改。
const LEGACY_FIRST =
  '哈囉～我是保家佳的昊恩，是一位保險經紀人業務。深耕保險業多年，在 Instagram 上累積分享超過 200 篇保險知識文章，希望能夠降低與消費者之間的資訊落差，保障你們「知的權利」。';
const LEGACY_LAST =
  '我們不只是能協助你比較多家商品，我們會依據你的需求，在保險市場上找尋最適合你的規劃方式。';

interface AboutContent {
  id: string;
  mission_title: string;
  story_value: string;
}

interface CoreValue {
  id: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  onBack: () => void;
  onGo?: (id: string) => void;
}

function toParagraphs(text: string) {
  return text.split(/\r?\n/).map((p) => p.trim()).filter(Boolean);
}

export default function AboutEditor({ onBack, onGo }: Props) {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [values, setValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [contentRes, valuesRes] = await Promise.all([
          supabase.from('about_content').select('*').maybeSingle(),
          supabase.from('core_values').select('*').order('display_order', { ascending: true }),
        ]);

        const row = contentRes.data as (AboutContent & { content_value?: string }) | null;

        // story_value 是現在的欄位；還沒有的話，用舊的 content_value
        // 前後補上程式碼裡那兩段，湊回線上現在顯示的樣子。
        const story = row?.story_value?.trim()
          ? row.story_value
          : [LEGACY_FIRST, ...toParagraphs(row?.content_value ?? ''), LEGACY_LAST].join('\n\n');

        setAbout({
          id: row?.id ?? '',
          mission_title: row?.mission_title?.trim() || '保家佳的成立初衷',
          story_value: story,
        });
        setValues((valuesRes.data as CoreValue[]) ?? []);
      } catch (error) {
        console.error('Error fetching about data:', error);
        setNotice({ kind: 'err', text: '讀取失敗，請重新整理頁面再試一次。' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!about) return;
    setSaving(true);
    setNotice(null);
    try {
      const payload = {
        mission_title: about.mission_title.trim(),
        story_value: toParagraphs(about.story_value).join('\n\n'),
      };

      if (about.id) {
        const { error } = await supabase.from('about_content').update(payload).eq('id', about.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('about_content').insert(payload).select().single();
        if (error) throw error;
        if (data) setAbout((prev) => ({ ...prev!, id: (data as AboutContent).id }));
      }

      for (const value of values) {
        const { error } = await supabase
          .from('core_values')
          .update({
            title: value.title.trim(),
            description: value.description.trim(),
            display_order: value.display_order,
            is_active: value.is_active,
          })
          .eq('id', value.id);
        if (error) throw error;
      }

      setNotice({ kind: 'ok', text: '已儲存。到前台重新整理就會看到新的內容。' });
    } catch (error) {
      console.error('Error saving about content:', error);
      setNotice({ kind: 'err', text: '儲存失敗：' + ((error as any)?.message ?? '請稍後再試') });
    } finally {
      setSaving(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    // display_order 跟著位置走，不跟著卡片走，不然存回去順序會亂掉。
    setValues(next.map((value, i) => ({ ...value, display_order: i + 1 })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-cream-300 bg-white py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-cream-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 讀取失敗時不能回傳 null，不然使用者看到的是一片空白、不知道發生什麼事。
  if (!about) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8">
        <p className="text-[0.95rem] font-semibold text-red-700">
          {notice?.text ?? '讀不到「關於我們」的資料。'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md bg-teal-600 px-5 py-2.5 text-[0.85rem] font-semibold text-white hover:bg-teal-700"
        >
          重新整理
        </button>
      </div>
    );
  }

  const paragraphs = toParagraphs(about.story_value);

  return (
    <div className="max-w-4xl space-y-5 pb-24">
      {/* 一、成立初衷 */}
      <section className="rounded-lg border border-cream-300 bg-white p-6">
        <h2 className="font-serif text-[1.15rem] font-bold text-cream-900">一、成立初衷</h2>
        <p className="mt-1 text-[0.83rem] leading-[1.8] text-cream-600">
          關於我們頁面上，照片左邊那一整段。這裡看到的幾段，前台就是幾段。
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-cream-800">區塊標題</label>
          <input
            type="text"
            value={about.mission_title}
            onChange={(e) => setAbout({ ...about, mission_title: e.target.value })}
            className="w-full rounded-lg border border-cream-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-cream-800">
            內文
            <span className="ml-2 font-normal text-cream-500">段落之間空一行就會分段</span>
          </label>
          <textarea
            value={about.story_value}
            onChange={(e) => setAbout({ ...about, story_value: e.target.value })}
            rows={16}
            className="w-full rounded-lg border border-cream-300 px-4 py-3 font-sans text-[0.95rem] leading-[1.9] focus:border-transparent focus:ring-2 focus:ring-teal-600"
          />
          <p className="mt-2 text-[0.8rem] text-cream-500">
            目前 {paragraphs.length} 段、共 {paragraphs.join('').length} 字。
            這裡只吃純文字，不要貼 HTML 標籤，前台會原樣顯示出來。
          </p>
        </div>

        {paragraphs.length > 0 && (
          <details className="mt-4 rounded-lg border border-cream-300 bg-cream-100 px-4 py-3">
            <summary className="cursor-pointer text-[0.85rem] font-semibold text-cream-800">
              前台會長成這樣（點開看）
            </summary>
            <div className="mt-3 rounded-md bg-white px-4 py-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="mb-3 text-[0.95rem] leading-[1.95] text-cream-900 last:mb-0">{p}</p>
              ))}
            </div>
          </details>
        )}
      </section>

      {/* 二、核心價值 */}
      <section className="rounded-lg border border-cream-300 bg-white p-6">
        <h2 className="font-serif text-[1.15rem] font-bold text-cream-900">二、我們的核心價值</h2>
        <p className="mt-1 text-[0.83rem] leading-[1.8] text-cream-600">
          白底那一區的四欄。前台照下面的順序由左到右排，編號 01 到 04 是自動加的。
        </p>

        <div className="mt-5 space-y-4">
          {values.map((value, index) => (
            <div key={value.id} className="rounded-lg border border-cream-300 bg-cream-100 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[0.8rem] font-bold text-cream-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-[0.82rem] font-semibold text-cream-800">
                    <input
                      type="checkbox"
                      checked={value.is_active}
                      onChange={(e) => setValues(values.map((v) => v.id === value.id ? { ...v, is_active: e.target.checked } : v))}
                      className="h-4 w-4 cursor-pointer rounded border-cream-300 text-teal-600 focus:ring-teal-600"
                    />
                    顯示
                  </label>
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-md border border-cream-300 bg-white px-2 py-1 text-cream-600 hover:border-teal-600 hover:text-teal-600 disabled:opacity-35 disabled:hover:border-cream-300 disabled:hover:text-cream-600"
                    aria-label="往前移"
                  >
                    <i className="ri-arrow-up-line" />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === values.length - 1}
                    className="rounded-md border border-cream-300 bg-white px-2 py-1 text-cream-600 hover:border-teal-600 hover:text-teal-600 disabled:opacity-35 disabled:hover:border-cream-300 disabled:hover:text-cream-600"
                    aria-label="往後移"
                  >
                    <i className="ri-arrow-down-line" />
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={value.title}
                onChange={(e) => setValues(values.map((v) => v.id === value.id ? { ...v, title: e.target.value } : v))}
                placeholder="標題"
                className="mb-3 w-full rounded-lg border border-cream-300 px-4 py-2.5 font-semibold focus:border-transparent focus:ring-2 focus:ring-teal-600"
              />
              <textarea
                value={value.description}
                onChange={(e) => setValues(values.map((v) => v.id === value.id ? { ...v, description: e.target.value } : v))}
                rows={2}
                placeholder="描述"
                className="w-full resize-none rounded-lg border border-cream-300 px-4 py-2.5 text-[0.9rem] leading-[1.8] focus:border-transparent focus:ring-2 focus:ring-teal-600"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 三、這一頁的其他區塊 */}
      <section className="rounded-lg border border-cream-300 bg-white p-6">
        <h2 className="font-serif text-[1.15rem] font-bold text-cream-900">這一頁還有這些，但不在這裡改</h2>
        <ul className="mt-4 space-y-3">
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cream-300 bg-cream-100 px-4 py-3">
            <span className="text-[0.88rem] text-cream-800">
              <b className="font-semibold text-cream-900">照片旁邊的四個數字</b>
              <span className="ml-2 text-cream-600">7 年 / 1.6 萬+ / 200+ / 500+</span>
            </span>
            {onGo && (
              <button onClick={() => onGo('statistics')}
                      className="whitespace-nowrap rounded-md bg-teal-600 px-4 py-2 text-[0.82rem] font-semibold text-white hover:bg-teal-700">
                去「資歷數字」→
              </button>
            )}
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cream-300 bg-cream-100 px-4 py-3">
            <span className="text-[0.88rem] text-cream-800">
              <b className="font-semibold text-cream-900">Instagram 連結</b>
              <span className="ml-2 text-cream-600">照片下面那顆 @baojia_jia</span>
            </span>
            {onGo && (
              <button onClick={() => onGo('site-settings')}
                      className="whitespace-nowrap rounded-md bg-teal-600 px-4 py-2 text-[0.82rem] font-semibold text-white hover:bg-teal-700">
                去「網站設定」→
              </button>
            )}
          </li>
          <li className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-[0.88rem] text-cream-800">
            <b className="font-semibold text-cream-900">創辦人的照片、姓名、頭銜</b>
            <span className="ml-2 text-cream-600">寫死在程式碼裡，要換再跟我說。</span>
          </li>
          <li className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-[0.88rem] text-cream-800">
            <b className="font-semibold text-cream-900">最下面的金色面板</b>
            <span className="ml-2 text-cream-600">五個頁面共用同一份，寫死在程式碼裡。</span>
          </li>
        </ul>
      </section>

      {/* 儲存列 */}
      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-end gap-4 border-t border-cream-300 bg-[#F4F5F7]/95 px-1 py-4 backdrop-blur">
        {notice && (
          <span className={`mr-auto text-[0.86rem] font-semibold ${notice.kind === 'ok' ? 'text-teal-600' : 'text-red-600'}`}>
            {notice.text}
          </span>
        )}
        <a href="/about" target="_blank" rel="noopener noreferrer"
           className="rounded-md border border-cream-300 bg-white px-4 py-2.5 text-[0.85rem] font-semibold text-teal-600 hover:border-teal-600">
          看前台
        </a>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-teal-600 px-7 py-2.5 text-[0.9rem] font-semibold text-white hover:bg-teal-700 disabled:bg-cream-400"
        >
          {saving ? '儲存中...' : '儲存'}
        </button>
      </div>
    </div>
  );
}
