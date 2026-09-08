import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { db } from '../../lib/database';
import { SEO } from '../../components/SEO';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  updated_at: string;
  read_time: string;
  image_url: string;
  content: string;
  is_featured: boolean;
  is_active: boolean;
  content_updated_at?: string | null;
  slug?: string;
}

/** 列表要用的日期：有實質更新日就用它，否則用發布日。 */
const listDate = (post: { content_updated_at?: string | null; published_at: string }) =>
  post.content_updated_at || post.published_at;

export default function Blog() {
  // 分類放在網址上，這樣側欄與文章頁的分類連結才有作用，也才能分享。
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '全部';
  const setSelectedCategory = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === '全部') next.delete('category');
    else next.set('category', category);
    setSearchParams(next, { replace: true });
  };
  const [searchKeyword, setSearchKeyword] = useState('');
  // 全部文章只抓一次，分類與關鍵字都在前端篩。
  // 這樣側欄的分類數字、最新文章、編輯精選永遠是全站的資料，
  // 不會因為點了某個分類就只剩下那個分類的東西。
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  // Refresh data when component becomes visible (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPosts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await db
        .from('blog_categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        setCategories(['全部', '保險基礎', '醫療保障', '理財規劃', '理賠實務', '案例分享']);
        return;
      }

      const categoryNames = (data && Array.isArray(data)) ? data.map((c: any) => c.name) : [];
      setCategories(['全部', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['全部', '保險基礎', '醫療保障', '理財規劃', '理賠實務', '案例分享']);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await db
        .from('blog_posts')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      // 依「實質更新日 → 發布日」排序：只有在後台勾選過實質更新的文章才會往前排，
      // 順手改錯字不會影響順序。排序用的日期就是卡片上印出來的那一個。
      const sorted = [...(data || [])].sort(
        (a: BlogPost, b: BlogPost) => listDate(b).localeCompare(listDate(a))
      );
      setAllPosts(sorted);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 只有中間那排文章卡片會跟著分類與搜尋變動。
  const keyword = searchKeyword.trim().toLowerCase();
  const matchesKeyword = (post: BlogPost) =>
    !keyword ||
    [post.title, post.excerpt, post.category, post.content].some(
      (field) => (field || '').toLowerCase().includes(keyword)
    );
  const filteredPosts = allPosts.filter(
    (post) =>
      (selectedCategory === '全部' || post.category === selectedCategory) && matchesKeyword(post)
  );

  // 側欄是全站的，跟目前選了哪個分類無關。
  const featuredPosts = allPosts.filter(post => post.is_featured).slice(0, 5);
  const recentPosts = [...allPosts].sort((a, b) => listDate(b).localeCompare(listDate(a))).slice(0, 5);

  // Format date
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const shownDate = (post: BlogPost) =>
    post.content_updated_at ? `${formatDate(post.content_updated_at)} 更新` : formatDate(post.published_at);

  const categoryCounts = new Map<string, number>();
  for (const post of allPosts) categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title="保險知識專區 | 保家佳"
        description="最專業的保險知識分享，包含醫療險、意外險、儲蓄險等各類保險理財觀念，讓你輕鬆搞懂保險。"
        keywords={['保險知識', '保險觀念', '保險理財', '醫療險', '意外險', '保單健診']}
        url="/blog"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://baojiajia.tw/' },
            { '@type': 'ListItem', position: 2, name: '保險知識專區' },
          ],
        }}
      />
      <Navigation />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_292px] items-start gap-9 lg:gap-13 px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <main>
          <header className="mb-7">
            <h1 className="font-serif text-[1.6rem] sm:text-[2rem] font-bold text-cream-900 leading-[1.4]">保險知識專區</h1>
            <p className="mt-2 text-[0.95rem] text-cream-600">用淺顯易懂的方式，讓保險不再艱澀難懂</p>
            <p className="mt-2.5 text-[0.8rem] text-cream-500 tabular-nums">目前 {filteredPosts.length} 篇文章</p>
          </header>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="搜尋文章標題、內容或分類"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full rounded-md border border-cream-300 bg-white py-3 pl-4 pr-11 text-[0.93rem] text-cream-900 focus:border-teal-600 focus:outline-none"
            />
            <i className="ri-search-line absolute right-4 top-1/2 -translate-y-1/2 text-cream-500" />
          </div>

          <div className="mb-6 flex flex-wrap gap-2 border-b border-cream-300 pb-6">
            {categories.map((category) => {
              const count = category === '全部' ? allPosts.length : categoryCounts.get(category) ?? 0;
              if (category !== '全部' && !count) return null;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-sm border px-3.5 py-1.5 text-[0.85rem] transition-colors ${
                    selectedCategory === category
                      ? 'border-teal-600 bg-teal-600 font-semibold text-white'
                      : 'border-cream-300 bg-white text-cream-600 hover:border-teal-600 hover:text-teal-600'
                  }`}
                >
                  {category}
                  <i className="not-italic ml-1.5 text-[0.78rem] opacity-65">{count}</i>
                </button>
              );
            })}
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={post.slug ? `/blog/${post.slug}` : `/blog/id/${post.id}`}
                  className="group flex min-w-0 flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded border border-cream-300 bg-cream-200">
                    {post.image_url && (
                      <img src={post.image_url} alt={post.title} loading="lazy"
                           className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                  </div>
                  <span className="mt-3.5 self-start rounded-sm bg-brandgold px-2 py-0.5 text-[0.63rem] font-bold tracking-[0.14em] text-brandgold-ink">
                    {post.category}
                  </span>
                  <h2 className="mt-2 line-clamp-2 text-base font-bold leading-[1.6] text-cream-900 group-hover:text-teal-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-3 text-[0.85rem] leading-[1.75] text-cream-600">{post.excerpt}</p>
                  <span className="mt-auto pt-2.5 text-[0.77rem] text-cream-500 tabular-nums">
                    {shownDate(post)}{post.read_time ? ` · ${post.read_time} 分鐘` : ''}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center">
              <p className="text-cream-600">找不到符合條件的文章</p>
              <button
                onClick={() => { setSearchKeyword(''); setSelectedCategory('全部'); }}
                className="mt-4 rounded-md bg-teal-600 px-5 py-2.5 text-[0.88rem] font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                清除篩選條件
              </button>
            </div>
          )}
        </main>

        <aside>
          {recentPosts.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 border-b border-cream-300 pb-2 text-[0.73rem] font-bold tracking-[0.15em] text-cream-600">最新文章</h2>
              <ul>
                {recentPosts.map((post) => (
                  <li key={post.id} className="border-b border-cream-200 py-3 first:pt-0 last:border-b-0 last:pb-0">
                    <Link to={post.slug ? `/blog/${post.slug}` : `/blog/id/${post.id}`}
                          className="block text-[0.88rem] font-semibold leading-[1.6] text-cream-900 hover:text-teal-600 transition-colors">
                      {post.title}
                      <time className="mt-1 block text-[0.76rem] font-normal text-cream-500 tabular-nums">{shownDate(post)}</time>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-8">
            <h2 className="mb-3 border-b border-cream-300 pb-2 text-[0.73rem] font-bold tracking-[0.15em] text-cream-600">分類</h2>
            <ul>
              {categories.filter((c) => c !== '全部').map((category) => {
                const count = categoryCounts.get(category) ?? 0;
                return (
                  <li key={category} className="flex items-center justify-between gap-2.5 border-b border-cream-200 py-2 text-[0.89rem] last:border-b-0">
                    {count ? (
                      <button onClick={() => setSelectedCategory(category)} className="text-cream-900 hover:text-teal-600 hover:underline underline-offset-4">
                        {category}
                      </button>
                    ) : (
                      <span className="text-cream-500">{category}</span>
                    )}
                    <b className="text-[0.78rem] font-medium text-cream-500 tabular-nums">{count}</b>
                  </li>
                );
              })}
            </ul>
          </section>

          {featuredPosts.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 border-b border-cream-300 pb-2 text-[0.73rem] font-bold tracking-[0.15em] text-cream-600">編輯精選</h2>
              <ul className="flex flex-col gap-3.5">
                {featuredPosts.slice(0, 3).map((post, index) => (
                  <li key={post.id} className="grid grid-cols-[22px_minmax(0,1fr)] items-start gap-3">
                    <span className="mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-teal-600 text-[0.7rem] font-bold text-white">
                      {index + 1}
                    </span>
                    <Link to={post.slug ? `/blog/${post.slug}` : `/blog/id/${post.id}`}
                          className="block text-[0.88rem] font-semibold leading-[1.6] text-cream-900 hover:text-teal-600 transition-colors">
                      {post.title}
                      <span className="mt-1 block text-[0.76rem] font-normal text-cream-500 tabular-nums">
                        {shownDate(post)}{post.read_time ? ` · ${post.read_time} 分鐘` : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-8">
            <div className="rounded-b-md border-t-[3px] border-brandgold-edge bg-brandgold-panel px-5 py-5">
              <span className="mb-1.5 block text-[0.66rem] font-bold tracking-[0.14em] text-brandgold-ink">免費領取</span>
              <b className="mb-1.5 block text-[0.95rem] font-bold leading-snug text-cream-900">小資族保險規劃攻略</b>
              <p className="mb-3.5 text-[0.81rem] leading-[1.7] text-cream-600">
                加入官方 LINE 就能下載，也可以直接私訊我。不會有任何廣告訊息。
              </p>
              <a href="https://lin.ee/Z7HOfYBe" target="_blank" rel="noopener noreferrer"
                 className="block rounded-md bg-teal-600 py-2.5 text-center text-[0.85rem] font-semibold text-white hover:bg-teal-700 transition-colors">
                加入官方 LINE
              </a>
            </div>
          </section>

          <a href="https://www.instagram.com/baojia_jia/" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-3.5 rounded-md border border-cream-300 bg-white px-4 py-4 hover:border-teal-600 transition-colors">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[0.68rem] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#C13584,#E1306C,#F77737)' }}>IG</span>
            <span className="min-w-0">
              <b className="block text-[0.88rem] font-bold text-cream-900">追蹤 @baojia_jia</b>
              <span className="mt-0.5 block text-[0.78rem] text-cream-600">最新保險知識與內容更新</span>
            </span>
          </a>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
