import json, re, collections

# 壽險／產險／保經 公司名（含簡稱）
COMPANY = ["國泰人壽","國泰產險","富邦人壽","富邦產險","南山人壽","南山產物","新光人壽","新光產物",
"台灣人壽","臺灣人壽","中國人壽","全球人壽","三商美邦","遠雄人壽","宏泰人壽","第一金人壽","元大人壽",
"凱基人壽","保誠人壽","友邦人壽","安聯人壽","安達人壽","法國巴黎人壽","合作金庫人壽","台銀人壽",
"中華郵政","郵局壽險","簡易人壽","康健人壽","蘇黎世","明台產物","泰安產物","兆豐產物","華南產物",
"旺旺友聯","新安東京","和泰產物","第一產物","臺灣產物","台灣產物","南山產險","國華人壽","幸福人壽",
"朝陽人壽","遠雄產物","AIA","MetLife","Chubb","Allianz","Cigna","錠嵂","公勝","永達","大誠","昇恆",
"磊山","宏利","安盛","國寶","保發中心保單"]
# 商品比較／揭露商品的訊號
PRODUCT = ["商品比較","保費比較","保單比較","商品評比","保費試算表","商品推薦","CP值","懶人包推薦",
"投保規則表","費率表","商品條款","保單條款下載","主約附約組合表","○○人壽","XX人壽"]
# 純書籍推薦
BOOK = ["書籍推薦","推薦書單","好書推薦","閱讀筆記","讀後心得","博客來","這本書"]

rows = [json.loads(l) for l in open("corpus.jsonl")]
kept, drop = [], collections.Counter()
for r in rows:
    t = (r["title"] or "") + "\n" + r["text"]
    hits_c = [c for c in COMPANY if c in t]
    hits_p = [p for p in PRODUCT if p in t]
    hits_b = [b for b in BOOK if b in t]
    reason = None
    if len(hits_c) >= 1: reason = "公司名/商品名"
    elif len(hits_p) >= 2: reason = "商品比較"
    elif len(hits_b) >= 2: reason = "書籍推薦"
    if reason:
        drop[reason] += 1
        r["drop_reason"] = reason; r["hits"] = (hits_c + hits_p + hits_b)[:5]
    else:
        kept.append(r)
json.dump(kept, open("kept.json","w"), ensure_ascii=False)
print("原始", len(rows), "／保留", len(kept), "／排除", sum(drop.values()), dict(drop))
by_site = collections.Counter("買保險" if "smartbeb" in r["url"] else "保險N次方" for r in kept)
print("保留分佈", dict(by_site))
lens = sorted(r["chars"] for r in kept)
print("字數 中位數", lens[len(lens)//2], "／最短", lens[0], "／最長", lens[-1])
