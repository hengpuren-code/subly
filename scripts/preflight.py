#!/usr/bin/env python
"""发布前体检：检查站内资源引用、未替换占位符、必需文件。

- 缺失资源 / 缺必需文件 → 报错（退出码 1），必须修
- 未替换的域名占位符   → 警告（不影响退出码），提醒你上线前替换

用法：python scripts/preflight.py
"""
import pathlib
import re
import sys

SITE = pathlib.Path(__file__).resolve().parent.parent / "site"
PLACEHOLDER_HOSTS = ["subly.example.com"]
PLACEHOLDER_EMAILS = ["example.com"]

REQUIRED = [
    "index.html", "app.html", "privacy.html", "404.html",
    "styles.css", "app.js", "logic.js", "favicon.svg", "og.png",
    "_headers",
]

LINK_RE = re.compile(r'(?:href|src)\s*=\s*"([^"]+)"')
SKIP_PREFIX = ("http://", "https://", "mailto:", "#", "data:", "//")


def local_refs(html):
    for m in LINK_RE.finditer(html):
        ref = m.group(1)
        if ref.startswith(SKIP_PREFIX):
            continue
        ref = ref.split("#")[0].split("?")[0]
        if ref:
            yield ref


def main():
    errors = 0
    warnings = 0

    for name in REQUIRED:
        if not (SITE / name).exists():
            print(f"[error]   缺少必需文件: {name}")
            errors += 1

    for h in sorted(SITE.glob("*.html")):
        text = h.read_text(encoding="utf-8")
        for ref in local_refs(text):
            if not (h.parent / ref).resolve().exists():
                print(f"[error]   {h.name} 引用了不存在的资源: {ref}")
                errors += 1

    scan = list(SITE.glob("*.html")) + [SITE / "robots.txt", SITE / "sitemap.xml"]
    for p in scan:
        if not p.exists():
            continue
        text = p.read_text(encoding="utf-8")
        for ph in PLACEHOLDER_HOSTS:
            if ph in text:
                print(f"[warn]    {p.name} 仍含域名占位: {ph}（上线前用 set_domain.py 替换）")
                warnings += 1
        if p.suffix == ".html" and "example.com" in text and p.name == "privacy.html":
            print(f"[warn]    {p.name} 仍含示例邮箱占位")
            warnings += 1

    print(f"\npreflight: {errors} 个错误, {warnings} 个警告")
    if errors == 0:
        print("[OK] 无阻塞问题")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
