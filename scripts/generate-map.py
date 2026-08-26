#!/usr/bin/env python3
"""D1 — precompute the coverage-map dot field (Master Build §6/B10, §8).

Fetches the West Midlands region boundary (ONS EER geometry via the
martinjc/UK-GeoJSON mirror), rasterises it onto a hex-offset grid of ~58
columns, and writes src/data/map-dots.json for the CoverageMap island to
draw. The JSON is checked in — the site build never touches the network.

Note: §8 cites json/eurostat/ew/eer.json, which no longer exists in the
mirror; json/electoral/eng/eer.json is the same ONS EER geometry's current
home (verified 26 Aug 2026).

Run:  python scripts/generate-map.py
"""
import json
import math
import urllib.request
from pathlib import Path

SOURCE = "https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/electoral/eng/eer.json"
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "map-dots.json"

COLS = 58          # ≈58 columns of dots (spec)
WIDTH = 640        # logical px; the canvas scales by DPR at draw time
MARGIN = 26        # logical px of breathing room around everything

BASE = ("Telford", 52.6784, -2.4453)
CITIES = [
    ("Shrewsbury", 52.7073, -2.7536),
    ("Wolverhampton", 52.5862, -2.1288),
    ("Birmingham", 52.4862, -1.8904),
    ("Stafford", 52.8066, -2.1171),
    ("Worcester", 52.1936, -2.2216),
]
RINGS_KM = (30, 60)

KM_PER_DEG_LAT = 111.32


def fetch_region():
    with urllib.request.urlopen(SOURCE, timeout=60) as response:
        data = json.load(response)
    for feature in data["features"]:
        if any(
            isinstance(value, str) and value.strip() == "West Midlands"
            for value in feature["properties"].values()
        ):
            return feature["geometry"]
    raise SystemExit("West Midlands feature not found in EER source")


def polygons_of(geometry):
    if geometry["type"] == "Polygon":
        return [geometry["coordinates"]]
    if geometry["type"] == "MultiPolygon":
        return geometry["coordinates"]
    raise SystemExit(f"unexpected geometry type {geometry['type']}")


def point_in_ring(x, y, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def point_in_polygons(x, y, polygons):
    for rings in polygons:
        if point_in_ring(x, y, rings[0]) and not any(
            point_in_ring(x, y, hole) for hole in rings[1:]
        ):
            return True
    return False


def main():
    geometry = fetch_region()
    polygons = polygons_of(geometry)

    lons = [p[0] for rings in polygons for ring in rings for p in ring]
    lats = [p[1] for rings in polygons for ring in rings for p in ring]
    lat_mid = (min(lats) + max(lats)) / 2
    km_per_deg_lon = KM_PER_DEG_LAT * math.cos(math.radians(lat_mid))

    def to_km(lon, lat):
        return lon * km_per_deg_lon, -lat * KM_PER_DEG_LAT  # y grows downward

    km = [to_km(lon, lat) for lon, lat in zip(lons, lats)]
    base_km = to_km(BASE[2], BASE[1])

    # The frame must hold the region AND the outer ring around base.
    xs = [p[0] for p in km] + [base_km[0] - RINGS_KM[1], base_km[0] + RINGS_KM[1]]
    ys = [p[1] for p in km] + [base_km[1] - RINGS_KM[1], base_km[1] + RINGS_KM[1]]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)

    scale = (WIDTH - 2 * MARGIN) / (x1 - x0)  # px per km
    height = round((y1 - y0) * scale + 2 * MARGIN)

    def to_px(lon, lat):
        x_km, y_km = to_km(lon, lat)
        return (
            round((x_km - x0) * scale + MARGIN, 1),
            round((y_km - y0) * scale + MARGIN, 1),
        )

    # Hex-offset grid over the region.
    dx = WIDTH / COLS
    dy = dx * 0.866
    dots = []
    row = 0
    y = MARGIN / 2
    while y < height:
        offset = (dx / 2) if row % 2 else 0
        x = offset
        while x < WIDTH:
            x_km = (x - MARGIN) / scale + x0
            y_km = (y - MARGIN) / scale + y0
            lon = x_km / km_per_deg_lon
            lat = -y_km / KM_PER_DEG_LAT
            if point_in_polygons(lon, lat, polygons):
                dots.append([round(x, 1), round(y, 1)])
            x += dx
        y += dy
        row += 1

    base_px = to_px(BASE[2], BASE[1])
    payload = {
        "w": WIDTH,
        "h": height,
        "kmPerPx": round(1 / scale, 5),
        "dots": dots,
        "base": {"name": BASE[0], "x": base_px[0], "y": base_px[1]},
        "cities": [
            {"name": name, "x": to_px(lon, lat)[0], "y": to_px(lon, lat)[1]}
            for name, lat, lon in CITIES
        ],
        "ringsPx": [round(km * scale, 1) for km in RINGS_KM],
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload), encoding="utf-8")
    print(f"wrote {OUT.name}: {len(dots)} dots, {WIDTH}x{height}, "
          f"rings {payload['ringsPx']} px")


if __name__ == "__main__":
    main()
