#!/usr/bin/env python
"""生成社交分享卡 site/og.png（1200x630）。纯标准库，无第三方依赖。

画一张品牌抽象图：深色对角渐变背景 + 品牌色卡片的「订阅列表」意象。
不渲染文字，避免字体依赖，保证在任何环境都能稳定生成。
"""
import pathlib
import struct
import zlib

W, H = 1200, 630
BG0 = (13, 15, 21)
BG1 = (28, 33, 45)
CARD = (23, 26, 35)
ACCENT = (91, 140, 255)
ACCENT2 = (124, 92, 255)

OUT = pathlib.Path(__file__).resolve().parent.parent / "site" / "og.png"


def blend(c0, c1, t):
    t = max(0.0, min(1.0, t))
    return tuple(round(c0[i] + (c1[i] - c0[i]) * t) for i in range(3))


def rounded(x, y, x0, y0, x1, y1, r):
    """像素 (x, y) 是否落在圆角矩形内。"""
    if x < x0 or x >= x1 or y < y0 or y >= y1:
        return False
    dx = 0
    if x < x0 + r:
        dx = (x0 + r) - x
    elif x > x1 - 1 - r:
        dx = x - (x1 - 1 - r)
    dy = 0
    if y < y0 + r:
        dy = (y0 + r) - y
    elif y > y1 - 1 - r:
        dy = y - (y1 - 1 - r)
    return dx * dx + dy * dy <= r * r


def build_rows():
    rows = []
    for y in range(H):
        row = bytearray()
        for x in range(W):
            r, g, b = blend(BG0, BG1, (x + y) / (W + H))
            # 顺序：logo、三条列表条优先于卡片，最后是卡片与背景
            if rounded(x, y, 90, 60, 170, 140, 20):
                r, g, b = blend(ACCENT, ACCENT2, x / W)
            elif rounded(x, y, 150, 210, 900, 250, 20):
                r, g, b = blend(ACCENT, ACCENT2, (x - 150) / 750)
            elif rounded(x, y, 150, 290, 780, 330, 20):
                r, g, b = blend(ACCENT, ACCENT2, (x - 150) / 630)
            elif rounded(x, y, 150, 370, 560, 410, 20):
                r, g, b = blend(ACCENT, ACCENT2, (x - 150) / 410)
            elif rounded(x, y, 90, 150, 1110, 480, 28):
                r, g, b = CARD
            row += bytes((r, g, b))
        rows.append(bytes(row))
    return rows


def chunk(typ, data):
    return (struct.pack(">I", len(data)) + typ + data
            + struct.pack(">I", zlib.crc32(typ + data) & 0xFFFFFFFF))


def png_bytes(rows):
    raw = b"".join(b"\x00" + row for row in rows)  # 每行 filter type 0
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0)  # 8-bit truecolor RGB
    idat = zlib.compress(raw, 9)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


def main():
    data = png_bytes(build_rows())
    OUT.write_bytes(data)
    print(f"wrote {OUT} ({len(data)} bytes, {W}x{H})")


if __name__ == "__main__":
    main()
