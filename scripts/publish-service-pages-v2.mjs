import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const db = neon(databaseUrl);

const pages = [
  {
    slug: 'savings-planning',
    description: '理財不是先挑商品，而是先釐清目標、現金流與優先順序。我們陪您把每筆錢的任務整理清楚，建立能長久執行、也保有生活彈性的儲蓄計畫。',
    content: String.raw`
<div class="bj-lead">
  <div class="bj-lead__icon" aria-hidden="true"><i class="ri-compass-3-line"></i></div>
  <div>
    <p class="bj-eyebrow">先看方向，再談工具</p>
    <h2>儲蓄理財，不是先找一個商品把錢放進去</h2>
    <p>真正有用的規劃，是先知道自己想完成什麼、什麼時候需要用錢，以及每個月能穩定留下多少。當方向清楚，工具才有比較的意義。</p>
  </div>
</div>

<h2>你不是不會存錢，可能只是每筆錢都沒有清楚的任務</h2>
<p>很多人收入並不低，也一直提醒自己要存錢，月底卻還是不確定錢去了哪裡。問題往往不是不夠自律，而是日常支出、年度開銷、緊急預備與未來目標全都混在同一個帳戶裡。</p>
<p>當不同用途的錢沒有被分開，一次旅遊、保費、稅金或家中臨時支出，就可能打亂原本的計畫，讓人誤以為自己「怎麼存都存不下來」。</p>

<div class="bj-grid" aria-label="常見的儲蓄困擾">
  <div class="bj-card">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-wallet-3-line"></i></div>
    <h3>錢都放在同一處</h3>
    <p>生活費、預備金與目標資金彼此混用，很難知道真正可動用的金額。</p>
  </div>
  <div class="bj-card bj-card--blue">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-route-line"></i></div>
    <h3>有存錢，卻沒有進度感</h3>
    <p>沒有清楚的目標金額與時間，存了很久仍不知道離目的地多遠。</p>
  </div>
  <div class="bj-card bj-card--amber">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-calendar-event-line"></i></div>
    <h3>年度支出反覆打亂計畫</h3>
    <p>保費、稅金、旅遊與家庭支出沒有事先預留，只能臨時挪用存款。</p>
  </div>
  <div class="bj-card bj-card--violet">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-emotion-unhappy-line"></i></div>
    <h3>存錢變成生活壓力</h3>
    <p>把目標訂得太緊，短期勉強做到，最後卻因為疲乏而整套放棄。</p>
  </div>
</div>

<h2>一份有用的儲蓄計畫，要先讓四種錢各就各位</h2>
<p>理財不是把所有餘額都鎖起來，而是讓不同時間會用到的錢，有不同的位置與任務。</p>

<div class="bj-grid" aria-label="四種資金任務">
  <div class="bj-card">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-shopping-basket-2-line"></i></div>
    <h3>日常生活</h3>
    <p>房租、飲食、交通與固定帳單。重點是穩定，不需要每天為每筆小支出焦慮。</p>
  </div>
  <div class="bj-card bj-card--blue">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-shield-check-line"></i></div>
    <h3>安全預備</h3>
    <p>收入中斷、醫療或家庭突發狀況的緩衝，避免臨時事件破壞長期目標。</p>
  </div>
  <div class="bj-card bj-card--amber">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-flag-2-line"></i></div>
    <h3>階段目標</h3>
    <p>旅遊、進修、買房、育兒或其他可預期需求，要有金額、期限與優先順序。</p>
  </div>
  <div class="bj-card bj-card--violet">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-seedling-line"></i></div>
    <h3>長期選擇</h3>
    <p>讓未來有更多選擇的資金，例如轉職空檔、提早退休或長期家庭計畫。</p>
  </div>
</div>

<h2>真正可以規劃的，不是薪水總額，而是穩定留下來的現金流</h2>
<p>只看月收入，很容易高估自己可以存下的金額。更實際的做法，是先扣除必要生活支出，再把一年內可預期但不會每月發生的費用平均預留。</p>

<div class="bj-equation" role="img" aria-label="可運用收入減去必要支出與年度預留，得到真正可規劃的金額">
  <div class="bj-equation__item">
    <i class="ri-money-dollar-circle-line" aria-hidden="true"></i>
    <strong>可運用收入</strong>
    <span>實際進入家庭的錢</span>
  </div>
  <div class="bj-equation__operator" aria-hidden="true">−</div>
  <div class="bj-equation__item">
    <i class="ri-home-4-line" aria-hidden="true"></i>
    <strong>必要與年度支出</strong>
    <span>生活費加上可預期大額開銷</span>
  </div>
  <div class="bj-equation__operator" aria-hidden="true">＝</div>
  <div class="bj-equation__item">
    <i class="ri-focus-3-line" aria-hidden="true"></i>
    <strong>真正可規劃金額</strong>
    <span>能穩定投入目標的現金流</span>
  </div>
</div>

<h2>我們不從商品開始，而是從你的生活開始</h2>
<p>保家佳的儲蓄理財諮詢，重點不是叫你把每一塊錢都省下來，也不會一開始就預設答案。我們會先理解你的生活與目標，再一起建立可執行的順序。</p>

<div class="bj-grid" aria-label="儲蓄理財諮詢流程">
  <div class="bj-card">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-search-eye-line"></i></div>
    <h3>1. 看清現況</h3>
    <p>整理收入、固定支出、年度開銷、負債與目前已有的資金，不用先做得很完美。</p>
  </div>
  <div class="bj-card bj-card--blue">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-list-check-3"></i></div>
    <h3>2. 排定目標</h3>
    <p>把想完成的事情分成必要、重要與可以等待，避免每個目標同時搶同一筆錢。</p>
  </div>
  <div class="bj-card bj-card--amber">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-repeat-2-line"></i></div>
    <h3>3. 設計節奏</h3>
    <p>建立每月可以持續的分配方式，同時保留合理生活與臨時調整空間。</p>
  </div>
  <div class="bj-card bj-card--violet">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-refresh-line"></i></div>
    <h3>4. 定期調整</h3>
    <p>收入、家庭與目標改變時重新排序，讓計畫服務生活，而不是反過來綁住生活。</p>
  </div>
</div>

<div class="bj-callout">
  <p><strong>工具永遠排在問題之後。</strong>如果後續需要比較存款、保險或投資等方式，也會等目標、期限、風險與現金流釐清後再討論，而不是把商品當成諮詢起點。</p>
</div>

<h2>你現在最卡的是哪一種？</h2>
<div class="bj-compare-list">
  <div class="bj-compare-row">
    <div class="bj-compare-row__problem">每個月都有剩，卻不知道該怎麼分</div>
    <div class="bj-compare-row__arrow" aria-hidden="true"><i class="ri-arrow-right-line"></i></div>
    <div class="bj-compare-row__focus">先建立資金用途與優先順序</div>
  </div>
  <div class="bj-compare-row">
    <div class="bj-compare-row__problem">目標很多，覺得怎麼存都不夠</div>
    <div class="bj-compare-row__arrow" aria-hidden="true"><i class="ri-arrow-right-line"></i></div>
    <div class="bj-compare-row__focus">把金額、期限與可延後程度攤開比較</div>
  </div>
  <div class="bj-compare-row">
    <div class="bj-compare-row__problem">已經有一些安排，但看不懂彼此關係</div>
    <div class="bj-compare-row__arrow" aria-hidden="true"><i class="ri-arrow-right-line"></i></div>
    <div class="bj-compare-row__focus">整理成同一張現金流與目標地圖</div>
  </div>
</div>

<h2>哪些人適合來做一次儲蓄整理？</h2>
<ul>
  <li>收入還算穩定，卻一直沒有明確累積感。</li>
  <li>有買房、育兒、進修或轉職目標，不知道該先準備哪一項。</li>
  <li>每年都被保費、稅金、旅遊或家庭支出打亂。</li>
  <li>夫妻或家人對花錢、存錢的優先順序不同。</li>
  <li>手上已有不同安排，希望有人協助整理，而不是再增加一項。</li>
</ul>

<h2>儲蓄理財諮詢常見問題</h2>
<h3>收入不高，也值得做規劃嗎？</h3>
<p>值得。規劃的價值不在金額大小，而在有限的現金流應該先保護什麼、完成什麼。收入較緊時，更需要避免每個目標同時開始。</p>

<h3>諮詢前一定要先記帳嗎？</h3>
<p>不用先做到很完整。可以先準備最近幾個月的大致收入、固定支出與容易忘記的年度開銷；如果資料不齊，我們也可以從生活習慣一起整理。</p>

<h3>諮詢就是要我更省嗎？</h3>
<p>不是。好的計畫應該保留生活品質與調整空間。重點是把真正重視的事情排進預算，而不是單純把所有支出壓到最低。</p>

<h2>相關服務</h2>
<p>如果你想進一步整理既有安排，可以了解<a href="/services/policy-checkup">保單健診</a>；如果主要目標是未來退休生活，建議接著看<a href="/services/retirement-planning">退休規劃</a>。</p>

<h2>一般性資訊提醒</h2>
<p>本頁內容僅供一般性資訊與初步規劃參考，不構成特定保險商品、投資、稅務或法律建議。實際建議仍應依個人目標、家庭狀況、風險承受度與相關契約內容個別評估。</p>
    `.trim(),
  },
  {
    slug: 'retirement-planning',
    description: '台灣已進入超高齡社會，但多數勞工仍未規劃退休年齡。我們從勞保、勞退與生活現金流開始，陪您看懂退休缺口與準備順序。',
    content: String.raw`
<div class="bj-lead">
  <div class="bj-lead__icon" aria-hidden="true"><i class="ri-line-chart-line"></i></div>
  <div>
    <p class="bj-eyebrow">退休不是某一天才突然發生</p>
    <h2>當工作收入停下來，生活仍然需要繼續</h2>
    <p>退休規劃不是先找一項商品，也不是先猜一個龐大的總額，而是先看懂：未來想過什麼生活、已經有哪些收入，以及兩者之間還差多少。</p>
  </div>
</div>

<h2>台灣勞工的退休現況：時間正在往前，但多數人還沒有清楚答案</h2>
<p>台灣已正式進入超高齡社會。與此同時，勞動部最新調查顯示，多數受訪勞工尚未規劃退休年齡；即使開始想退休，勞保與勞退仍只是整體生活費來源的一部分。</p>

<div class="bj-stat-grid" aria-label="台灣退休現況三項官方統計">
  <div class="bj-stat-card">
    <i class="bj-stat-card__icon ri-group-line" aria-hidden="true"></i>
    <div class="bj-stat-card__number">20.06%</div>
    <div class="bj-stat-card__label">2025年底台灣65歲以上人口占比</div>
    <div class="bj-stat-card__source"><a href="https://www.ris.gov.tw/info-liferay/app/channel/newsDetail/26007114" target="_blank" rel="noopener noreferrer">內政部戶政司，2025年12月底</a></div>
  </div>
  <div class="bj-stat-card">
    <i class="bj-stat-card__icon ri-calendar-question-line" aria-hidden="true"></i>
    <div class="bj-stat-card__number">82%</div>
    <div class="bj-stat-card__label">受訪勞工尚未規劃退休年齡</div>
    <div class="bj-stat-card__source"><a href="https://www.mol.gov.tw/1607/1632/1633/87690/" target="_blank" rel="noopener noreferrer">勞動部114年勞工生活及就業狀況調查</a></div>
  </div>
  <div class="bj-stat-card">
    <i class="bj-stat-card__icon ri-government-line" aria-hidden="true"></i>
    <div class="bj-stat-card__number">近43%</div>
    <div class="bj-stat-card__label">有規劃者的退休生活費，平均仰賴勞保與勞退的比重</div>
    <div class="bj-stat-card__source"><a href="https://www.mol.gov.tw/1607/1632/1633/87690/" target="_blank" rel="noopener noreferrer">勞動部114年調查</a></div>
  </div>
</div>

<p class="bj-data-note">資料說明：勞動部114年調查於2025年5月辦理，對象為參加勞工保險、就業保險及職業災害保險的本國籍受僱勞工，共回收4,029份有效樣本；其中未退休但已規劃退休年齡者占14.6%，平均規劃退休年齡為60.9歲。統計反映受訪群體，不代表每位勞工的個別狀況。</p>

<h2>這些數字真正提醒我們什麼？</h2>
<p><strong>第一，退休時間可能比準備開始得更早。</strong>已規劃退休年齡的受訪勞工，平均希望在60.9歲退休；但什麼時候能停止主要工作收入，仍會受到健康、家庭責任、工作狀況與資產準備影響。</p>
<p><strong>第二，有勞保與勞退，不等於退休現金流已經完整。</strong>它們是重要基礎，但仍要回到個人年資、投保薪資、勞退專戶與預計生活支出，才能知道是否存在缺口。</p>
<p><strong>第三，延後面對不會讓問題消失。</strong>82%尚未規劃退休年齡，不代表這些人完全沒有儲蓄；它更可能反映大家知道退休重要，卻不知道該從哪一個數字開始。</p>

<div class="bj-callout bj-callout--amber">
  <p><strong>退休焦慮通常不是因為少一項商品，而是少了一張完整地圖。</strong>當勞保、勞退、現有資產、每月支出與風險沒有放在同一張表上，很難判斷自己是真的不足，還是只是還沒整理。</p>
</div>

<h2>台灣勞工常見的四個退休難題</h2>
<div class="bj-grid" aria-label="台灣勞工常見退休難題">
  <div class="bj-card">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-file-list-3-line"></i></div>
    <h3>勞保、勞退到底能領多少？</h3>
    <p>兩者分屬不同制度，查詢方式與給付條件也不同；只知道「公司有提撥」還不足以估算退休收入。</p>
  </div>
  <div class="bj-card bj-card--blue">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-timer-line"></i></div>
    <h3>想退休的年齡，和能退休的年齡不同</h3>
    <p>提早幾年停止收入，會同時減少準備時間並拉長退休資金需要支應的期間。</p>
  </div>
  <div class="bj-card bj-card--amber">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-heart-pulse-line"></i></div>
    <h3>退休支出不會永遠相同</h3>
    <p>剛退休時可能增加休閒支出，之後醫療、居住與照顧需求也可能改變現金流結構。</p>
  </div>
  <div class="bj-card bj-card--violet">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-scales-3-line"></i></div>
    <h3>同時還有現在的家庭責任</h3>
    <p>房貸、子女、父母照顧與自己的退休會互相競爭，不能只把剩下的錢全部放到最遠的目標。</p>
  </div>
</div>

<h2>退休缺口，其實可以先從一個簡單問題開始</h2>
<p>與其先問「退休總共要存多少」，更有感的起點是：退休後每個月想要多少生活費，扣掉可預期收入後，還差多少？</p>

<div class="bj-equation bj-equation--retirement" role="img" aria-label="退休後每月生活需要減去可預期穩定收入，得到每月退休缺口">
  <div class="bj-equation__item">
    <i class="ri-cup-line" aria-hidden="true"></i>
    <strong>每月生活需要</strong>
    <span>生活、住房、醫療與家庭安排</span>
  </div>
  <div class="bj-equation__operator" aria-hidden="true">−</div>
  <div class="bj-equation__item">
    <i class="ri-bank-line" aria-hidden="true"></i>
    <strong>可預期穩定收入</strong>
    <span>勞保、勞退與其他可確認來源</span>
  </div>
  <div class="bj-equation__operator" aria-hidden="true">＝</div>
  <div class="bj-equation__item">
    <i class="ri-focus-2-line" aria-hidden="true"></i>
    <strong>每月退休缺口</strong>
    <span>需要提前準備或調整的部分</span>
  </div>
</div>

<p>勞保局提供<a href="https://www.bli.gov.tw/0109187.htm" target="_blank" rel="noopener noreferrer">勞保老年給付與勞工退休金整合試算</a>。試算可以提供起點，但實際給付資格與金額仍以申請時官方核定為準。</p>

<h2>退休生活不是一段完全相同的支出</h2>
<p>規劃時不宜只拿現在的生活費乘上退休年數。每個家庭不同，但通常可以分成三種需要思考的生活情境。</p>

<div class="bj-grid bj-grid--three" aria-label="退休生活三種支出情境">
  <div class="bj-card">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-walk-line"></i></div>
    <h3>活力生活</h3>
    <p>剛離開職場時，旅行、興趣、學習與社交可能是重要支出。</p>
  </div>
  <div class="bj-card bj-card--blue">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-home-heart-line"></i></div>
    <h3>生活轉換</h3>
    <p>居住方式、交通、保費與醫療需求可能改變，需要重新安排固定支出。</p>
  </div>
  <div class="bj-card bj-card--amber">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-hand-heart-line"></i></div>
    <h3>照顧需求</h3>
    <p>若生活自理能力下降，長期照顧與家人時間可能成為新的財務課題。</p>
  </div>
</div>

<h2>保家佳的退休規劃諮詢，會先做什麼？</h2>
<div class="bj-grid" aria-label="退休規劃諮詢流程">
  <div class="bj-card">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-database-2-line"></i></div>
    <h3>1. 盤點已有資源</h3>
    <p>整理勞保年資、勞退專戶、存款、保單、投資、住房與其他可預期收入。</p>
  </div>
  <div class="bj-card bj-card--blue">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-user-smile-line"></i></div>
    <h3>2. 描繪想要的生活</h3>
    <p>把退休年齡、居住、休閒、家庭支持與醫療照顧期待轉成每月現金流。</p>
  </div>
  <div class="bj-card bj-card--amber">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-alert-line"></i></div>
    <h3>3. 找出缺口與風險</h3>
    <p>測試提早退休、通膨、收入中斷、市場波動或長期照顧等情境。</p>
  </div>
  <div class="bj-card bj-card--violet">
    <div class="bj-card__icon" aria-hidden="true"><i class="ri-road-map-line"></i></div>
    <h3>4. 排出準備順序</h3>
    <p>決定現在最需要處理的事情與可持續節奏；工具是最後選擇，不是諮詢起點。</p>
  </div>
</div>

<h2>哪些人適合做一次退休現金流盤點？</h2>
<ul>
  <li>知道自己有勞保和勞退，但從未實際查過預估金額。</li>
  <li>心裡有希望退休的年齡，卻不知道目前進度。</li>
  <li>有在儲蓄或投資，但不確定如何轉成退休後的每月生活費。</li>
  <li>同時面對房貸、子女與父母照顧，不知道退休準備該排在哪裡。</li>
  <li>接近退休，想先理解請領時點與現金流差異。</li>
</ul>

<h2>退休規劃常見問題</h2>
<h3>我還年輕，現在談退休會不會太早？</h3>
<p>不需要很早就決定所有細節，但可以先確認方向。準備時間越長，越有空間隨收入與家庭變化調整，不必在接近退休時一次承擔所有壓力。</p>

<h3>有勞保和勞退，還需要自己準備嗎？</h3>
<p>要看個人可領金額與希望的生活支出。兩者是重要基礎，但是否足夠因年資、投保薪資、專戶累積與家庭需求而異，不能只用「有或沒有」判斷。</p>

<h3>退休規劃一定會談到商品嗎？</h3>
<p>不一定。第一步是把收入、支出、資產與風險整理清楚。只有在確定某項工具能解決具體問題，而且符合期限、流動性與風險需求時，才有比較的必要。</p>

<h2>相關服務</h2>
<p>想先整理平時的資金節奏，可以了解<a href="/services/savings-planning">儲蓄理財</a>；若擔心退休後的醫療與長期照顧，可接著看<a href="/services/senior-protection">銀髮保障諮詢</a>。</p>

<h2>資料來源</h2>
<ul class="bj-source-list">
  <li><a href="https://www.ris.gov.tw/info-liferay/app/channel/newsDetail/26007114" target="_blank" rel="noopener noreferrer">內政部戶政司：民國114年12月戶口統計資料分析</a></li>
  <li><a href="https://www.mol.gov.tw/1607/1632/1633/87690/" target="_blank" rel="noopener noreferrer">勞動部：114年勞工生活及就業狀況調查統計結果</a></li>
  <li><a href="https://www.bli.gov.tw/0109187.htm" target="_blank" rel="noopener noreferrer">勞保局：勞保老年給付與勞工退休金整合試算</a></li>
</ul>

<h2>一般性資訊提醒</h2>
<p>本頁統計用於說明整體趨勢，不代表個人退休結果。內容僅供一般性資訊與初步規劃參考，不構成特定保險商品、投資、稅務或法律建議；實際給付、承保與規劃結果，仍應依個人狀況、官方核定與正式契約內容為準。</p>
    `.trim(),
  },
];

function validatePage(page) {
  if (!page.content.includes('一般性資訊提醒')) {
    throw new Error(`Missing general information disclosure: ${page.slug}`);
  }
  if (!page.content.includes('bj-lead') || !page.content.includes('bj-card')) {
    throw new Error(`Missing visual content blocks: ${page.slug}`);
  }
  if (page.slug === 'savings-planning' && /儲蓄型保單|投資型保單|宣告利率/.test(page.content)) {
    throw new Error('Savings page is too product-led');
  }
  if (page.slug === 'retirement-planning' && !page.content.includes('82%')) {
    throw new Error('Retirement statistics are missing');
  }
}

for (const page of pages) validatePage(page);

if (process.argv.includes('--dry-run')) {
  for (const page of pages) {
    console.log(`Validated ${page.slug}: ${page.content.length} HTML characters`);
  }
  process.exit(0);
}

const slugs = pages.map((page) => page.slug);
const items = await db.query(
  `select id, data from app_records
   where collection = 'service_items'
     and data ->> 'slug' = any($1::text[])`,
  [slugs],
);

if (items.length !== pages.length) {
  throw new Error(`Expected ${pages.length} service items, found ${items.length}`);
}

for (const page of pages) {
  const item = items.find((row) => row.data.slug === page.slug);
  if (!item) throw new Error(`Missing service item: ${page.slug}`);

  const details = await db.query(
    `select id from app_records
     where collection = 'service_details'
       and data ->> 'service_id' = $1
     order by created_at asc`,
    [item.id],
  );
  if (details.length !== 1) {
    throw new Error(`Expected one service detail row for ${page.slug}, found ${details.length}`);
  }

  await db.query(
    `update app_records
     set data = data || $1::jsonb, updated_at = now()
     where id = $2 and collection = 'service_items'`,
    [JSON.stringify({ description: page.description }), item.id],
  );

  await db.query(
    `update app_records
     set data = data || $1::jsonb, updated_at = now()
     where id = $2 and collection = 'service_details'`,
    [JSON.stringify({ content: page.content, updated_at: new Date().toISOString() }), details[0].id],
  );

  console.log(`Published ${page.slug}: ${page.content.length} HTML characters`);
}
