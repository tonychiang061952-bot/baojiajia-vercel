import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { db as supabase } from '../../lib/database';
import { SEO } from '../../components/SEO';
import ResourceCta from '../../components/feature/ResourceCta';

/**
 * 文章目錄用的錨點：依序給每個 <h2> 加上 id="sec-1"、"sec-2"⋯
 * 後台的 Quill 編輯器會清掉 id，所以改在渲染時補，
 * 內容裡只要寫 <a href="#sec-1"> 就能跳轉（連結 Quill 存得住）。
 * 已經有 id 的標題不動。
 */
function withHeadingIds(html: string): string {
  let n = 0;
  return html.replace(/<h2(\s[^>]*)?>/gi, (match, attrs) => {
    const a = attrs || '';
    if (/\sid\s*=/i.test(a)) return match;
    n += 1;
    return `<h2${a} id="sec-${n}">`;
  });
}

/**
 * 內文自帶的目錄要拿掉，因為頁面上方已經有一份樣式一致、連結會跳轉的目錄。
 *
 * 9 篇文章裡有 3 篇的內文開頭寫了
 * `<p><strong>這篇文章會談什麼</strong></p><ol>⋯</ol>`，
 * 不拿掉就會一頁出現兩份目錄。
 * 這裡只是「不顯示」，資料庫裡的內容原封不動。
 */
const INLINE_TOC_TITLES = ['這篇文章會談什麼', '本篇重點', '文章目錄'];

function stripInlineToc(html: string): string {
  for (const title of INLINE_TOC_TITLES) {
    const re = new RegExp(
      `<p\\b[^>]*>\\s*(?:<strong>|<b>)?\\s*${title}\\s*(?:</strong>|</b>)?\\s*</p>\\s*<(ol|ul)\\b[\\s\\S]*?</\\1>`,
      'i',
    );
    if (re.test(html)) return html.replace(re, '');
  }
  return html;
}

/**
 * 行動呼籲區塊：把 CTA 那幾個段落包成一個 .article-cta 容器。
 *
 * 內容本身只寫純 <p>（Quill 存得住），視覺容器在渲染時才產生，
 * 所以後台怎麼編輯都不會把版面弄壞。
 *
 * 判定方式：找到含 baojiajia.tw/analysis 連結的段落當錨點，
 * 往前收兩段（處境句、誘因說明），往後收一段（免費諮詢／LINE）。
 */
function withCtaBlock(html: string): string {
  const blocks = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi);
  if (!blocks) return html;

  const anchor = blocks.find((b) => /baojiajia\.tw\/analysis/i.test(b));
  if (!anchor) return html;

  const start = html.indexOf(anchor);
  if (start < 0) return html;

  // 往前收最多兩段，且必須是緊鄰的 </p>...<p>
  let from = start;
  for (let i = 0; i < 2; i += 1) {
    const before = html.slice(0, from).trimEnd();
    if (!before.endsWith('</p>')) break;
    const prev = before.lastIndexOf('<p');
    if (prev < 0) break;
    from = prev;
  }

  // 往後收一段（免費諮詢那句）
  let to = start + anchor.length;
  const after = html.slice(to).trimStart();
  if (after.startsWith('<p')) {
    const end = html.indexOf('</p>', to);
    if (end > 0) to = end + 4;
  }

  return (
    html.slice(0, from) +
    '<div class="article-cta">' + html.slice(from, to) + '</div>' +
    html.slice(to)
  );
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  updated_at: string;
  /** 內容實質更新日。後台勾選「這次是實質更新」才會寫入。 */
  content_updated_at?: string | null;
  read_time: string;
  image_url: string;
  content: string;
  is_featured: boolean;
  is_active: boolean;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export default function BlogDetail() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 檢查 slug/id 是否有效
    if (
      (!slug && !id)
      || slug === ':slug'
      || id === ':id'
      || (slug && slug.includes(':'))
      || (id && id.includes(':'))
    ) {
      console.error('Invalid blog post param:', { slug, id });
      navigate('/blog');
      return;
    }

    fetchPost();
  }, [slug, id, navigate]);

  useEffect(() => {
    if (!post) return;
    fetchRelatedPosts();
  }, [post?.id]);



  const fetchPost = async () => {
    if ((!slug && !id) || slug === ':slug' || id === ':id') return;

    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('is_active', true);

      if (slug) {
        query = query.eq('slug', slug);
      } else if (id) {
        query = query.eq('id', id);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      setPost(data);

      // If accessed via legacy id route, redirect to slug URL when possible
      if (!slug && id && data?.slug) {
        navigate(`/blog/${data.slug}`, { replace: true });
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  // 側欄的最新文章與分類：讓讀者看完這篇還有別的路可以走
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.from('blog_posts').select('*')
          .eq('is_active', true).order('published_at', { ascending: false });
        if (!alive || !data) return;
        const rows = data as BlogPost[];
        setLatestPosts(rows.filter((p) => p.id !== post?.id).slice(0, 5));

        // 只列出真的有文章的分類，空分類點進去是空的，不如不顯示
        const counts = new Map<string, number>();
        rows.forEach((p) => {
          if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
        });
        setCategories([...counts.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count));
      } catch (error) {
        console.error('Latest posts failed to load:', error);
      }
    })();
    return () => { alive = false; };
  }, [post?.id]);

  const fetchRelatedPosts = async () => {
    if (!post) return;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', post.category)
        .eq('is_active', true)
        .neq('id', post.id)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  // 「延伸閱讀」這類小節是導覽不是內容，不列進目錄。
  const TOC_SKIP = /^(延伸閱讀|參考資料|相關文章|你可能也想知道)/;

  const headings = post?.content
    ? [...post.content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m, idx) => ({
        id: `sec-${idx + 1}`,
        text: m[1].replace(/<[^>]+>/g, '').trim(),
      })).filter((h) => h.text && !TOC_SKIP.test(h.text))
    : [];

  // 作者自己在標題裡編了號（「1.小心主約被灌水」），
  // 這時候再讓 <ol> 自動編號就會變成「1. 1.小心主約被灌水」。
  const selfNumbered = headings.length > 0
    && headings.filter((h) => /^\d+[.、）)]/.test(h.text)).length >= headings.length / 2;

  const isNewborn = /新生兒|嬰兒|寶寶|幼兒/.test(`${post?.title ?? ''}${post?.category ?? ''}`);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

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

  if (!post) {
    return (
      <div className="min-h-screen bg-cream-100">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 text-gray-300">
            <i className="ri-file-damage-line text-6xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">找不到文章</h1>
          <p className="text-gray-600 mb-8">抱歉，您要查看的文章不存在或已被移除</p>
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            返回知識專區
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <SEO
        title={`${post.title} | 保家佳保險知識`}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords ? post.meta_keywords.split(',') : [post.category, '保險知識', '保家佳']}
        image={post.image_url}
        url={post.slug ? `/blog/${post.slug}` : `/blog/id/${post.id}`}
        type="article"
        author={post.author}
        publishedTime={post.published_at}
        modifiedTime={post.content_updated_at || post.published_at}
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: post.title,
              image: post.image_url ? [post.image_url] : [],
              datePublished: post.published_at,
              dateModified: post.content_updated_at || post.published_at,
              author: [{ '@type': 'Organization', name: post.author, url: 'https://baojiajia.tw/about' }],
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://baojiajia.tw/blog/${post.slug ?? post.id}`,
              },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://baojiajia.tw/' },
                { '@type': 'ListItem', position: 2, name: '保險知識專區', item: 'https://baojiajia.tw/blog' },
                { '@type': 'ListItem', position: 3, name: post.category },
              ],
            },
          ],
        }}
      />
      <Navigation />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_244px] items-start gap-11 px-4 sm:px-6 lg:px-8 pb-16">
        <main className="min-w-0">
          <nav className="pt-5 text-[0.79rem] text-cream-600">
            <Link to="/" className="hover:text-teal-600">首頁</Link>
            <span className="mx-2 text-cream-500">›</span>
            <Link to="/blog" className="hover:text-teal-600">保險知識專區</Link>
            <span className="mx-2 text-cream-500">›</span>
            {post.category}
          </nav>

          <header className="pt-5">
            <span className="inline-block rounded-sm bg-brandgold px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.15em] text-brandgold-ink mb-3.5">
              {post.category}
            </span>
            <h1 className="font-serif text-[1.65rem] sm:text-[2rem] md:text-[2.25rem] font-bold leading-[1.4] text-cream-900">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-b border-cream-300 pb-4 text-[0.8rem] text-cream-600">
              <span>
                <Link to="/about" className="font-medium underline decoration-1 underline-offset-[3px] hover:text-teal-600">
                  {post.author}
                </Link>
              </span>
              <span className="tabular-nums">
                {post.content_updated_at
                  ? `${formatDate(post.content_updated_at)} 更新`
                  : formatDate(post.published_at)}
              </span>
              {post.read_time && <span>閱讀時間 {post.read_time} 分鐘</span>}
            </div>
          </header>

          {post.excerpt && (
            <p className="mt-6 border-l-[3px] border-brandgold pl-4 text-[1.04rem] leading-[1.9] text-cream-900">
              {post.excerpt}
            </p>
          )}

          {headings.length > 1 && (
            <nav className="mt-7 rounded-md border border-cream-300 bg-white px-5 py-5">
              <h2 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-cream-600">這篇文章會談什麼</h2>
              <ol className={`text-[0.9rem] text-cream-900 ${selfNumbered ? 'list-none pl-0' : 'list-decimal pl-5'}`}>
                {headings.map((h) => (
                  <li key={h.id} className="mb-1.5 last:mb-0">
                    <a href={`#${h.id}`} className="hover:text-teal-600 hover:underline underline-offset-[3px]">{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* 封面圖不放在文章頁。它只是插圖不是資訊，讀者搜進來要先看到內容；
              image_url 仍然有用——知識專區列表、首頁最新文章的縮圖與 og:image 都靠它。 */}

          <div
            className="article-content prose prose-lg max-w-none mt-7"
            dangerouslySetInnerHTML={{ __html: withCtaBlock(withHeadingIds(stripInlineToc(post.content))) }}
          />

          <div className="mt-12">
            <ResourceCta magnet={isNewborn ? 'newborn' : 'general'} />
          </div>

          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-xl font-bold text-cream-900 mb-5">你可能也想知道</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    to={related.slug ? `/blog/${related.slug}` : `/blog/id/${related.id}`}
                    className="group block rounded-md border border-cream-300 bg-white px-4 py-4 hover:border-teal-600 transition-colors"
                  >
                    <span className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.12em] text-cream-500">{related.category}</span>
                    <b className="block text-[0.92rem] font-semibold leading-[1.6] text-cream-900 group-hover:text-teal-600 transition-colors">
                      {related.title}
                    </b>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-6 text-[0.85rem] text-cream-600">
            <span className="font-semibold text-cream-900">分享這篇</span>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="rounded-md border border-cream-300 bg-white px-3.5 py-1.5 hover:border-teal-600 hover:text-teal-600 transition-colors"
            >
              Facebook
            </button>
            <button
              onClick={() => window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="rounded-md border border-cream-300 bg-white px-3.5 py-1.5 hover:border-teal-600 hover:text-teal-600 transition-colors"
            >
              LINE
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="rounded-md border border-cream-300 bg-white px-3.5 py-1.5 hover:border-teal-600 hover:text-teal-600 transition-colors"
            >
              複製連結
            </button>
          </div>
        </main>

        <aside className="max-lg:hidden pt-5">
          <section className="mb-8">
            <h2 className="mb-3 border-b border-cream-300 pb-2 text-[0.72rem] font-bold tracking-[0.14em] text-cream-600">最新文章</h2>
            <ul>
              {latestPosts.map((item) => (
                <li key={item.id} className="border-b border-cream-200 py-2.5 first:pt-0 last:border-b-0 last:pb-0">
                  <Link to={item.slug ? `/blog/${item.slug}` : `/blog/id/${item.id}`}
                        className="block text-[0.85rem] font-semibold leading-[1.55] text-cream-900 hover:text-teal-600 transition-colors">
                    {item.title}
                    <time className="mt-1 block text-[0.7rem] font-normal tabular-nums text-cream-500">
                      {(item.content_updated_at || item.published_at || '').slice(0, 10)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {categories.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 border-b border-cream-300 pb-2 text-[0.72rem] font-bold tracking-[0.14em] text-cream-600">分類</h2>
              <ul className="flex flex-col gap-2.5">
                {categories.map((c) => (
                  <li key={c.name} className="flex items-center justify-between gap-2">
                    <Link to={`/blog?category=${encodeURIComponent(c.name)}`}
                          className="text-[0.84rem] text-cream-600 hover:text-teal-600 transition-colors">
                      {c.name}
                    </Link>
                    <b className="text-[0.74rem] font-normal tabular-nums text-cream-500">{c.count}</b>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="rounded-b-md border-t-[3px] border-brandgold-edge bg-brandgold-panel px-4 py-4">
            <p className="mb-3 text-[0.83rem] leading-[1.75] text-cream-900">
              不確定自己的保障夠不夠？花三分鐘做一次需求分析。
            </p>
            <Link to="/analysis"
                  className="block rounded-md bg-teal-600 py-2.5 text-center text-[0.84rem] font-semibold text-white hover:bg-teal-700 transition-colors">
              需求分析 DIY
            </Link>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
