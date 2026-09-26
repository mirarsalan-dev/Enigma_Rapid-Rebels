#!/usr/bin/env python3
"""
SYMBIO CLI: Run All Ingestion Pipelines
Orchestrates MCA, UDYAM, CPCB, and OSM industrial data streams.
Supports --dry-run and state filters.
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.ingestion.scheduler import IngestionScheduler

def main():
    parser = argparse.ArgumentParser(description="Run complete SYMBIO industrial data ingestion")
    parser.add_argument("--state", type=str, default="Maharashtra", help="Target state filter")
    parser.add_argument("--dry-run", action="store_true", help="Perform dry run without persisting to MongoDB")

    args = parser.parse_args()

    print(f"\n========================================================")
    print(f"  SYMBIO GLOBAL INDUSTRIAL INGESTION ENGINE")
    print(f"  Target State: {args.state}")
    print(f"  Mode: {'DRY RUN' if args.dry_run else 'PERSIST TO DATABASE'}")
    print(f"========================================================\n")

    scheduler = IngestionScheduler()
    result = scheduler.trigger_all(state=args.state, dry_run=args.dry_run)

    print("\n================ INGESTION COMPLETE ================")
    print(f"Run ID:            {result['run_id']}")
    print(f"Status:            {result['status']}")
    print(f"Records Fetched:   {result['records_fetched']}")
    print(f"Records Inserted:  {result['records_inserted']}")
    print(f"Records Updated:   {result['records_updated']}")
    print(f"Records Rejected:  {result['records_rejected']}")
    print("====================================================\n")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
