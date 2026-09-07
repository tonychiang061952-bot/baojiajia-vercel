import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { db as supabase } from '../../lib/database';
import { SEO } from '../../components/SEO';

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

  const fetchRelatedPosts = async () => {
    if (!post) return;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', post.category)
        .eq('is_active', true)
        .neq('id', post.id)
        .limit(3);

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

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
        keywords={post.meta_keywords ? post.meta_keywords.split(',') : [post.category, "保險知識", "保家佳"]}
        image={post.image_url}
        url={post.slug ? `/blog/${post.slug}` : `/blog/id/${post.id}`}
        type="article"
        author={post.author}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        schema={{
          // 用 @graph 把文章與麵包屑放在同一份 JSON-LD。
          // BreadcrumbList 是 Google 仍支援 rich result 的類型，畫面上本來就有麵包屑，
          // 這裡只是補上對應的標記。
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "headline": post.title,
              "image": post.image_url ? [post.image_url] : [],
              "datePublished": post.published_at,
              "dateModified": post.updated_at,
              "author": [{
                "@type": "Organization",
                "name": post.author,
                "url": "https://baojiajia.tw/about"
              }],
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://baojiajia.tw/blog/${post.slug || post.id}`
              }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://baojiajia.tw/" },
                { "@type": "ListItem", "position": 2, "name": "知識專區", "item": "https://baojiajia.tw/blog" },
                { "@type": "ListItem", "position": 3, "name": post.category }
              ]
            }
          ]
        }}
      />
      <Navigation />

      {/* 麵包屑導航 */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600 transition-colors cursor-pointer">
              首頁
            </Link>
            <i className="ri-arrow-right-s-line mx-2"></i>
            <Link to="/blog" className="hover:text-teal-600 transition-colors cursor-pointer">
              知識專區
            </Link>
            <i className="ri-arrow-right-s-line mx-2"></i>
            <span className="text-gray-900">{post.category}</span>
          </div>
        </div>
      </div>

      {/* 文章內容 */}
      <article className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 文章標題區 */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block bg-brandgold text-brandgold-ink px-4 py-1.5 rounded-full text-sm font-semibold">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-teal-100 rounded-full mr-3">
                  <i className="ri-user-line text-teal-600 text-lg"></i>
                </div>
                {/* 作者署名連到關於我們。保險屬 YMYL，Google 對 E-E-A-T 的權重更高，
                    而作者可辨識是最基本的信任訊號。 */}
                <Link to="/about" className="font-medium hover:text-teal-700 underline underline-offset-2 decoration-1">
                  {post.author}
                </Link>
              </div>
              <div className="flex items-center">
                <i className="ri-calendar-line mr-2 text-lg"></i>
                <span>{formatDate(post.published_at)}</span>
              </div>
              <div className="flex items-center">
                <i className="ri-time-line mr-2 text-lg"></i>
                <span>{post.read_time}</span>
              </div>
            </div>
          </header>

          {/* 文章封面圖 */}
          {post.image_url && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-auto object-cover object-top"
              />
            </div>
          )}

          {/* 文章摘要 */}
          {post.excerpt && (
            <div className="bg-teal-50 border-l-4 border-teal-600 p-6 mb-10 rounded-r-xl">
              <p className="text-lg text-gray-700 leading-relaxed italic">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* 文章正文 */}
          <div
            className="article-content prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: withCtaBlock(withHeadingIds(post.content)) }}
            style={{
              lineHeight: '1.8',
              fontSize: '1.125rem',
              color: '#374151'
            }}
          />

          {/* 分享按鈕 */}
          <div className="border-t border-b border-gray-200 py-6 mb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-gray-700 font-semibold">分享這篇文章：</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                  aria-label="分享到 Facebook"
                >
                  <i className="ri-facebook-fill text-lg"></i>
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`,
                      '_blank'
                    );
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors cursor-pointer"
                  aria-label="分享到 Twitter"
                >
                  <i className="ri-twitter-x-fill text-lg"></i>
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert('連結已複製到剪貼簿！');
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors cursor-pointer"
                  aria-label="複製連結"
                >
                  <i className="ri-link text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 返回按鈕 */}
          <div className="mb-12">
            <Link
              to="/blog"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              返回知識專區
            </Link>
          </div>
        </div>
      </article>

      {/* 相關文章 */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
              相關文章推薦
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={relatedPost.slug ? `/blog/${relatedPost.slug}` : `/blog/id/${relatedPost.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={relatedPost.image_url || 'https://readdy.ai/api/search-image?query=Insurance%20education%20concept%20with%20friendly%20advisor%20explaining%20to%20young%20person%2C%20bright%20modern%20setting%2C%20clean%20background%2C%20professional%20photography%20showing%20learning%20and%20understanding&width=800&height=500&seq=blog-related-default&orientation=landscape'}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                        {relatedPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(relatedPost.published_at)}</span>
                      <span className="flex items-center">
                        <i className="ri-time-line mr-1"></i>
                        {relatedPost.read_time}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
