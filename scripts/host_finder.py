"""
Airola Host Finder
==================
Turns the public Inside Airbnb London dataset into a ranked outreach list
for East London, prioritising hosts with cleanliness problems (hot leads)
and multi-listing hosts (high lifetime value).

HOW TO USE (5 minutes):
1. Download the latest London "listings.csv.gz" (Detailed Listings data) from:
       https://insideairbnb.com/get-the-data/
   Direct link as of June 2026:
       https://data.insideairbnb.com/united-kingdom/england/london/2026-06-19/data/listings.csv.gz
   Save it into this scripts/ folder. No need to unzip.

2. Run:
       python host_finder.py

3. Open the generated file:  airola_outreach_targets.csv
   Sorted best-first. Columns include the listing URL, host name,
   area, cleanliness score and a suggested outreach angle.

Data source: Inside Airbnb (insideairbnb.com), CC BY 4.0.
No dependencies beyond standard Python 3.
"""

import csv
import glob
import gzip
import io
import os
import sys
from datetime import datetime, timedelta

# ---------------- Settings (edit freely) ----------------

# East London boroughs to target (Inside Airbnb 'neighbourhood_cleansed' values)
TARGET_AREAS = {
    "Newham",           # Stratford, Royal Wharf, Canning Town
    "Tower Hamlets",    # Canary Wharf, Bow, Mile End
    "Hackney",          # Hackney Wick
    "Waltham Forest",   # Leyton
    "Greenwich",        # across the river from Royal Wharf
}

# Only listings reviewed in the last N days count as "active"
ACTIVE_WITHIN_DAYS = 240

# Minimum number of reviews (filters out brand-new/dead listings)
MIN_REVIEWS = 3

# Cleanliness score at or below this = "HOT LEAD" (host has a visible cleaning problem)
HOT_CLEANLINESS = 4.7

# ---------------------------------------------------------

def find_input_file():
    candidates = sorted(glob.glob("listings.csv*"))
    if not candidates:
        sys.exit(
            "No listings.csv or listings.csv.gz found in this folder.\n"
            "Download it from https://insideairbnb.com/get-the-data/ (London, Detailed Listings)."
        )
    return candidates[0]

def open_maybe_gzip(path):
    if path.endswith(".gz"):
        return io.TextIOWrapper(gzip.open(path, "rb"), encoding="utf-8", newline="")
    return open(path, encoding="utf-8", newline="")

def parse_float(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None

def parse_int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0

def main():
    path = find_input_file()
    print(f"Reading {path} ...")
    cutoff = datetime.now() - timedelta(days=ACTIVE_WITHIN_DAYS)

    rows_out = []
    total = 0

    with open_maybe_gzip(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            if row.get("neighbourhood_cleansed") not in TARGET_AREAS:
                continue
            if row.get("room_type") != "Entire home/apt":
                continue

            n_reviews = parse_int(row.get("number_of_reviews"))
            if n_reviews < MIN_REVIEWS:
                continue

            last_review = row.get("last_review") or ""
            try:
                if datetime.strptime(last_review, "%Y-%m-%d") < cutoff:
                    continue  # inactive listing
            except ValueError:
                continue  # no parseable review date -> treat as inactive

            clean = parse_float(row.get("review_scores_cleanliness"))
            rating = parse_float(row.get("review_scores_rating"))
            host_listings = parse_int(row.get("calculated_host_listings_count") or row.get("host_listings_count"))
            bedrooms = row.get("bedrooms") or ""

            hot = clean is not None and clean <= HOT_CLEANLINESS
            multi = host_listings >= 2

            # Priority score: hot cleanliness problems first, then multi-unit hosts,
            # then busiest listings (more reviews = more turnovers = more value).
            score = (2000 if hot else 0) + (500 if multi else 0) + min(n_reviews, 300)

            if hot:
                angle = "HOT: guests mention cleanliness. Lead with photo-proof + first-clean guarantee."
            elif multi:
                angle = "Multi-unit host. Lead with reliability across properties + one team angle."
            else:
                angle = "Backup angle: 'keep your cleaner, save us for when they cancel.'"

            rows_out.append({
                "priority": "HOT" if hot else ("MULTI" if multi else "STANDARD"),
                "score": score,
                "listing_url": row.get("listing_url") or f"https://www.airbnb.com/rooms/{row.get('id','')}",
                "listing_name": (row.get("name") or "")[:80],
                "host_name": row.get("host_name") or "",
                "area": row.get("neighbourhood_cleansed") or "",
                "bedrooms": bedrooms,
                "cleanliness_score": clean if clean is not None else "",
                "overall_rating": rating if rating is not None else "",
                "num_reviews": n_reviews,
                "host_total_listings": host_listings,
                "last_review": last_review,
                "suggested_angle": angle,
                "status": "",          # for your pipeline: contacted / replied / quoted / won / lost
                "notes": "",
            })

    rows_out.sort(key=lambda r: -r["score"])
    for r in rows_out:
        del r["score"]

    out = "airola_outreach_targets.csv"
    with open(out, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows_out[0].keys()) if rows_out else ["empty"])
        writer.writeheader()
        writer.writerows(rows_out)

    hot_n = sum(1 for r in rows_out if r["priority"] == "HOT")
    multi_n = sum(1 for r in rows_out if r["priority"] == "MULTI")
    print(f"Scanned {total:,} London listings.")
    print(f"Found {len(rows_out):,} active entire-home listings in your patch:")
    print(f"  HOT leads (cleanliness <= {HOT_CLEANLINESS}): {hot_n}")
    print(f"  Multi-unit hosts: {multi_n}")
    print(f"  Standard: {len(rows_out) - hot_n - multi_n}")
    print(f"Written to {out} (sorted best-first).")

if __name__ == "__main__":
    main()
