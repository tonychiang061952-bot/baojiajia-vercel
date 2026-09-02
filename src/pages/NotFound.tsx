import { SEO } from '../components/SEO';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <SEO
        title="404 找不到頁面 | 保家佳"
        description="抱歉，您要查看的頁面不存在。"
        url={window.location.pathname}
        noindex
      />
      <p className="text-5xl md:text-6xl font-semibold text-gray-200" aria-hidden="true">404</p>
      <h1 className="text-2xl md:text-3xl font-semibold mt-6">找不到這個頁面</h1>
      <p className="mt-4 text-lg md:text-xl text-gray-500">網址可能已變更，或頁面已不存在。</p>
    </div>
  );
}
