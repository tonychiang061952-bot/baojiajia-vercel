#!/usr/bin/env python3
"""交稿前自我檢查：把 markdown 稿件跟 709 篇對標語料的實測門檻比對。

用法：python3 工具/檢查稿件.py 你的稿件.md
門檻來源：references/01-語料統計.md
"""
import re, sys, statistics as st

BAN = ["綜上所述","總而言之","總的來說","值得注意的是","在當今","不僅","扮演著","至關重要",
       "眾所周知","本文將帶","讓我們一起","深入探討","全面解析","保障您的權益","為您量身打造",
       "一應俱全","日益增加","隨著","首先，","其次，","再者，"]
COMPANY = ["國泰","富邦","南山","新光","台灣人壽","臺灣人壽","中國人壽","全球人壽","三商美邦",
           "遠雄","宏泰","第一金","元大","凱基","保誠","友邦","安聯","安達","法國巴黎","合作金庫",
           "台銀人壽","中華郵政","康健人壽","蘇黎世","明台","泰安產物","兆豐產物","華南產物",
           "旺旺友聯","新安東京","和泰產物","第一產物","AIA","Chubb","Allianz","Cigna"]
HEDGE = ["不一定","視情況","不代表","不等於","仍以","仍須","仍要","因人而異","沒有標準答案",
         "不能套用","不能取代"]
STRUCT = {"先說結論":r"先說結論|先講結論|結論先講",
          "文首更新日":r"最後更新|原始發布",
          "延伸閱讀／內部連結":r"延伸閱讀|系列文章|另一篇|請見|前往",
          "FAQ 區塊":r"常見問題|Q&A|Q：|Q1",
          "CTA":r"諮詢|加入.{0,4}LINE|填表|預約|整理.{0,6}保單後"}

def report(path):
    raw = open(path, encoding="utf-8").read()
    heads = re.findall(r"^#{2,3}\s*(.+)$", raw, re.M)
    # 表格列不是句子，量句長前先拿掉（欄位內容仍算進字數與用詞檢查）
    prose = "\n".join(l for l in raw.split("\n") if not l.lstrip().startswith("|"))
    body = re.sub(r"^#{1,6}\s*", "", raw, flags=re.M)
    prose = re.sub(r"^#{1,6}\s*", "", prose, flags=re.M)
    prose = re.sub(r"[`*_>\[\]()]|https?://\S+", "", prose)
    body = re.sub(r"[`*_>\[\]()]|https?://\S+", "", body)
    n = len(re.sub(r"\s", "", body))
    sents = [s.strip() for s in re.split(r"[。！？\n]", prose) if 2 <= len(s.strip()) <= 200]
    paras = [p.strip() for p in body.split("\n") if len(p.strip()) > 10]
    per = lambda c: round(c / max(n,1) * 10000, 1)
    q_head = sum(1 for h in heads if "？" in h or h.rstrip().endswith("嗎"))

    def line(label, val, ok, target):
        mark = "✅" if ok else "⚠️ "
        print(f"{mark} {label:<16}{str(val):<12}目標 {target}")

    print(f"\n=== {path} ===")
    print(f"總字數 {n}／h2·h3 {len(heads)} 個／句子 {len(sents)} 句\n")
    med = int(st.median([len(s) for s in sents])) if sents else 0
    longest = max((len(s) for s in sents), default=0)
    pmed = int(st.median([len(p) for p in paras])) if paras else 0
    line("句長中位數", med, 15 <= med <= 26, "15–26 字")
    line("最長的句子", longest, longest <= 60, "≤60 字")
    line("段落長度中位數", pmed, pmed <= 60, "≤60 字（1–3 句）")
    line("問號密度/萬字", per(body.count("？")), 25 <= per(body.count("？")) <= 90, "25–90")
    line("「你」/萬字", per(body.count("你")), per(body.count("你")) >= 8, "≥8")
    line("「您」/萬字", per(body.count("您")), body.count("您") == 0, "0（改用「你」）")
    line("疑問句小標比例", f"{round(q_head/max(len(heads),1)*100)}%",
         q_head/max(len(heads),1) >= 0.25, "≥25%")
    line("保留語（不一定…）", sum(body.count(h) for h in HEDGE),
         sum(body.count(h) for h in HEDGE) >= 3, "≥3 處")
    line("具體數字", len(re.findall(r"\d", body)), len(re.findall(r"\d", body)) >= 10, "≥10 個")

    hit_ban = sorted({b for b in BAN if b in body})
    hit_co  = sorted({c for c in COMPANY if c in body})
    print()
    print(("✅ 無 AI 套語" if not hit_ban else "❌ AI 套語：" + "、".join(hit_ban)))
    print(("✅ 無公司名／商品名" if not hit_co else "❌ 出現公司名：" + "、".join(hit_co)))
    print()
    for name, pat in STRUCT.items():
        print(("✅ " if re.search(pat, raw) else "⚠️  缺少 ") + name)
    print()
    # 廢話偵測：自我辯解句型與排比重述，需人工判斷，不計入通過與否
    padding = re.findall(r"[^。\n]{0,25}不是[^。\n]{0,20}，(?:而?是)[^。\n]{0,25}", prose)
    if padding:
        print("🔍 「不是 X，是 Y」句型（X 若不是讀者真有的預設就刪掉那半）：")
        for x in padding:
            print("   ·", x.strip()[:60])
        print()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    for p in sys.argv[1:]:
        report(p)
