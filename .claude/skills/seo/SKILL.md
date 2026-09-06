---
name: seo
description: 執行 SEO 稽核、修改網站的 meta 標籤／結構化資料／sitemap／robots.txt、判讀 Google Search Console 報表，或回答任何 SEO 問題時使用。內含 2026-08-28 查證自 Google 官方文件的事實清單，用來取代記憶中可能過時的 SEO 常識。當任務涉及 title/description/canonical/Open Graph/JSON-LD/schema.org/索引/收錄/爬蟲/AI Overviews/Core Web Vitals 時觸發。
---

# SEO 工作準則

## 為什麼需要這個 skill

SEO 規則變動頻繁，而且**變動方向常常是「某個做法失效了」而不是「多了新做法」**。
憑記憶給建議的失敗模式是：推薦一個兩年前有效、現在已被停用的做法，
使用者照做、花了時間、卻沒有任何效果，而且不會有錯誤訊息告訴他。

實例（2026-08-28 查證時發現）：FAQPage 結構化資料在 2023 年 9 月被限縮到只有
政府與醫療網站適用，2026 年 5 月 7 日起**完全從 Google 搜尋結果移除**。
任何「加 FAQ schema 來搶版位」的建議現在都是錯的。

## 三條硬規則

1. **不要憑記憶回答「Google 現在支援什麼」。**
   先讀 `references/google-facts.md`。那份檔案裡的每一條都標了出處與查證日期。

2. **`references/google-facts.md` 的查證日期超過 6 個月就要重新查證。**
   查證來源固定用 `developers.google.com/search`（Search Central）與 `web.dev`，
   不要用 SEO 部落格當一手來源。查完更新該檔案的日期與內容。

3. **每一項建議都要能回答「怎麼驗證它生效了」。**
   沒有驗證方法的 SEO 建議等於沒有做。驗證方法見 `references/verification.md`。

## 工作流程

### 稽核既有網站時

1. 先看**爬蟲實際拿到什麼**，不要只看程式碼：
   - `curl -A "facebookexternalhit/1.1" <url>` → 不執行 JS 的爬蟲看到的原始 HTML
   - 瀏覽器實際載入後檢查 DOM → Googlebot 渲染後看到的
   - 兩者可能天差地遠，都要看
2. 用 Search Console 的「網址審查」看 **Google 自己說**它看到什麼，
   不要用推論的。注意「上次檢索時間」——資料可能是幾個月前的舊版本。
3. 確認**線上版本是不是最新版本**。部署落後會讓所有量測失真。
4. 對照 `references/google-facts.md` 檢查每一項發現是否仍然適用。

### 判讀量測結果時

**同一件事至少量三次。** 前端注入的標籤可能因為時序而時有時無，
單次量測會得到錯誤結論。看到異常數據時，先問「是不是我量錯了」，
再問「是不是網站壞了」。改動前後要各量一次當對照組。

### 給建議時

按「影響 × 確定性」排序，並明講哪些是**確定有效**、哪些是**可能有幫助**：

- **確定有效**：修正技術缺陷（爬不到、渲染不出、回錯狀態碼、標籤缺失）
- **可能有幫助**：內容品質、內部連結、結構化資料（多數已無 rich result，但仍是理解訊號）
- **幾乎無效**：meta keywords、priority/changefreq、crawl-delay、llms.txt、關鍵字密度

## 常見的錯誤建議（現在已不適用）

| 常見建議 | 現況 |
|---|---|
| 加 FAQ schema 搶搜尋結果版位 | ❌ 2026-05-07 起完全移除 |
| 加 HowTo schema | ❌ 已移除 |
| 填 meta keywords | ❌ Google 明確不使用 |
| sitemap 設定 priority / changefreq | ❌ Google 明確忽略 |
| robots.txt 加 crawl-delay | ❌ Google 不支援此欄位 |
| 用 robots.txt Disallow 讓頁面不被收錄 | ❌ 會擋抓取但網址仍可能被索引 |
| 做 llms.txt 給 AI 搜尋用 | ❌ Google 明說不使用 |
| 為 AI Overviews 加特殊 schema | ❌ 官方說不需要特殊標記 |
| 在自家網站放自己的評價衝星星 | ❌ 自賣自誇評價不符資格 |

詳細出處見 `references/google-facts.md`。

## 這個專案的技術背景

React 19 + Vite SPA，Supabase 存內容，Vercel 部署。
關鍵限制：**SPA 的初始 HTML 是空的**，所以

- Googlebot 會渲染 JS，但要排隊，而且渲染失敗就什麼都沒有
- LINE / Facebook 的分享預覽爬蟲**不執行 JS**，只看得到初始 HTML
- 解法是建置階段預先產生靜態 HTML（`scripts/prerender.mjs`）

改任何 SEO 相關程式碼時，記得**兩邊都要顧**：
`src/seo/`（資料來源，兩邊共用）→ `src/components/SEO.tsx`（瀏覽器端）
與 `scripts/prerender.mjs`（建置階段）。

## 內容工作的起點是關鍵字地圖，不是寫文章

技術修正做完之後，內容面的第一件事**不是開始寫文章**，是先做關鍵字地圖
（`references/method.md` 第二節）。沒有這張表就不知道要寫什麼、
也無法評估做得好不好——Search Console 只會顯示已經有曝光的字，
「想要但還沒拿到」的字它不會告訴你。

## 參考檔案

- `references/google-facts.md` — Google 官方事實清單（含出處與查證日期）
- `references/method.md` — 執行方法論：流量公式、關鍵字地圖、搜尋意圖模板、覆盤流程
- `references/structured-data.md` — 目前仍有效的結構化資料類型
- `references/verification.md` — 每種修改對應的驗證方法
