import json, re, collections, statistics as st

rows = json.load(open("kept.json"))
def site(r): return "保險N次方" if "peiyinginsur" in r["url"] else "買保險"

def plain(r): return re.sub(r"@@h[1-4]@@\s*", "", r["text"])

AI_MARK = ["綜上所述","總的來說","總而言之","值得注意的是","隨著.{0,6}的發展","在當今","首先，","其次，","再者，",
"最後，","不僅.{0,10}而且","扮演著.{0,6}角色","至關重要","眾所周知","本文將","讓我們一起","希望這篇文章",
"深入探討","全面解析","一應俱全"]
HUMAN_MARK = ["我","你","我們","其實","但是","不過","對吧","真的","講白","說白","坦白","老實說","舉個例",
"曾經","有位","客戶","朋友","媽媽","爸爸","記得","想像一下","？","嗎？","吧！"]

out = {}
for s in ["買保險","保險N次方"]:
    rs = [r for r in rows if site(r)==s]
    chars=[r["chars"] for r in rs]
    h2=[sum(1 for t,_ in r["headings"] if t=="h2") for r in rs]
    h3=[sum(1 for t,_ in r["headings"] if t=="h3") for r in rs]
    # 句長
    sent=[]; para=[]
    q_head=0; num_head=0; tot_head=0
    for r in rs:
        p = plain(r)
        for x in re.split(r"[。！？\n]", p):
            x=x.strip()
            if 2 <= len(x) <= 200: sent.append(len(x))
        for x in p.split("\n"):
            x=x.strip()
            if len(x)>10: para.append(len(x))
        for t,h in r["headings"]:
            if t in ("h2","h3"):
                tot_head+=1
                if "？" in h or "?" in h or h.endswith("嗎") : q_head+=1
                if re.search(r"[0-9０-９一二三四五六七八九十]{1,3}[、.．)]|^\d", h): num_head+=1
    body = "\n".join(plain(r) for r in rs)
    n_char = len(re.sub(r"\s","",body))
    ai = {m: len(re.findall(m, body)) for m in AI_MARK}
    hm = {m: body.count(m) for m in HUMAN_MARK if len(m)>1}
    out[s]={
      "篇數":len(rs),
      "字數中位數":int(st.median(chars)),"字數平均":int(st.mean(chars)),
      "字數四分位":[int(st.quantiles(chars,n=4)[0]),int(st.quantiles(chars,n=4)[2])],
      "h2中位數":int(st.median(h2)),"h3中位數":int(st.median(h3)),
      "句長中位數":int(st.median(sent)),"句長平均":round(st.mean(sent),1),
      "句長八成落在":[int(st.quantiles(sent,n=10)[0]),int(st.quantiles(sent,n=10)[8])],
      "段落長度中位數":int(st.median(para)),
      "疑問句標題比例":round(q_head/max(tot_head,1)*100,1),
      "含數字標題比例":round(num_head/max(tot_head,1)*100,1),
      "每萬字問號數":round(body.count("？")/n_char*10000,1),
      "每萬字_你":round(body.count("你")/n_char*10000,1),
      "每萬字_您":round(body.count("您")/n_char*10000,1),
      "每萬字_我":round(body.count("我")/n_char*10000,1),
      "AI腔命中前5":sorted(ai.items(), key=lambda x:-x[1])[:5],
      "AI腔每萬字總數":round(sum(ai.values())/n_char*10000,2),
    }
print(json.dumps(out, ensure_ascii=False, indent=1))
