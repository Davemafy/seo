#!/usr/bin/env python3
"""Draw two fixed visual canaries without requiring a browser or a model key."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CASES = [
    dict(file="alpha.png", title="CEDAR STUDIO", code="Q7K-42", header="#194735", selected=0),
    dict(file="beta.png", title="NOVA LABS", code="M3P-81", header="#182B52", selected=1)
]
def font(size, bold=False):
    suffix = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    path = "/usr/share/fonts/truetype/dejavu/" + suffix
    return ImageFont.truetype(path, size) if Path(path).is_file() else ImageFont.load_default()

def render(directory):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    for c in CASES:
        canvas = Image.new("RGB", (960, 625), "#F5F1E9")
        d = ImageDraw.Draw(canvas)
        d.rectangle((0, 0, 960, 141), fill=c["header"])
        d.text((56, 39), c["title"], font=font(45, True), fill="#FFFFFF")
        d.rounded_rectangle((735, 48, 905, 101), radius=3, fill="#F2D678")
        d.text((753, 58), c["code"], font=font(25, True), fill="#193B2A")
        d.text((54, 166), "WORKSPACE / PRICING COMPARISON", font=font(12, True), fill="#536D62")
        d.text((54, 194), "Choose how you work.", font=font(38, True), fill="#182C2A")
        for i, name in enumerate(["STARTER", "TEAM"]):
            x = 54 + i * 448
            y = 286
            outline = "#DA6258" if i == c["selected"] else "#D1D7CD"
            line = 8 if i == c["selected"] else 5
            d.rectangle((x, y, x + 425, y + 301), fill="#FFFDFC", outline=outline, width=line)
            d.text((x + 29, y + 26), "0" + str(i + 1) + " / PLAN", font=font(12, True), fill="#60796A")
            d.text((x + 29, y + 60), name, font=font(32, True), fill="#1D3830")
            d.text((x + 29, y + 112), "For individuals and teams." if i == 0 else "For growing organizations.",
                   font=font(15), fill="#4C6256")
            d.text((x + 29, y + 193), "$29" if i == 0 else "$99", font=font(35, True), fill="#193B2A")
            d.text((x + 130, y + 206), "/ month", font=font(14), fill="#506858")
            d.text((x + 29, y + 264), "View this plan", font=font(13, True), fill="#233E33")
        canvas.save(directory / c["file"], optimize=True)
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    render(args.output)
    print("Created two fixed visual canaries:", args.output)
