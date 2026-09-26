#!/usr/bin/env python3
"""
SYMBIO CLI: Ingest OpenStreetMap Industrial Facilities & Areas
Usage:
  python scripts/ingest_osm.py [--limit 100] [--state Maharashtra] [--city Pune] [--dry-run]
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.ingestion.pipelines.facilities import FacilityPipeline

def main():
    parser = argparse.ArgumentParser(description="Ingest OSM Industrial Nodes into SYMBIO")
    parser.add_argument("--limit", type=int, default=100, help="Max nodes to fetch")
    parser.add_argument("--state", type=str, default="Maharashtra", help="State filter")
    parser.add_argument("--city", type=str, default=None, help="City filter")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode")

    args = parser.parse_args()

    print(f"\n==================================================")
    print(f"  SYMBIO INGESTION: OpenStreetMap Industrial Facilities")
    print(f"  Classification: EXTERNALLY_DISCOVERED")
    print(f"  Mode: {'DRY RUN' if args.dry_run else 'PERSIST'}")
    print(f"==================================================\n")

    pipeline = FacilityPipeline(dry_run=args.dry_run)
    result = pipeline.run(city=args.city, state=args.state, limit=args.limit)

    print("\n--- Ingestion Run Summary ---")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
