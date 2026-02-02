import requests
import sys
import json
from datetime import datetime

class HydrogenDataMeshTester:
    def __init__(self, base_url="https://datamesh-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200, auth_required=False)

    def test_login(self, email="admin@port.om", password="password123"):
        """Test login with demo credentials"""
        success, response = self.run_test(
            "Login with demo credentials",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password},
            auth_required=False
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_auth_me(self):
        """Test getting current user info"""
        return self.run_test("Get current user", "GET", "auth/me", 200)

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        return self.run_test("Dashboard stats", "GET", "dashboard/stats", 200)

    def test_port_vessels(self):
        """Test port vessels endpoints"""
        # Get vessels
        success, vessels = self.run_test("Get port vessels", "GET", "port/vessels", 200)
        
        # Create a test vessel
        test_vessel = {
            "vessel_id": f"TEST-{datetime.now().strftime('%H%M%S')}",
            "vessel_name": "Test Vessel",
            "status": "approaching",
            "berth_number": "B1",
            "eta": "2024-12-20T10:00:00",
            "cargo_type": "turbine_components"
        }
        
        create_success, created_vessel = self.run_test(
            "Create port vessel", "POST", "port/vessels", 200, test_vessel
        )
        
        return success and create_success

    def test_fleet_shipments(self):
        """Test fleet shipments endpoints"""
        # Get shipments
        success, shipments = self.run_test("Get fleet shipments", "GET", "fleet/shipments", 200)
        
        # Create a test shipment
        test_shipment = {
            "shipment_id": f"SHIP-{datetime.now().strftime('%H%M%S')}",
            "vessel_id": "TEST-001",
            "component_type": "turbine_blade",
            "status": "pending",
            "destination_site": "Site A"
        }
        
        create_success, created_shipment = self.run_test(
            "Create fleet shipment", "POST", "fleet/shipments", 200, test_shipment
        )
        
        return success and create_success

    def test_epc_sites(self):
        """Test EPC sites endpoints"""
        # Get sites
        success, sites = self.run_test("Get EPC sites", "GET", "epc/sites", 200)
        
        # Create a test site
        test_site = {
            "site_id": f"SITE-{datetime.now().strftime('%H%M%S')}",
            "site_name": "Test Site",
            "readiness_status": "preparing",
            "expected_component": "turbine_blade"
        }
        
        create_success, created_site = self.run_test(
            "Create EPC site", "POST", "epc/sites", 200, test_site
        )
        
        return success and create_success

    def test_data_catalog(self):
        """Test data catalog endpoints"""
        # Get data products
        success, products = self.run_test("Get data products", "GET", "catalog/products", 200)
        
        # Create a test data product
        test_product = {
            "name": f"Test Product {datetime.now().strftime('%H%M%S')}",
            "domain": "port",
            "description": "Test data product",
            "data_type": "operational",
            "endpoint": "/api/test/data",
            "schema_fields": ["field1", "field2"],
            "update_frequency": "15min",
            "owner_email": "test@example.com",
            "tags": ["test", "demo"]
        }
        
        create_success, created_product = self.run_test(
            "Create data product", "POST", "catalog/products", 200, test_product
        )
        
        return success and create_success

    def test_governance(self):
        """Test governance endpoints"""
        # Get semantic mappings
        mappings_success, mappings = self.run_test("Get semantic mappings", "GET", "governance/mappings", 200)
        
        # Get access policies
        policies_success, policies = self.run_test("Get access policies", "GET", "governance/policies", 200)
        
        return mappings_success and policies_success

    def test_events(self):
        """Test events endpoint"""
        return self.run_test("Get events", "GET", "events", 200)

    def test_registration(self):
        """Test user registration"""
        test_user = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "testpass123",
            "name": "Test User",
            "domain": "port",
            "role": "viewer"
        }
        
        return self.run_test(
            "User registration", "POST", "auth/register", 200, test_user, auth_required=False
        )

    # ============================================
    # NEW DATA MESH ENHANCEMENT API TESTS
    # ============================================

    def test_domain_journey_apis(self):
        """Test Domain Ownership APIs - Domain Journey"""
        print("\n🔍 Testing Domain Journey APIs...")
        
        # Test GET /api/domains/journey
        journeys_success, journeys = self.run_test(
            "Get domain journeys", "GET", "domains/journey", 200
        )
        
        # Test GET /api/domains/journey/port
        port_journey_success, port_journey = self.run_test(
            "Get port domain journey", "GET", "domains/journey/port", 200
        )
        
        return journeys_success and port_journey_success

    def test_data_contracts_apis(self):
        """Test Data as a Product APIs - Data Contracts"""
        print("\n🔍 Testing Data Contracts APIs...")
        
        # Test GET /api/contracts
        contracts_success, contracts = self.run_test(
            "Get data contracts", "GET", "contracts", 200
        )
        
        # Test POST /api/contracts
        test_contract = {
            "data_product_id": f"product-{datetime.now().strftime('%H%M%S')}",
            "version": "1.0",
            "owner": "admin@port.om",
            "description": "Test data contract for hydrogen vessel tracking",
            "schema_definition": {
                "vessel_id": "string",
                "status": "string",
                "timestamp": "datetime"
            },
            "quality_sla": {
                "availability": 99.9,
                "freshness_minutes": 15,
                "accuracy_threshold": 95.0
            },
            "terms_of_use": "Internal use only for hydrogen logistics",
            "update_frequency": "15min",
            "retention_period": "2 years"
        }
        
        create_contract_success, created_contract = self.run_test(
            "Create data contract", "POST", "contracts", 200, test_contract
        )
        
        return contracts_success and create_contract_success

    def test_quality_metrics_apis(self):
        """Test Data as a Product APIs - Quality Metrics"""
        print("\n🔍 Testing Quality Metrics APIs...")
        
        # Test GET /api/quality/metrics
        metrics_success, metrics = self.run_test(
            "Get quality metrics", "GET", "quality/metrics", 200
        )
        
        # Test POST /api/quality/metrics
        test_metric = {
            "data_product_id": f"product-{datetime.now().strftime('%H%M%S')}",
            "metric_type": "availability",
            "value": 99.5,
            "threshold": 99.0,
            "status": "passing"
        }
        
        create_metric_success, created_metric = self.run_test(
            "Create quality metric", "POST", "quality/metrics", 200, test_metric
        )
        
        return metrics_success and create_metric_success

    def test_data_lineage_apis(self):
        """Test Data as a Product APIs - Data Lineage"""
        print("\n🔍 Testing Data Lineage APIs...")
        
        # Test GET /api/lineage
        lineage_success, lineage = self.run_test(
            "Get data lineage", "GET", "lineage", 200
        )
        
        # Test POST /api/lineage
        test_lineage = {
            "source_product_id": f"source-{datetime.now().strftime('%H%M%S')}",
            "target_product_id": f"target-{datetime.now().strftime('%H%M%S')}",
            "relationship_type": "transformation",
            "transformation_description": "Vessel data aggregated into fleet summary"
        }
        
        create_lineage_success, created_lineage = self.run_test(
            "Create data lineage", "POST", "lineage", 200, test_lineage
        )
        
        return lineage_success and create_lineage_success

    def test_platform_capabilities_apis(self):
        """Test Self-Serve Platform APIs - Platform Capabilities"""
        print("\n🔍 Testing Platform Capabilities APIs...")
        
        # Test GET /api/platform/capabilities
        capabilities_success, capabilities = self.run_test(
            "Get platform capabilities", "GET", "platform/capabilities", 200
        )
        
        return capabilities_success

    def test_platform_stats_apis(self):
        """Test Self-Serve Platform APIs - Platform Stats"""
        print("\n🔍 Testing Platform Stats APIs...")
        
        # Test GET /api/platform/stats
        stats_success, stats = self.run_test(
            "Get platform stats", "GET", "platform/stats", 200
        )
        
        return stats_success

    def test_governance_compliance_apis(self):
        """Test Federated Governance APIs - Compliance Rules"""
        print("\n🔍 Testing Governance Compliance APIs...")
        
        # Test GET /api/governance/compliance
        compliance_success, compliance = self.run_test(
            "Get compliance rules", "GET", "governance/compliance", 200
        )
        
        # Test POST /api/governance/compliance (admin only)
        test_compliance_rule = {
            "rule_name": f"Test Rule {datetime.now().strftime('%H%M%S')}",
            "standard": "ISO 27001",
            "description": "Test compliance rule for data security",
            "severity": "high",
            "applicable_domains": ["port", "fleet"],
            "validation_logic": "data.encryption == 'AES-256'",
            "status": "active"
        }
        
        create_compliance_success, created_compliance = self.run_test(
            "Create compliance rule", "POST", "governance/compliance", 200, test_compliance_rule
        )
        
        return compliance_success and create_compliance_success

    def test_governance_standards_apis(self):
        """Test Federated Governance APIs - Interoperability Standards"""
        print("\n🔍 Testing Governance Standards APIs...")
        
        # Test GET /api/governance/standards
        standards_success, standards = self.run_test(
            "Get interoperability standards", "GET", "governance/standards", 200
        )
        
        # Test POST /api/governance/standards (admin only)
        test_standard = {
            "name": f"Test Standard {datetime.now().strftime('%H%M%S')}",
            "version": "1.0",
            "description": "Test interoperability standard for hydrogen data exchange",
            "supported_domains": ["port", "fleet", "epc"],
            "compliance_level": "certified",
            "certification_date": "2024-12-20"
        }
        
        create_standard_success, created_standard = self.run_test(
            "Create interoperability standard", "POST", "governance/standards", 200, test_standard
        )
        
        return standards_success and create_standard_success

    def test_governance_dashboard_apis(self):
        """Test Federated Governance APIs - Governance Dashboard"""
        print("\n🔍 Testing Governance Dashboard APIs...")
        
        # Test GET /api/governance/dashboard
        dashboard_success, dashboard = self.run_test(
            "Get governance dashboard", "GET", "governance/dashboard", 200
        )
        
        return dashboard_success

def main():
    print("🚀 Starting Oman National Hydrogen Data Mesh API Tests")
    print("=" * 60)
    
    tester = HydrogenDataMeshTester()
    
    # Test sequence
    tests = [
        ("Root API", tester.test_root_endpoint),
        ("User Registration", tester.test_registration),
        ("User Login", tester.test_login),
        ("Auth Me", tester.test_auth_me),
        ("Dashboard Stats", tester.test_dashboard_stats),
        ("Port Vessels", tester.test_port_vessels),
        ("Fleet Shipments", tester.test_fleet_shipments),
        ("EPC Sites", tester.test_epc_sites),
        ("Data Catalog", tester.test_data_catalog),
        ("Governance", tester.test_governance),
        ("Events", tester.test_events),
        # New Data Mesh Enhancement Tests
        ("Domain Journey APIs", tester.test_domain_journey_apis),
        ("Data Contracts APIs", tester.test_data_contracts_apis),
        ("Quality Metrics APIs", tester.test_quality_metrics_apis),
        ("Data Lineage APIs", tester.test_data_lineage_apis),
        ("Platform Capabilities APIs", tester.test_platform_capabilities_apis),
        ("Platform Stats APIs", tester.test_platform_stats_apis),
        ("Governance Compliance APIs", tester.test_governance_compliance_apis),
        ("Governance Standards APIs", tester.test_governance_standards_apis),
        ("Governance Dashboard APIs", tester.test_governance_dashboard_apis)
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test {test_name} failed with exception: {str(e)}")
            tester.failed_tests.append({
                'test': test_name,
                'error': str(e)
            })
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"📊 Test Summary:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())