"""
SYMBIO Ingestion Engine Unit & Integration Test Suite
Validates unit conversion, company normalization, deduplication,
coordinate bounds checking, provenance builder, geocoding fallbacks, and dry-run flows.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.ingestion.normalizers.units import normalize_quantity_and_unit
from backend.app.ingestion.normalizers.company import normalize_company_name
from backend.app.ingestion.normalizers.location import validate_coordinates, to_geojson_point
from backend.app.ingestion.normalizers.material import normalize_material_name
from backend.app.ingestion.deduplication.companies import CompanyDeduplicator
from backend.app.ingestion.provenance.builder import ProvenanceBuilder
from backend.app.ingestion.osm.geocoder import NominatimGeocoder
from backend.app.ingestion.routing.osrm import OSRMRoutingClient
from backend.app.ingestion.ogd.company_master import MCACompanyIngestor
from backend.app.ingestion.pipelines.waste import WastePipeline

class TestSymbioIngestion(unittest.TestCase):

    def test_unit_normalization(self):
        """1000 kg must normalize strictly to 1.0 TONNE"""
        result = normalize_quantity_and_unit(1000, "kg")
        self.assertEqual(result["normalized_value"], 1.0)
        self.assertEqual(result["normalized_unit"], "TONNE")
        self.assertEqual(result["unit_category"], "MASS")
        self.assertEqual(result["value"], 1000.0)

        # 5000 kg -> 5 TONNE
        res5k = normalize_quantity_and_unit(5000, "kg")
        self.assertEqual(res5k["normalized_value"], 5.0)
        self.assertEqual(res5k["normalized_unit"], "TONNE")

        # Incompatible or negative quantities must raise ValueError
        with self.assertRaises(ValueError):
            normalize_quantity_and_unit(-10, "kg")

        with self.assertRaises(ValueError):
            normalize_quantity_and_unit(100, "invalid_unit_xyz")

    def test_location_coordinate_validation(self):
        """Invalid latitudes and longitudes must be rejected without fabricating fake coordinates"""
        # Valid Mumbai coordinates
        valid = validate_coordinates(19.0760, 72.8777)
        self.assertIsNotNone(valid)
        self.assertEqual(valid, (19.076, 72.8777))

        # Lat > 90 rejected
        self.assertIsNone(validate_coordinates(91.5, 72.8777))

        # Lat < -90 rejected
        self.assertIsNone(validate_coordinates(-95.0, 72.8777))

        # Lon > 180 rejected
        self.assertIsNone(validate_coordinates(19.0760, 185.0))

        # None / Null coordinates
        self.assertIsNone(validate_coordinates(None, 72.8777))
        self.assertIsNone(to_geojson_point(None, None))

    def test_company_normalization(self):
        """Legal suffixes must be cleanly removed while preserving distinctive brand names"""
        norm, orig = normalize_company_name("TATA METALIKS MAHARASHTRA PRIVATE LIMITED")
        self.assertEqual(norm, "TATA METALIKS MAHARASHTRA")
        self.assertEqual(orig, "TATA METALIKS MAHARASHTRA PRIVATE LIMITED")

        norm2, _ = normalize_company_name("Apex Steel Works Pvt. Ltd.")
        self.assertEqual(norm2, "APEX STEEL WORKS")

        norm3, _ = normalize_company_name("Mahindra & Mahindra Ltd")
        self.assertTrue("MAHINDRA & MAHINDRA" in norm3)

    def test_company_deduplication(self):
        """Exact CIN must update existing record; uncertain matches must flag duplicate_candidate=True"""
        dedup = CompanyDeduplicator()
        cin1 = "U27100MH2008PTC183451"
        dedup.register("COMP_1", cin1, "TATA METALIKS MAHARASHTRA", "Maharashtra", "Mumbai")

        # Same CIN: Exact match with confidence 1.0, not candidate
        matched_id, conf, is_candidate = dedup.find_match(cin1, "TATA METALIKS", "Maharashtra", "Mumbai")
        self.assertEqual(matched_id, "COMP_1")
        self.assertEqual(conf, 1.0)
        self.assertFalse(is_candidate)

        # Same name in different city without CIN: flag as candidate, do NOT auto-merge
        matched_id_2, conf_2, is_cand_2 = dedup.find_match(None, "TATA METALIKS MAHARASHTRA", "Gujarat", "Ahmedabad")
        self.assertEqual(matched_id_2, "COMP_1")
        self.assertTrue(is_cand_2)
        self.assertEqual(conf_2, 0.50)

    def test_missing_company_name_validation(self):
        """MCA Ingestor must reject records with empty or whitespace-only company name"""
        ingestor = MCACompanyIngestor(dry_run=True)
        valid, reason = ingestor.validate({"company_name": "", "cin": "U12345"})
        self.assertFalse(valid)
        self.assertIn("Missing company name", reason)

        valid_ok, reason_ok = ingestor.validate({"company_name": "Valid Steel Corp", "cin": "U12345"})
        self.assertTrue(valid_ok)
        self.assertIsNone(reason_ok)

    def test_provenance_builder_rules(self):
        """Provenance must validate status and freshness classes strictly"""
        prov = ProvenanceBuilder.build(
            source_name="CPCB",
            source_record_id="CPCB-MH-01",
            status="OBSERVED",
            freshness="HISTORICAL"
        )
        self.assertEqual(prov["status"], "OBSERVED")
        self.assertEqual(prov["freshness"], "HISTORICAL")

        # Invalid status must raise ValueError
        with self.assertRaises(ValueError):
            ProvenanceBuilder.build(source_name="TEST", status="INVALID_STATUS")

        # Invalid freshness must raise ValueError
        with self.assertRaises(ValueError):
            ProvenanceBuilder.build(source_name="TEST", freshness="INVALID_FRESHNESS")

    def test_geocoder_no_fake_coordinates(self):
        """When geocoding fails or input is empty, no coordinates must be fabricated"""
        geocoder = NominatimGeocoder()
        res = geocoder.geocode("")
        self.assertEqual(res["geocoding_status"], "FAILED")
        self.assertIsNone(res["latitude"])
        self.assertIsNone(res["longitude"])
        self.assertIsNone(res["geojson"])

    def test_osrm_routing_client(self):
        """OSRM routing client must return valid distance and duration without LLM involvement"""
        client = OSRMRoutingClient()
        # Route from Mumbai (19.0760, 72.8777) to Pune (18.5204, 73.8567)
        route = client.get_route(19.0760, 72.8777, 18.5204, 73.8567)
        self.assertIn(route["status"], ["SUCCESS", "CALIBRATED_FALLBACK"])
        self.assertGreater(route["distance_km"], 100.0) # ~120-150 km between Mumbai and Pune
        self.assertGreater(route["duration_minutes"], 60.0)
        self.assertIn("geometry", route)

    def test_dry_run_mode(self):
        """Ingestion dry-run must compute statistics without failing or writing records"""
        ingestor = MCACompanyIngestor(dry_run=True)
        summary = ingestor.run(limit=5)
        self.assertEqual(summary["status"], "SUCCESS")
        self.assertGreater(summary["records_fetched"], 0)
        self.assertGreater(summary["records_inserted"], 0)
        self.assertEqual(summary["records_rejected"], 0)

    def test_live_waste_pipeline(self):
        """Company-submitted waste listing must have USER_PROVIDED status and LIVE freshness"""
        pipeline = WastePipeline(dry_run=True)
        listing = pipeline.process_waste_listing({
            "material_name": "Blast Furnace Slag",
            "quantity": 2500,
            "unit": "kg",
            "company_id": "comp_test_1"
        })
        self.assertEqual(listing["freshness"], "LIVE")
        self.assertEqual(listing["verification_status"], "USER_PROVIDED")
        self.assertEqual(listing["normalized_quantity"], 2.5) # 2500 kg = 2.5 TONNE
        self.assertEqual(listing["normalized_unit"], "TONNE")
        self.assertEqual(listing["data_sources"][0]["status"], "USER_PROVIDED")

if __name__ == "__main__":
    unittest.main()
