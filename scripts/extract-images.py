import re
from pathlib import Path

html = Path(r"e:\Dreams Mantra\dreamz-about.html").read_text(encoding="utf-8", errors="ignore")
urls = set(re.findall(r"https://lh3\.googleusercontent\.com/sitesv/[^\"'\s\\<>]+", html))
for u in sorted(urls, key=len):
    print(u)
print("TOTAL", len(urls))
