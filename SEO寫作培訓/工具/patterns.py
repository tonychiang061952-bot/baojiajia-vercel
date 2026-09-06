import json, re, collections
rows = json.load(open("kept.json"))
def plain(r): return re.sub(r"@@h[1-4]@@\s*","",r["text"])
PAT = {
 "先說結論／結論先講": r"先說結論|結論先講|先講結論|直接說結論",
 "文首標最後更新日": r"最後更新|原始發布|文章持續更新",
 "引用法條": r"保險法第\s*\d+\s*條|民法第\s*\d+\s*條",
 "引用官方機構": r"金管會|保險局|評議中心|衛福部|健保署|司法院|勞保局",
 "引用統計數據": r"根據.{0,12}(統計|調查|資料|報告)",
 "FAQ區塊": r"常見問題|Q\d|Q：|Q1",
 "真人化名案例": r"小明|小美|小華|小陳|小林|阿[一-龥]{1}(?![-])|案例|實際案例",
 "第一人稱經驗": r"我協助|我遇過|我處理|我看過|我會先|筆者|我的客戶|我建議",
 "承認不確定": r"不一定|視情況|因人而異|沒有標準答案|不代表一定|不等於",
 "反駁常見迷思": r"迷思|其實不|並不是|不是只看|常見誤解|很多人以為|別再",
 "內部連結指路": r"延伸閱讀|系列文章|前往新版|完整版|母文|子文|請見|詳見|另一篇",
 "CTA_LINE": r"LINE@|加入官方|line@",
 "CTA_填表": r"填表|表單|免費諮詢|預約|索取",
 "表格": r"\|.*\||一張表|下表|如下表",
 "比喻": r"就像|好比|等於是|想像一下|如同.{0,10}一樣|打個比方",
}
sites = {"買保險":"smartbeb", "保險N次方":"peiying"}
res = {}
for s,k in sites.items():
    rs=[r for r in rows if k in r["url"]]
    n=len(rs)
    d={}
    for name,p in PAT.items():
        c=sum(1 for r in rs if re.search(p, plain(r)))
        d[name]="%d%%" % round(c/n*100)
    res[s]=d
w = max(len(x) for x in PAT)
print("模式".ljust(w+4), "買保險", " 保險N次方")
for name in PAT:
    print(name.ljust(w+6), res["買保險"][name].rjust(4), res["保險N次方"][name].rjust(8))
