#!/usr/bin/env python3
"""
SYMBIO CLI: Ingest CPCB Hazardous & Other Waste Reference Inventories
Usage:
  python scripts/ingest_cpcb.py [--limit 100] [--state Maharashtra] [--dry-run]
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.ingestion.cpcb.hazardous_waste import CPCBHazardousWasteIngestor

def main():
    parser = argparse.ArgumentParser(description="Ingest CPCB Hazardous Waste Inventory into SYMBIO")
    parser.add_argument("--limit", type=int, default=100, help="Max records to fetch")
    parser.add_argument("--offset", type=int, default=0, help="Pagination offset")
    parser.add_argument("--state", type=str, default=None, help="State filter")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode")

    args = parser.parse_args()

    print(f"\n==================================================")
    print(f"  SYMBIO INGESTION: CPCB Waste Inventory")
    print(f"  Classification: REFERENCE DATA (Annual Report)")
    print(f"  Mode: {'DRY RUN' if args.dry_run else 'PERSIST'}")
    print(f"==================================================\n")

    ingestor = CPCBHazardousWasteIngestor(dry_run=args.dry_run)
    result = ingestor.run(limit=args.limit, offset=args.offset, state=args.state)

    print("\n--- Ingestion Run Summary ---")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
