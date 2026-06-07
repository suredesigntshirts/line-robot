#!/usr/bin/env python3
"""Generate the 2500x843 rich-menu image for line-robot's 5-tab nav menu.

Panels (left→right) MUST match buildRichMenu()'s tab order:
  My Listings · Upcoming · Search · Catalog · Help
The picture is cosmetic — the tap zones are defined by bounds in richMenu.ts, not by this image.

Usage:  python3 gen-rich-menu-image.py [out.png]
"""
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 2500, 843
N = 5
PANEL = W // N  # 500

BG = (16, 24, 43)        # dark navy
BG_ALT = (21, 31, 54)    # alternating panel tint
GREEN = (6, 199, 85)     # LINE green
TEXT = (232, 234, 237)   # near-white
DIVIDER = (38, 50, 78)

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font = ImageFont.truetype(FONT_PATH, 46)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Alternating panel backgrounds + dividers.
for i in range(N):
    if i % 2 == 1:
        d.rectangle([i * PANEL, 0, (i + 1) * PANEL, H], fill=BG_ALT)
for i in range(1, N):
    x = i * PANEL
    d.line([(x, 90), (x, H - 90)], fill=DIVIDER, width=3)

ICON_CY = 330          # icon vertical centre
LABEL_Y = 545          # label baseline-ish
LW = 14                # default stroke width


def cx(i):
    return i * PANEL + PANEL // 2


def label(i, text):
    bbox = d.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    d.text((cx(i) - w / 2, LABEL_Y), text, font=font, fill=TEXT)


def house(i):
    """My Listings — a house."""
    x = cx(i)
    y = ICON_CY
    # roof
    d.polygon([(x - 110, y - 5), (x, y - 110), (x + 110, y - 5)], outline=GREEN, width=LW)
    # body
    d.rectangle([x - 80, y - 5, x + 80, y + 105], outline=GREEN, width=LW)
    # door
    d.rectangle([x - 28, y + 30, x + 28, y + 105], outline=GREEN, width=LW)


def calendar(i):
    """Upcoming — a calendar with a clock hand feel (rings + ticks)."""
    x = cx(i)
    y = ICON_CY
    d.rounded_rectangle([x - 100, y - 90, x + 100, y + 100], radius=18, outline=GREEN, width=LW)
    # header bar
    d.line([(x - 100, y - 40), (x + 100, y - 40)], fill=GREEN, width=LW)
    # hangers
    d.line([(x - 55, y - 120), (x - 55, y - 70)], fill=GREEN, width=LW)
    d.line([(x + 55, y - 120), (x + 55, y - 70)], fill=GREEN, width=LW)
    # day dots
    for dx in (-55, 0, 55):
        for dy in (10, 60):
            d.ellipse([x + dx - 10, y + dy - 10, x + dx + 10, y + dy + 10], fill=GREEN)


def magnifier(i):
    """Search — a magnifying glass."""
    x = cx(i) - 20
    y = ICON_CY - 20
    r = 78
    d.ellipse([x - r, y - r, x + r, y + r], outline=GREEN, width=LW)
    # handle
    import math
    a = math.radians(45)
    x0 = x + r * math.cos(a)
    y0 = y + r * math.sin(a)
    d.line([(x0, y0), (x0 + 80, y0 + 80)], fill=GREEN, width=LW + 6)


def catalog(i):
    """Catalog — a 2x2 grid of cards (the browse gallery)."""
    x = cx(i)
    y = ICON_CY
    s = 88   # card size
    g = 22   # gap
    for dx in (-(s + g) / 2, (s + g) / 2):
        for dy in (-(s + g) / 2, (s + g) / 2):
            cx0 = x + dx - s / 2
            cy0 = y + dy - s / 2
            d.rounded_rectangle([cx0, cy0, cx0 + s, cy0 + s], radius=12, outline=GREEN, width=10)


def helpmark(i):
    """Help — a question mark in a circle."""
    x = cx(i)
    y = ICON_CY
    d.ellipse([x - 95, y - 95, x + 95, y + 95], outline=GREEN, width=LW)
    qfont = ImageFont.truetype(FONT_PATH, 130)
    bbox = d.textbbox((0, 0), "?", font=qfont)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    d.text((x - w / 2 - bbox[0], y - h / 2 - bbox[1]), "?", font=qfont, fill=GREEN)


house(0)
label(0, "My Listings")
calendar(1)
label(1, "Upcoming")
magnifier(2)
label(2, "Search")
catalog(3)
label(3, "Catalog")
helpmark(4)
label(4, "Help")

out = sys.argv[1] if len(sys.argv) > 1 else "rich-menu.png"
img.save(out, "PNG")
print(f"wrote {out} ({W}x{H})")
