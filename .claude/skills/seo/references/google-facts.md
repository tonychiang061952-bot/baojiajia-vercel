# Google 官方事實清單

**查證日期：2026-08-28**（第 15 節為 2026-09-05 補查）
**來源：developers.google.com/search（Google Search Central）與 web.dev，皆為一手官方文件。**

超過 2027-02 請重新查證後更新本檔。每次更新請改上面的日期。

---

## 1. JavaScript 網站（SPA）

來源：[JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

- Googlebot 處理分三階段：**抓取 → 渲染 → 索引**。回傳 200 的頁面會排入渲染佇列。
  > "It may stay on this queue for a few seconds, but it can take longer than that."
- Google **支援**用 JS 動態注入 title、meta description、canonical、robots meta。
- 但**不可以**用 JS 把 canonical 改成跟原始 HTML 不同的網址。
- 官方仍建議做伺服器端渲染或預渲染：
  > "server-side or pre-rendering is still a great idea because it makes your website faster
  > for users and crawlers, **and not all bots can run JavaScript**."
- SPA 用前端路由但沒有正確狀態碼 → 會被判定為 **soft 404**。

**對本專案的意義**：預渲染不是可有可無的優化，是官方建議做法；
而且社群爬蟲不執行 JS 這件事是官方明講的。

---

## 2. 社群分享預覽（Open Graph）

來源：Open Graph 通用規範與各平台文件（非 Google）

- 必要標籤：`og:title`、`og:type`、`og:image`、`og:url`
- 圖片建議 **1200×630**（1.91:1），**不超過 5MB**，JPG / PNG / WebP
- **這些標籤必須存在於伺服器回傳的原始 HTML**。分享預覽爬蟲不執行 JS，
  靠 JS 注入的 OG 標籤它們看不到。

---

## 3. 結構化資料：已停用的類型

來源：[Search Central 更新記錄](https://developers.google.com/search/updates)、
[FAQPage 文件](https://developers.google.com/search/docs/appearance/structured-data/faqpage)、
[簡化搜尋結果頁公告](https://developers.google.com/search/blog/2025/06/simplifying-search-results)

| 類型 | 狀態 |
|---|---|
| **FAQPage** | 2023-09 限縮至政府／醫療網站；**2026-05-07 起完全不再顯示**；2026-06 文件下架 |
| **HowTo** | 已完全移除，文件下架 |
| Practice problem | 2026-01 起移除支援 |
| Course Info、Claim Review、Estimated Salary、Learning Video、Special Announcement、Vehicle Listing | 已從 Search Console 移除支援 |

Google 給的理由：這些類型使用率低、對使用者的額外價值不足。

**注意**：schema.org 上這些型別仍然存在且語法有效，
「驗證工具沒報錯」不等於「Google 會拿它做任何事」。

---

## 4. 結構化資料：目前仍支援 rich result 的類型

來源：[Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)

Article、Breadcrumb、Carousel、Course list、Dataset、Discussion forum、
Education Q&A、Employer aggregate rating、Event、Image metadata、Job posting、
**Local business**、Math solver、Movie、**Organization**、Product、Profile page、
Q&A、Recipe、**Review snippet**、Software app、Speakable、
Subscription and paywalled content、Vacation rental、Video

**不在清單上的（例如 `Service`、`WebPage`、`AboutPage`）** 不會產生 rich result。
放著無害，也能幫助理解語意，但不要拿它當「會有版位」來承諾。

---

## 5. Article / BlogPosting

來源：[Article 結構化資料](https://developers.google.com/search/docs/appearance/structured-data/article)

- **沒有必填屬性**：
  > "There are no required properties; instead, add the properties that apply to your content."
- 建議屬性：`author`（Person 或 Organization）、`dateModified`、`datePublished`、
  `headline`、`image`
- `dateModified` 的用途是提供**更準確**的日期資訊 → 填假的等於自毀訊號
- `headline` 建議簡短，過長會被截斷
- author 建議用正確型別、列出所有可見作者、加上可辨識身分的 URL

---

## 6. Local business

來源：[Local Business 結構化資料](https://developers.google.com/search/docs/appearance/structured-data/local-business)

- **必填**：`name`、`address`（PostalAddress）
- 建議：`telephone`、`url`、`geo`、`openingHoursSpecification`、`priceRange`
- > "Use the most specific LocalBusiness sub-type possible"

**沒有實體地址就不要用 LocalBusiness**，也不要編一個地址——
提供不實的商家資訊違反結構化資料政策。

---

## 7. Review snippet：自賣自誇的評價不符資格

來源：[Review snippet](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)

> "If the entity that's being reviewed controls the reviews about itself, their pages that use
> `LocalBusiness` or any other type of `Organization` structured data are **ineligible** for
> star review feature."

包含直接寫進結構化資料的評價，以及嵌入第三方評價外掛的情況。

**對本專案的意義**：`Testimonials.tsx` 把自家網站收集的客戶評價
做成 `Organization` + `AggregateRating` → 不符合星等顯示資格。
不會有星星，留著也不會有效果。

---

## 8. Meta 標籤

來源：[Google 支援的 meta 標籤](https://developers.google.com/search/docs/crawling-indexing/special-tags)

Google 支援：`description`、`robots` / `googlebot`、`notranslate`、`nopagereadaloud`、
`google-site-verification`、`charset`、`refresh`、`viewport`、`rating`

Google **明確忽略**：
- **`keywords`** — > "The meta-keyword tag is not used by Google Search"
- `lang` 屬性（語言靠內容判斷）
- `rel=next` / `rel=prev`

`robots` 可用指令包含：`noindex`、`nosnippet`、`max-snippet`、`max-image-preview`。
指令衝突時**以較嚴格者為準**。

---

## 9. robots.txt

來源：[robots.txt 說明](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)

- Google 只支援四個欄位：`user-agent`、`allow`、`disallow`、`sitemap`
- > "other fields such as `crawl-delay` aren't supported"
- **關鍵陷阱**：
  > "Google can't index the content of pages which are disallowed for crawling,
  > but it **may still index the URL** and show it in search results without a snippet."

所以想讓某頁不出現在搜尋結果，正確做法是**允許抓取 + 加 `noindex`**。
如果同時 Disallow 又加 noindex，Google 因為不能抓取而**讀不到那個 noindex**，
反而達不到目的。

---

## 10. Sitemap

來源：[建立 sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

- Google 使用 `<loc>` 與 `<lastmod>`
- > "Google ignores `<priority>` and `<changefreq>` values."
- `<lastmod>` 只有在**一致且可驗證地準確**時才會被採用；
  應反映主要內容／結構化資料／連結的實質更新，不是改個版權年份就動
- 上限：單檔 50MB（未壓縮）、50,000 個網址
- 網址必須是合法網址（含空格等字元會讓該筆失效）

---

## 11. Core Web Vitals

來源：[web.dev/articles/vitals](https://web.dev/articles/vitals)、
[Google 搜尋與 Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)

三個指標與「良好」門檻（取 **75 百分位**，行動與桌機分開計算）：

| 指標 | 意義 | 良好門檻 |
|---|---|---|
| LCP | 主要內容載入完成 | ≤ 2.5 秒 |
| INP | 互動到畫面回應 | ≤ 200 毫秒 |
| CLS | 版面位移 | ≤ 0.1 |

（INP 已取代舊的 FID。若看到建議優化 FID，那是過時資訊。）

---

## 12. AI Overviews / AI Mode

來源：[生成式 AI 功能最佳化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)、
[公告](https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing)

**要做的**：
- 符合搜尋的技術要求、**已被索引且具備 snippet 資格**
- 內容可被抓取（AI 功能使用公開可抓取的內容）
- 遵循 JavaScript SEO 最佳做法
- 內容要「unique, compelling, and useful」，有自己的觀點
- 用 Search Console 的生成式 AI 成效報表追蹤

**明確不需要做的**：
- llms.txt 或其他「特殊」檔案 —— Google Search 不使用
- 把內容切成小塊（chunking）
- 為 AI 改寫成特殊語言
- 為 AI 加特殊 schema —— > "not required for generative AI search"
- 為每個查詢變體生出一頁 → 違反 scaled content abuse 政策

**結論**：AI 功能沒有獨立的優化手段，就是把基本 SEO 做好。

---

## 13. 「已檢索 - 目前尚未建立索引」

來源：[網頁索引狀態報表](https://support.google.com/webmasters/answer/7440203)
與 Search Central 社群官方說明

- 這**不一定是技術問題**。Google 抓到了，但判斷這頁不值得放進索引。
- 常見原因：內容品質不足、缺乏 E-E-A-T、與其他頁面重複。
- 建議做法：改善內部連結、實質改寫內容、把多個相似頁面合併成一頁更強的。
- 沒有「送出索引請求」就能解決的捷徑。

**判讀原則**：看到這個狀態時，先確認技術面沒問題（能抓取、能渲染、有標題描述、
canonical 正確），若技術面都正常，那就是**內容問題**，要用內容手段解決。

---

## 14. 內容品質與 YMYL

來源：[製作實用可靠的內容](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

- E-E-A-T：Experience、Expertise、Authoritativeness、Trustworthiness
  > "trust is most important. The others contribute to trust"
- **保險、金融、健康屬於 YMYL（Your Money or Your Life）**：
  > Google's systems "give even more weight to content that aligns with strong E-E-A-T."
- 明確標示作者是誰很重要：作者署名應連到作者頁或關於我們頁
- 自我檢查問題：
  - 內容是否提供原創的資訊、報導、研究或分析？
  - 這是你會想收藏、分享給朋友的頁面嗎？
- 警訊：內容主要是為了吸引搜尋流量而做、大量自動化生產

**對本專案的意義**：保險網站是 YMYL，內容品質門檻比一般主題高。
「已檢索但未收錄」在 YMYL 網站上更常見，且更需要用作者身分、
專業資歷、原創觀點來解決，而不是靠技術調整。

---

## 15. 沒有「為 AI 改寫」這回事（含「先說結論／答案前置」）

**查證日期：2026-09-05。** 來源：
[生成式 AI 功能最佳化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)、
[Featured snippets](https://developers.google.com/search/docs/appearance/featured-snippets)

官方原文：

> "You don't need to **write in a specific way** just for generative AI search."

> "There's no requirement to **break your content into tiny pieces** for AI to better understand it."

> "Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add."

> "You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in Google Search."

**關於「把答案或結論放在前面」「段落要能單獨成立」，整份指南隻字未提。**

Featured snippets 文件對「怎麼讓自己被選為精選摘要」的回答是：

> "**You can't.** Google systems determine whether a page would make a good featured snippet
> for a user's search request, and if so, elevates it."

該文件唯一的內容端指引是 `max-snippet`，用途是**限制／避免**出現，不是搶版位。

### 為什麼要特別記這一條

2026-09-05 我自己犯過：把「先說結論比較容易被 AI 擷取」講成像是 Google 的規範，
還寫進了 `SEO寫作培訓/references/03` 與 `06`。**那句話沒有出處。**

「先說結論」唯一的真實依據是對標語料中專業型網站 70% 這樣寫
（`SEO寫作培訓/references/01-語料統計.md`）——**那是同業慣例，不是搜尋引擎規範。**

**判讀原則：任何以「AI 比較喜歡⋯⋯」開頭的 SEO 建議，先問出處。**
Google 目前的立場是：生成式 AI 功能沒有獨立的優化手段，就是把基本 SEO 做好。
