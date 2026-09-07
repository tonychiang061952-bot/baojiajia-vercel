import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../lib/database';

/**
 * 首頁的最新文章。
 *
 * 改版前首頁沒有任何一條連到文章的內部連結——9 篇文章是這個站最大的資產，
 * 卻拿不到來自首頁的權重。這一區加上之後，首頁一次給出 4 篇文章 + 分類共 7 條連結。
 */

type Post = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug?: string;
  image_url: string;
  read_time: string;
  published_at: string;
  content_updated_at?: string | null;
};

const listDate = (p: Post) => p.content_updated_at || p.published_at;

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function LatestPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await db.from('blog_posts').select('*').eq('is_active', true)
          .order('published_at', { ascending: false });
        if (!alive || !data) return;
        const rows = (data as Post[])
          .slice()
          .sort((a, b) => listDate(b).localeCompare(listDate(a)));
        setPosts(rows.slice(0, 4));

        const counts = new Map<string, number>();
        for (const p of rows) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
        setCategories([...counts.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count));
      } catch (error) {
        console.error('Latest posts failed to load:', error);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (!posts.length) return null;

  return (
    <section className="border-b border-cream-300 py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="font-serif text-2xl font-bold text-cream-900">最新文章</h2>
            <p className="mt-2 text-[0.9rem] text-cream-600">把保險講清楚，不是為了賣你什麼</p>
          </div>
          <Link to="/blog" className="text-[0.86rem] font-semibold text-teal-600 hover:underline underline-offset-4 whitespace-nowrap">
            看全部文章 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={post.slug ? `/blog/${post.slug}` : `/blog/id/${post.id}`}
              className="group flex flex-col min-w-0"
            >
              <div className="aspect-[16/10] overflow-hidden rounded border border-cream-300 bg-cream-200">
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <span className="self-start mt-3 mb-2 rounded-sm bg-brandgold px-2 py-0.5 text-[0.63rem] font-bold tracking-[0.14em] text-brandgold-ink">
                {post.category}
              </span>
              <h3 className="text-[0.94rem] font-semibold leading-relaxed text-cream-900 line-clamp-3 group-hover:text-teal-600 transition-colors">
                {post.title}
              </h3>
              <span className="mt-auto pt-3 text-[0.77rem] text-cream-500 tabular-nums">
                {formatDate(listDate(post))}
                {post.content_updated_at ? ' 更新' : ''}
                {post.read_time ? ` · ${post.read_time} 分鐘` : ''}
              </span>
            </Link>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="mt-9 pt-6 border-t border-cream-200 flex flex-wrap items-center gap-2">
            <span className="text-[0.76rem] text-cream-500 mr-1">依主題找：</span>
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/blog?category=${encodeURIComponent(c.name)}`}
                className="rounded-sm border border-cream-300 bg-white px-3.5 py-1.5 text-[0.82rem] text-cream-600 hover:border-teal-600 hover:text-teal-600 transition-colors"
              >
                {c.name}
                <i className="not-italic ml-1.5 text-[0.75rem] text-cream-500">{c.count}</i>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
