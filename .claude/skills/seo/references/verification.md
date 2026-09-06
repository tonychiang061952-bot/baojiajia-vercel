# 驗證方法

每一項 SEO 修改都要對應一個可執行的驗證。沒驗證過就不要說「修好了」。

---

## 不執行 JS 的爬蟲看到什麼（社群分享預覽、部分搜尋引擎）

```bash
curl -s -A "facebookexternalhit/1.1" <url> > /tmp/bot.html
grep -c '<title'                 /tmp/bot.html   # 應為 1
grep -o 'og:[a-z_:]*'            /tmp/bot.html | sort -u
grep -c 'application/ld+json'    /tmp/bot.html
```

原始 HTML 裡沒有的東西，這類爬蟲就是看不到。

---

## Googlebot 渲染後看到什麼

用瀏覽器載入頁面，**等頁面完全載入後**再檢查 DOM：

```js
const q = s => [...document.querySelectorAll(s)];
({
  title:     document.title,
  title元素: q('title').length,          // 應為 1，不是 0 也不是 2
  desc:      q('meta[name="description"]').length,
  canonical: q('link[rel="canonical"]').map(e => e.href),
  og:        q('meta[property^="og:"]').length,
  jsonld:    q('script[type="application/ld+json"]').map(e => JSON.parse(e.textContent)['@type']),
})
```

**至少量三次，每次重新載入。** 前端注入的標籤可能因時序而時有時無，
單次量測會得到錯誤結論。也要測客戶端換頁（點站內連結）後標籤有沒有正確替換。

---

## Google 自己說它看到什麼（最權威）

Search Console →「網址審查」→ 輸入完整網址

看這幾欄：
- **網頁索引狀態**：已編入索引／已檢索但未建立索引／已探索但未檢索
- **上次檢索時間**：可能是幾個月前，代表你看到的是舊版本的判斷
- **是否允許檢索／編入索引**
- **使用者宣告的標準網址** vs **Google 所選的標準網址**：兩者不同代表 canonical 沒被採信
- 右上角「**測試線上網址**」→ 可看 Google 現在抓到的 HTML 與渲染截圖

---

## 結構化資料

- [複合式搜尋結果測試](https://search.google.com/test/rich-results)：只驗證「能不能產生 rich result」
- [Schema Markup Validator](https://validator.schema.org/)：只驗證語法

**兩者都通過 ≠ 會有效果。** 先對照 `google-facts.md` 第 3、4 節確認
該類型目前是否仍有 rich result。

---

## 分享預覽

- Facebook：[分享偵錯工具](https://developers.facebook.com/tools/debug/)（可強制重新抓取）
- LINE：直接把網址貼進聊天室輸入框（不用送出）就會跳預覽
- 最實際的驗收方式，非技術人員也能自己做

---

## Sitemap

```bash
curl -s <site>/sitemap.xml | grep -c '<loc>'                    # 網址總數
curl -s <site>/sitemap.xml | grep -o '<lastmod>[^<]*' | sort -r | head -1   # 最新日期
```

`lastmod` 的最大值可以反推**網站上次部署的時間**（因為多數 sitemap 產生器
會把靜態頁的 lastmod 設成產生當天）。這是判斷「線上版本有多舊」的好方法。

Search Console → Sitemap 可看 Google **上次讀取時間**與**探索到的網址數**。
兩者跟實際檔案對不上，代表 Google 手上的資料是舊的。

---

## 效能（Core Web Vitals）

- [PageSpeed Insights](https://pagespeed.web.dev/)：同時給實驗室數據與真實使用者數據
- 以**真實使用者數據（CrUX）**為準，實驗室數據只能拿來除錯
- 門檻見 `google-facts.md` 第 11 節

---

## 部署狀態（做任何線上量測之前先確認）

線上版本落後會讓所有量測失真。確認方法：

```bash
git log --oneline origin/main..HEAD          # 本機領先線上幾個提交
curl -s <site>/sitemap.xml | grep -o '<lastmod>[^<]*' | sort -r | head -1
```

再比對線上的 JS 檔裡有沒有某個近期改動的特徵字串，例如：

```bash
curl -s <site>/assets/js/index-XXXX.js | grep -c '某個新功能的字串'
```

---

## Vercel 部署的已查證事實（2026-08-28）

來源：[vercel.json 設定文件](https://vercel.com/docs/project-configuration/vercel-json)

**rewrites 在檔案系統之後才套用**：
> "The `source` property should NOT be a file because **precedence is given to the
> filesystem prior to rewrites being applied**."

以及棄用說明中：
> "`handle`: A special route type (e.g. `"handle": "filesystem"`)... Use `rewrites`
> instead, **which checks the filesystem by default**."

**意義**：SPA 用 rewrites 做萬用後備時，預先產生的實體檔案會優先被回傳，
不會被後備規則蓋掉。這是預渲染方案能成立的前提。

---

## Vercel 預覽部署（不影響正式站的驗證管道）

來源：[預覽部署是否會被搜尋引擎索引](https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines)

- 推送非正式分支到 GitHub 會自動產生**預覽部署**，有獨立網址，**不會動到正式站**
- Vercel 自動加上 `X-Robots-Tag: noindex`，搜尋引擎不會收錄，不會跟正式站競爭
- 確認方式：`curl -I <預覽網址>` 看有沒有 `x-robots-tag: noindex`
- 例外：若把自訂網域指到非正式分支，Vercel 會視為刻意公開，不加 noindex

**意義**：Vercel 的路由行為、建置能否成功、HTTP 狀態碼、社群分享預覽，
都可以在預覽部署上驗證，不必先動正式站。
