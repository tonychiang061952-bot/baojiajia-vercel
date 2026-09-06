import json, os, re, hashlib, html
from html.parser import HTMLParser

RAW = "raw"
BLOCK = {"p","h1","h2","h3","h4","h5","li","div","br","tr","blockquote","section","figcaption","td"}

class Grab(HTMLParser):
    """抓指定容器內的文字，保留標題層級標記。"""
    def __init__(self, match):
        super().__init__(convert_charrefs=True)
        self.match = match          # fn(tag, attrs) -> bool 判斷是不是容器起點
        self.depth = 0              # 容器內的巢狀深度
        self.on = False
        self.skip = 0               # script/style
        self.buf = []
        self.tagstack = []
        self.title = None
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title": self._in_title = True
        if tag in ("script","style","noscript"):
            self.skip += 1; return
        if not self.on and self.match(tag, a):
            self.on = True; self.depth = 1; return
        if self.on:
            if tag == self.container_tag: self.depth += 1
            if tag in ("h1","h2","h3","h4"): self.buf.append("\n@@%s@@" % tag)
            elif tag in BLOCK: self.buf.append("\n")

    def handle_endtag(self, tag):
        if tag == "title": self._in_title = False
        if tag in ("script","style","noscript"):
            self.skip = max(0, self.skip-1); return
        if self.on and tag == self.container_tag:
            self.depth -= 1
            if self.depth <= 0: self.on = False

    def handle_data(self, d):
        if self._in_title and self.title is None:
            self.title = d.strip()
        if self.on and not self.skip:
            self.buf.append(d)

def grab(hcontent, container_tag, match):
    g = Grab(match); g.container_tag = container_tag
    try: g.feed(hcontent)
    except Exception: pass
    txt = "".join(g.buf)
    txt = re.sub(r"[ \t　]+", " ", txt)
    txt = re.sub(r"\n\s*\n+", "\n", txt)
    lines = [l.strip() for l in txt.split("\n")]
    lines = [l for l in lines if l]
    return g.title, lines

def parse(url, path):
    try:
        raw = open(path, "rb").read().decode("utf-8", "ignore")
    except Exception:
        return None
    if "peiyinginsur" in url:
        m = lambda t,a: t=="div" and "html-info" in a.get("class","")
        title, lines = grab(raw, "div", m)
    else:
        m = lambda t,a: t=="article"
        title, lines = grab(raw, "article", m)
    body, heads = [], []
    for l in lines:
        mm = re.match(r"@@(h[1-4])@@\s*(.*)", l)
        if mm:
            if mm.group(2): heads.append((mm.group(1), mm.group(2)))
            body.append(l)
        else:
            body.append(l)
    text = "\n".join(body)
    plain = re.sub(r"@@h[1-4]@@\s*", "", text)
    return {"url": url, "title": title, "headings": heads,
            "text": text, "chars": len(re.sub(r"\s", "", plain))}

urls = [l.strip() for l in open("all_targets.txt") if l.strip()]
out = open("corpus.jsonl", "w")
n_ok = n_thin = 0
for u in urls:
    p = os.path.join(RAW, hashlib.md5(u.encode()).hexdigest() + ".html")
    if not os.path.exists(p): continue
    d = parse(u, p)
    if not d: continue
    if d["chars"] < 250: n_thin += 1; continue
    out.write(json.dumps(d, ensure_ascii=False) + "\n"); n_ok += 1
out.close()
print("解析成功", n_ok, "／內容過短跳過", n_thin)
