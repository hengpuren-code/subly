#!/usr/bin/env python
"""一键替换站点里的域名占位符。

用法：
    python scripts/set_domain.py https://your-name.pages.dev
    python scripts/set_domain.py yourdomain.com

会替换 index.html / sitemap.xml / robots.txt 中的 `subly.example.com`。
"""
import pathlib
import re
import sys

SITE = pathlib.Path(__file__).resolve().parent.parent / "site"
OLD_HOST = "subly.example.com"
FILES = ["index.html", "sitemap.xml", "robots.txt"]


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    raw = sys.argv[1].strip()
    host = re.sub(r"^https?://", "", raw).rstrip("/")
    if not host:
        print("错误：域名为空")
        return 2

    total = 0
    for name in FILES:
        p = SITE / name
        if not p.exists():
            continue
        text = p.read_text(encoding="utf-8")
        n = text.count(OLD_HOST)
        if n:
            p.write_text(text.replace(OLD_HOST, host), encoding="utf-8")
            print(f"{name}: 替换 {n} 处 -> {host}")
            total += n

    if total == 0:
        print(f"未找到占位符 {OLD_HOST}（可能已替换）。")
    else:
        print(f"\n共替换 {total} 处。记得重新打包：python scripts/package.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
