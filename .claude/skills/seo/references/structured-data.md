# 結構化資料：這個網站該用什麼

查證日期 2026-08-28。停用清單與支援清單見 `google-facts.md` 第 3、4 節。

---

## 保險顧問網站適用的類型

| 頁面 | 建議類型 | 有 rich result？ | 備註 |
|---|---|---|---|
| 首頁 | `Organization`（或 `LocalBusiness` 子型別） | ✅ | 有實體地址才用 LocalBusiness |
| 文章頁 | `Article` / `BlogPosting` | ✅ | 無必填屬性；author、日期、image 為建議 |
| 各層級頁面 | `BreadcrumbList` | ✅ | 影響搜尋結果的路徑顯示 |
| 顧問個人頁 | `ProfilePage` + `Person` | ✅ | YMYL 網站建立作者可信度用 |
| 服務頁 | `Service` | ❌ | 語意標記，不會有版位 |
| 關於我們 | `AboutPage` | ❌ | 同上 |
| 常見問答 | ~~`FAQPage`~~ | ❌ **已停用** | 2026-05-07 起完全不顯示 |

---

## 保險業（無實體門市）的 Organization 寫法

`LocalBusiness` 需要真實 `address`。沒有對外的實體地址就用 `Organization`，
不要編造地址。

建議補齊的欄位（目前多數網站缺這些）：

```jsonc
{
  "@type": "Organization",          // 有實體地址可改 "InsuranceAgency"
  "name": "...",
  "url": "...",
  "logo": { "@type": "ImageObject", "url": "...", "width": 512, "height": 512 },
  "telephone": "+886-...",
  "sameAs": ["https://www.facebook.com/...", "https://www.instagram.com/..."],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "telephone": "+886-...",
    "areaServed": "TW",
    "availableLanguage": "zh-TW"
  }
}
```

`logo` 宣告的尺寸必須與實際圖檔相符，且應該是方形品牌標誌，不是情境照。

---

## 不要做的事

- **不要在自家網站放自己的客戶評價當 AggregateRating** —— 自賣自誇評價不符星等資格
  （`google-facts.md` 第 7 節）。評價內容照樣可以展示給訪客看，只是別期待星星。
- **不要為了 rich result 加 FAQPage 或 HowTo** —— 都已停用。
- **不要為 AI Overviews 加特殊 schema** —— 官方說不需要。
- **不要在 schema 裡填不準確的日期** —— `dateModified` 存在的目的是提供準確資訊。
