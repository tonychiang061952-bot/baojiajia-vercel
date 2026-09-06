import { useEffect, useState } from 'react';

type Totals = { today: number; total: number };

const STORAGE_KEY = 'bjj_counted_on';

// 台北時間的今天。用來判斷這個瀏覽器今天是否已經計過一次，
// 避免同一個人重整頁面就把數字推上去。
function taipeiToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
}

function alreadyCountedToday(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === taipeiToday();
  } catch {
    // 無痕視窗或封鎖網站資料時會丟例外；當作沒計過，最多多算一次。
    return false;
  }
}

function markCounted() {
  try {
    localStorage.setItem(STORAGE_KEY, taipeiToday());
  } catch {
    // 存不進去不影響顯示，忽略。
  }
}

export default function VisitorCounter() {
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    let cancelled = false;
    const method = alreadyCountedToday() ? 'GET' : 'POST';

    fetch('/api/pageviews', { method })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Totals & { counted?: boolean }) => {
        if (cancelled) return;
        if (method === 'POST' && data.counted) markCounted();
        setTotals({ today: data.today, total: data.total });
      })
      .catch(() => {
        // 計數器壞掉不該讓頁尾出現錯誤訊息，安靜地不顯示就好。
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 還沒拿到數字之前不佔版面，避免頁尾跳動。
  if (!totals) return null;

  return (
    <p className="text-gray-500 text-xs sm:text-sm tabular-nums" aria-live="polite">
      本日人氣 <span className="text-gray-300">{totals.today.toLocaleString()}</span>
      <span className="mx-2 text-gray-700">·</span>
      累積人氣 <span className="text-gray-300">{totals.total.toLocaleString()}</span>
    </p>
  );
}
