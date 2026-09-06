import json, os, re, sys, time, hashlib, urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = "Mozilla/5.0 (compatible; ClaudeBot/1.0; style-study; +https://claude.com/claude-code)"
OUT = "raw"
os.makedirs(OUT, exist_ok=True)

def path_for(url):
    return os.path.join(OUT, hashlib.md5(url.encode()).hexdigest() + ".html")

def fetch(url):
    p = path_for(url)
    if os.path.exists(p) and os.path.getsize(p) > 2000:
        return ("cached", url)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "zh-TW"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        open(p, "wb").write(data)
        time.sleep(0.4)
        return ("ok", url)
    except Exception as e:
        return ("err:%s" % type(e).__name__, url)

urls = [l.strip() for l in open(sys.argv[1]) if l.strip()]
res = {}
with ThreadPoolExecutor(max_workers=5) as ex:
    for i, (st, u) in enumerate(ex.map(fetch, urls), 1):
        res[st.split(":")[0]] = res.get(st.split(":")[0], 0) + 1
        if i % 100 == 0:
            print(i, res, flush=True)
print("DONE", len(urls), res, flush=True)
