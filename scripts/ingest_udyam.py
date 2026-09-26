#!/usr/bin/env python3
"""
SYMBIO CLI: Ingest UDYAM / MSME Dataset
Usage:
  python scripts/ingest_udyam.py [--limit 500] [--offset 0] [--state Maharashtra] [--dry-run]
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.ingestion.ogd.udyam import UdyamMSMEIngestor

def main():
    parser = argparse.ArgumentParser(description="Ingest UDYAM MSME dataset into SYMBIO")
    parser.add_argument("--limit", type=int, default=100, help="Max records to fetch")
    parser.add_argument("--offset", type=int, default=0, help="Offset for pagination")
    parser.add_argument("--state", type=str, default="Maharashtra", help="State filter")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode without writing to DB")

    args = parser.parse_args()

    print(f"\n==================================================")
    print(f"  SYMBIO INGESTION: UDYAM / MSME Data")
    print(f"  Mode: {'DRY RUN' if args.dry_run else 'PERSIST'}")
    print(f"  Filter State: {args.state} | Limit: {args.limit} | Offset: {args.offset}")
    print(f"==================================================\n")

    ingestor = UdyamMSMEIngestor(dry_run=args.dry_run)
    result = ingestor.run(limit=args.limit, offset=args.offset, state=args.state)

    print("\n--- Ingestion Run Summary ---")
    print(json.dumps(result, indent=2))

    if result["status"] == "FAILED":
        sys.exit(1)

if __name__ == "__main__":
    main()
