import { Component, Suspense, type ReactNode } from 'react';

/**
 * 全站的頁面都是 lazy 載入，但原本沒有任何 Suspense 或錯誤邊界：
 * JS 慢一秒或某個檔案抓不到，畫面就停在給爬蟲看的靜態底稿上，
 * 使用者會以為頁面內容被換掉了（實際遇過：/analysis 只剩標題與兩句話）。
 *
 * 最常見的成因是部署：使用者開著的舊分頁記的是舊的檔名，
 * 新版一上線那個檔就 404。這種情況重新整理就會好，所以自動重載一次。
 */

const CHUNK_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk/i;
const RELOAD_FLAG = 'bjj_chunk_reloaded';

export function PageLoading() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center" role="status" aria-label="載入中">
      <i className="ri-loader-4-line text-3xl text-teal-600 animate-spin"></i>
    </div>
  );
}

type Props = { children: ReactNode };
type State = { failed: boolean };

class RouteErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error('頁面載入失敗：', error);

    // 部署後的舊檔名失效：自動重載一次就會拿到新版。
    // 用 sessionStorage 記住，避免真的壞掉時無限重載。
    if (CHUNK_ERROR.test(error?.message ?? '')) {
      try {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, '1');
          window.location.reload();
        }
      } catch {
        // 無痕模式讀不到 sessionStorage，就交給下面的提示畫面
      }
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-2xl font-bold text-cream-900">頁面沒有載入完成</h1>
          <p className="mt-3 text-cream-700">
            可能是網路不穩，或網站剛好更新了版本。重新整理通常就會恢復。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
          >
            <i className="ri-refresh-line"></i>
            重新整理
          </button>
        </div>
      </div>
    );
  }
}

export function RouteBoundary({ children }: Props) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </RouteErrorBoundary>
  );
}
