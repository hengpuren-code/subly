#!/usr/bin/env python
"""把 site/ 打包成可拖拽部署的 dist/subly-site.zip。零依赖。"""
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
OUT = ROOT / "dist" / "subly-site.zip"

SKIP = {"__pycache__"}


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(SITE.rglob("*")):
            if p.is_file() and not any(part in SKIP for part in p.parts):
                z.write(p, p.relative_to(SITE))
                count += 1
    size = OUT.stat().st_size
    print(f"packed {count} files -> {OUT.relative_to(ROOT)} ({size} bytes)")


if __name__ == "__main__":
    main()
