import requests
import sys
import json
from datetime import datetime

class HydrogenDataMeshTester:
    def __init__(self, base_url="https://product-schema-hub.preview.emergentagent.com"):
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

    def test_enhanced_data_contracts_apis(self):
        """Test Enhanced Data Contracts API endpoints with comprehensive structure"""
        print("\n🔍 Testing Enhanced Data Contracts APIs...")
        
        # Test GET /api/contracts - Should return 3 enhanced contracts
        all_contracts_success, all_contracts = self.run_test(
            "Get all enhanced contracts", "GET", "contracts", 200
        )
        
        # Verify we have 3 contracts as expected
        if all_contracts_success and isinstance(all_contracts, list):
            print(f"   ✅ Retrieved {len(all_contracts)} contracts")
            if len(all_contracts) >= 3:
                print(f"   ✅ Expected 3+ contracts, found {len(all_contracts)}")
            else:
                print(f"   ⚠️  Expected 3+ contracts, only found {len(all_contracts)}")
            
            # Verify enhanced contract structure
            if len(all_contracts) > 0:
                contract = all_contracts[0]
                required_sections = [
                    'contract_name', 'version', 'status', 'provider', 'dataset', 
                    'schema_fields', 'quality', 'slo', 'terms', 'consumers'
                ]
                missing_sections = [section for section in required_sections if section not in contract]
                if missing_sections:
                    print(f"   ⚠️  Missing contract sections: {missing_sections}")
                else:
                    print(f"   ✅ Contract structure verified - all required sections present")
                
                # Verify provider section
                if 'provider' in contract and isinstance(contract['provider'], dict):
                    provider_fields = ['name', 'email', 'team', 'domain', 'output_port']
                    missing_provider = [f for f in provider_fields if f not in contract['provider']]
                    if missing_provider:
                        print(f"   ⚠️  Missing provider fields: {missing_provider}")
                    else:
                        print(f"   ✅ Provider section complete")
                
                # Verify schema_fields structure
                if 'schema_fields' in contract and isinstance(contract['schema_fields'], list) and len(contract['schema_fields']) > 0:
                    field = contract['schema_fields'][0]
                    schema_field_attrs = ['name', 'data_type', 'description', 'business_term', 'required', 'nullable', 'unique', 'sensitive', 'is_pii', 'classification']
                    missing_attrs = [attr for attr in schema_field_attrs if attr not in field]
                    if missing_attrs:
                        print(f"   ⚠️  Missing schema field attributes: {missing_attrs}")
                    else:
                        print(f"   ✅ Schema fields structure complete")
        
        # Test GET /api/contracts/dc1 - Get specific contract by ID
        specific_contract_success, specific_contract = self.run_test(
            "Get specific contract (dc1)", "GET", "contracts/dc1", 200
        )
        
        # Verify specific contract structure
        if specific_contract_success and isinstance(specific_contract, dict):
            print(f"   ✅ Retrieved specific contract: {specific_contract.get('contract_name', 'Unknown')}")
            
            # Verify all enhanced sections are present
            enhanced_sections = ['provider', 'dataset', 'schema_fields', 'quality', 'slo', 'billing', 'terms', 'consumers']
            for section in enhanced_sections:
                if section in specific_contract:
                    print(f"   ✅ {section} section present")
                else:
                    print(f"   ⚠️  {section} section missing")
        
        # Test GET /api/contracts/dc1/yaml - Get contract in YAML format
        yaml_contract_success, yaml_contract = self.run_test(
            "Get contract YAML format (dc1)", "GET", "contracts/dc1/yaml", 200
        )
        
        # Verify YAML response structure
        if yaml_contract_success and isinstance(yaml_contract, dict):
            if 'yaml' in yaml_contract and 'contract_id' in yaml_contract:
                print(f"   ✅ YAML export successful for contract: {yaml_contract.get('contract_id')}")
                yaml_content = yaml_contract.get('yaml', '')
                if 'dataContractSpecification' in yaml_content:
                    print(f"   ✅ YAML follows Data Contract Specification format")
                else:
                    print(f"   ⚠️  YAML missing Data Contract Specification header")
            else:
                print(f"   ⚠️  YAML response missing required fields")
        
        # Test GET /api/contracts/stats/summary - Get contract statistics
        stats_success, stats = self.run_test(
            "Get contract statistics summary", "GET", "contracts/stats/summary", 200
        )
        
        # Verify stats structure
        if stats_success and isinstance(stats, dict):
            expected_stats = ['total_contracts', 'by_status', 'by_domain', 'total_consumers', 'avg_schema_fields', 'with_billing']
            missing_stats = [stat for stat in expected_stats if stat not in stats]
            if missing_stats:
                print(f"   ⚠️  Missing stats: {missing_stats}")
            else:
                print(f"   ✅ Stats structure complete - Total contracts: {stats.get('total_contracts', 0)}")
                print(f"   ✅ Consumers: {stats.get('total_consumers', 0)}, Avg fields: {stats.get('avg_schema_fields', 0)}")
                print(f"   ✅ With billing: {stats.get('with_billing', 0)}")
        
        # Test PUT /api/contracts/dc1 - Update a contract
        if specific_contract_success and isinstance(specific_contract, dict):
            # Create updated contract data
            updated_contract = specific_contract.copy()
            updated_contract['version'] = '1.1'
            updated_contract['status'] = 'active'
            
            # Add a new consumer to test consumer functionality
            new_consumer = {
                "name": "Test Consumer",
                "team": "Testing Team",
                "domain": "test",
                "email": "test@example.com",
                "use_cases": ["testing", "validation"],
                "approved_date": "2024-12-20",
                "access_level": "read"
            }
            
            if 'consumers' not in updated_contract:
                updated_contract['consumers'] = []
            updated_contract['consumers'].append(new_consumer)
            
            update_success, update_response = self.run_test(
                "Update contract (dc1)", "PUT", "contracts/dc1", 200, updated_contract
            )
            
            if update_success:
                print(f"   ✅ Contract update successful")
            
            return (all_contracts_success and specific_contract_success and 
                   yaml_contract_success and stats_success and update_success)
        
        return (all_contracts_success and specific_contract_success and 
               yaml_contract_success and stats_success)

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

    # ============================================
    # DATA PRODUCT CANVAS API TESTS
    # ============================================

    def test_canvas_apis(self):
        """Test Data Product Canvas APIs"""
        print("\n🔍 Testing Data Product Canvas APIs...")
        
        # Test GET /api/canvas - Get all data product canvases
        all_canvases_success, all_canvases = self.run_test(
            "Get all data product canvases", "GET", "canvas", 200
        )
        
        # Verify response structure for all canvases
        if all_canvases_success and isinstance(all_canvases, list):
            print(f"   ✅ Retrieved {len(all_canvases)} canvases")
            if len(all_canvases) > 0:
                canvas = all_canvases[0]
                required_fields = ['id', 'name', 'domain', 'owner_name', 'version', 'classification', 
                                 'consumers', 'output_ports', 'input_ports', 'data_model', 
                                 'quality_checks', 'sla', 'security', 'architecture', 'ubiquitous_language']
                missing_fields = [field for field in required_fields if field not in canvas]
                if missing_fields:
                    print(f"   ⚠️  Missing fields in canvas: {missing_fields}")
                else:
                    print(f"   ✅ Canvas structure verified - all required fields present")
        
        # Test GET /api/canvas/stats - Get canvas statistics
        stats_success, stats = self.run_test(
            "Get canvas statistics", "GET", "canvas/stats", 200
        )
        
        # Verify stats structure
        if stats_success and isinstance(stats, dict):
            expected_stats = ['total', 'by_status', 'by_classification', 'by_domain']
            missing_stats = [stat for stat in expected_stats if stat not in stats]
            if missing_stats:
                print(f"   ⚠️  Missing stats: {missing_stats}")
            else:
                print(f"   ✅ Stats structure verified - total: {stats.get('total', 0)}")
        
        # Test GET /api/canvas/{canvas_id} - Get specific canvas (use "canvas1")
        specific_canvas_success, specific_canvas = self.run_test(
            "Get specific canvas (canvas1)", "GET", "canvas/canvas1", 200
        )
        
        # Verify specific canvas structure
        if specific_canvas_success and isinstance(specific_canvas, dict):
            if specific_canvas.get('name') == 'Vessel Arrival Status':
                print(f"   ✅ Retrieved correct canvas: {specific_canvas.get('name')}")
            else:
                print(f"   ⚠️  Expected 'Vessel Arrival Status', got: {specific_canvas.get('name')}")
        
        # Test GET /api/canvas/domain/port - Get canvases by domain
        domain_canvases_success, domain_canvases = self.run_test(
            "Get canvases by domain (port)", "GET", "canvas/domain/port", 200
        )
        
        # Verify domain filtering
        if domain_canvases_success and isinstance(domain_canvases, list):
            print(f"   ✅ Retrieved {len(domain_canvases)} canvases for port domain")
            if len(domain_canvases) > 0:
                # Check if all returned canvases are from port domain
                non_port_canvases = [c for c in domain_canvases if c.get('domain') != 'port']
                if non_port_canvases:
                    print(f"   ⚠️  Found {len(non_port_canvases)} non-port canvases in port domain results")
                else:
                    print(f"   ✅ All canvases correctly filtered for port domain")
        
        return all_canvases_success and stats_success and specific_canvas_success and domain_canvases_success

    def test_canvas_crud_operations(self):
        """Test Canvas CRUD operations"""
        print("\n🔍 Testing Canvas CRUD Operations...")
        
        # Create a test canvas
        test_canvas = {
            "name": f"Test Canvas {datetime.now().strftime('%H%M%S')}",
            "domain": "port",
            "owner_name": "Test Owner",
            "owner_email": "test@port.om",
            "date": "2024-12-20",
            "version": "1.0",
            "description": "Test data product canvas for API testing",
            "classification": "source-aligned",
            "consumers": [
                {
                    "name": "Fleet Management",
                    "domain": "fleet",
                    "role": "data_consumer",
                    "use_cases": ["vessel_tracking", "cargo_monitoring"]
                }
            ],
            "use_cases": [
                {
                    "name": "Vessel Tracking",
                    "description": "Track vessel arrivals and departures",
                    "business_objective": "Improve port efficiency",
                    "success_metrics": ["reduced_wait_time", "increased_throughput"]
                }
            ],
            "output_ports": [
                {
                    "format": "REST API",
                    "protocol": "HTTPS",
                    "location": "/api/vessels/status",
                    "description": "Real-time vessel status updates"
                }
            ],
            "terms": "Internal use only for hydrogen logistics operations",
            "data_model": [
                {
                    "name": "vessel_id",
                    "data_type": "string",
                    "description": "Unique vessel identifier",
                    "constraints": ["not_null", "unique"],
                    "is_pii": False,
                    "is_business_key": True,
                    "is_join_key": True
                }
            ],
            "quality_checks": [
                {
                    "check_name": "vessel_id_uniqueness",
                    "check_type": "uniqueness",
                    "expression": "COUNT(DISTINCT vessel_id) = COUNT(*)",
                    "threshold": 1.0,
                    "description": "Ensure all vessel IDs are unique"
                }
            ],
            "sla": {
                "availability": "99.9%",
                "support_hours": "24/7",
                "retention_period": "2 years",
                "backup_frequency": "daily",
                "response_time": "< 100ms"
            },
            "security": {
                "access_level": "internal",
                "approval_required": False,
                "allowed_roles": ["port_operator", "fleet_manager"],
                "allowed_domains": ["port", "fleet"],
                "pii_handling": "none"
            },
            "input_ports": [
                {
                    "source_type": "operational_system",
                    "source_name": "Port Management System",
                    "source_domain": "port",
                    "format": "database",
                    "protocol": "SQL",
                    "description": "Live vessel data from port systems"
                }
            ],
            "architecture": {
                "processing_type": "streaming",
                "framework": "Apache Kafka",
                "storage_type": "tables",
                "query_engine": "SQL",
                "transformation_steps": ["data_validation", "format_standardization", "enrichment"],
                "scheduling_tool": "Airflow",
                "monitoring_tool": "Prometheus",
                "estimated_cost": "$500/month"
            },
            "ubiquitous_language": {
                "vessel": "A ship or boat used for transportation",
                "berth": "A designated docking space in the port",
                "eta": "Estimated Time of Arrival"
            },
            "status": "draft",
            "follow_up_actions": ["review_with_stakeholders", "finalize_sla"],
            "follow_up_date": "2024-12-25"
        }
        
        # Test POST /api/canvas - Create canvas
        create_success, created_canvas = self.run_test(
            "Create data product canvas", "POST", "canvas", 200, test_canvas
        )
        
        canvas_id = None
        if create_success and isinstance(created_canvas, dict):
            canvas_id = created_canvas.get('id')
            print(f"   ✅ Canvas created with ID: {canvas_id}")
        
        # Test PUT /api/canvas/{canvas_id} - Update canvas (if we have an ID)
        update_success = True
        if canvas_id:
            updated_canvas = test_canvas.copy()
            updated_canvas['version'] = '1.1'
            updated_canvas['description'] = 'Updated test canvas description'
            
            update_success, update_response = self.run_test(
                f"Update canvas {canvas_id}", "PUT", f"canvas/{canvas_id}", 200, updated_canvas
            )
        
        return create_success and update_success

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
        ("Governance Dashboard APIs", tester.test_governance_dashboard_apis),
        # New Data Product Canvas Tests
        ("Canvas APIs", tester.test_canvas_apis),
        ("Canvas CRUD Operations", tester.test_canvas_crud_operations)
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