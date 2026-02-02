import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    print("Seeding database...")
    
    await db.users.delete_many({})
    await db.port_vessels.delete_many({})
    await db.fleet_shipments.delete_many({})
    await db.epc_sites.delete_many({})
    await db.data_catalog.delete_many({})
    await db.semantic_mappings.delete_many({})
    await db.access_policies.delete_many({})
    await db.event_logs.delete_many({})
    await db.logistics_routes.delete_many({})
    await db.logistics_permits.delete_many({})
    await db.weather_forecasts.delete_many({})
    await db.assembly_areas.delete_many({})
    await db.data_product_canvases.delete_many({})
    
    users = [
        {
            "id": "user1",
            "email": "admin@asyad.om",
            "password": pwd_context.hash("asyad2025"),
            "name": "Asyad Operations Director",
            "domain": "logistics",
            "role": "admin",
            "created_at": "2025-01-15T10:00:00Z"
        },
        {
            "id": "user2",
            "email": "port@asyad.om",
            "password": pwd_context.hash("password123"),
            "name": "Asyad Port Operations",
            "domain": "port",
            "role": "editor",
            "created_at": "2025-01-15T10:00:00Z"
        },
        {
            "id": "user3",
            "email": "transport@asyad.om",
            "password": pwd_context.hash("password123"),
            "name": "Asyad Heavy Transport",
            "domain": "fleet",
            "role": "editor",
            "created_at": "2025-01-15T10:00:00Z"
        },
        {
            "id": "user4",
            "email": "epc@hydrom.om",
            "password": pwd_context.hash("password123"),
            "name": "Hydrom EPC Coordinator",
            "domain": "epc",
            "role": "editor",
            "created_at": "2025-01-15T10:00:00Z"
        }
    ]
    await db.users.insert_many(users)
    print(f"Created {len(users)} users")
    
    # ============================================
    # WIND TURBINE VESSELS - Current at Ports
    # ============================================
    vessels = [
        {
            "id": "v1",
            "vessel_id": "DQM-WT001",
            "vessel_name": "Wind Champion",
            "status": "unloading",
            "berth_number": "B-Heavy-01",
            "eta": "2025-07-15T06:00:00Z",
            "cargo_type": "Turbine Blades (78m)",
            "cargo_quantity": 24,
            "origin_port": "Shanghai, China",
            "port": "Port of Duqm",
            "last_updated": "2025-07-15T08:00:00Z"
        },
        {
            "id": "v2",
            "vessel_id": "SHR-WT002",
            "vessel_name": "Green Transporter",
            "status": "approaching",
            "berth_number": "B-15",
            "eta": "2025-07-16T14:00:00Z",
            "cargo_type": "Nacelles (6MW)",
            "cargo_quantity": 8,
            "origin_port": "Rotterdam, Netherlands",
            "port": "SOHAR Port",
            "last_updated": "2025-07-15T10:00:00Z"
        },
        {
            "id": "v3",
            "vessel_id": "SLL-WT003",
            "vessel_name": "Vestas Voyager",
            "status": "berthed",
            "berth_number": "B-Heavy-02",
            "eta": "2025-07-14T20:00:00Z",
            "cargo_type": "Tower Sections",
            "cargo_quantity": 36,
            "origin_port": "Busan, South Korea",
            "port": "Port of Salalah",
            "last_updated": "2025-07-15T09:00:00Z"
        },
        {
            "id": "v4",
            "vessel_id": "DQM-WT004",
            "vessel_name": "Siemens Star",
            "status": "scheduled",
            "berth_number": "TBD",
            "eta": "2025-07-20T08:00:00Z",
            "cargo_type": "Generator Units",
            "cargo_quantity": 12,
            "origin_port": "Hamburg, Germany",
            "port": "Port of Duqm",
            "last_updated": "2025-07-15T07:00:00Z"
        }
    ]
    await db.port_vessels.insert_many(vessels)
    print(f"Created {len(vessels)} vessels")
    
    # ============================================
    # WIND TURBINE SHIPMENTS - In Transit
    # ============================================
    shipments = [
        {
            "id": "s1",
            "shipment_id": "WT-SHP-001",
            "vessel_id": "DQM-WT001",
            "component_type": "Turbine Blade (78m)",
            "quantity": 6,
            "status": "loading_transport",
            "origin": "Port of Duqm",
            "destination_site": "Dhofar Wind Farm - Block A",
            "current_location": "Duqm Port Heavy Cargo Area",
            "transport_convoy": "ASYAD-HEAVY-001",
            "last_updated": "2025-07-15T12:00:00Z"
        },
        {
            "id": "s2",
            "shipment_id": "WT-SHP-002",
            "vessel_id": "SLL-WT003",
            "component_type": "Tower Section (Base)",
            "quantity": 4,
            "status": "in_transit",
            "origin": "Port of Salalah",
            "destination_site": "Dhofar Wind Farm - Block A",
            "current_location": "Route A-47, KM 156",
            "transport_convoy": "ASYAD-HEAVY-002",
            "last_updated": "2025-07-15T11:00:00Z"
        },
        {
            "id": "s3",
            "shipment_id": "WT-SHP-003",
            "vessel_id": "SLL-WT003",
            "component_type": "Tower Section (Mid)",
            "quantity": 4,
            "status": "at_assembly_area",
            "origin": "Port of Salalah",
            "destination_site": "Dhofar Wind Farm - Block B",
            "current_location": "Primary Assembly Area - Thumrait",
            "transport_convoy": "ASYAD-HEAVY-003",
            "last_updated": "2025-07-15T08:00:00Z"
        },
        {
            "id": "s4",
            "shipment_id": "WT-SHP-004",
            "vessel_id": "DQM-WT001",
            "component_type": "Nacelle (6MW)",
            "quantity": 2,
            "status": "delivered",
            "origin": "Port of Duqm",
            "destination_site": "Dhofar Wind Farm - Block A",
            "current_location": "Site - Installation Point T-05",
            "transport_convoy": "ASYAD-HEAVY-004",
            "last_updated": "2025-07-14T16:00:00Z"
        }
    ]
    await db.fleet_shipments.insert_many(shipments)
    print(f"Created {len(shipments)} shipments")
    
    # ============================================
    # WIND FARM SITES - Concession Areas
    # ============================================
    sites = [
        {
            "id": "site1",
            "site_id": "DWF-A",
            "site_name": "Dhofar Wind Farm - Block A",
            "readiness_status": "installing",
            "expected_component": "Turbine Blade (78m)",
            "capacity_mw": 150,
            "turbines_planned": 25,
            "turbines_installed": 8,
            "contractor": "GE Renewable Energy",
            "last_updated": "2025-07-15T10:00:00Z"
        },
        {
            "id": "site2",
            "site_id": "DWF-B",
            "site_name": "Dhofar Wind Farm - Block B",
            "readiness_status": "preparing",
            "expected_component": "Tower Section (Base)",
            "capacity_mw": 100,
            "turbines_planned": 16,
            "turbines_installed": 0,
            "contractor": "Siemens Gamesa",
            "last_updated": "2025-07-15T09:00:00Z"
        },
        {
            "id": "site3",
            "site_id": "DHH-C",
            "site_name": "Duqm Hydrogen Hub C",
            "readiness_status": "installing",
            "expected_component": "tower_section",
            "last_updated": "2025-01-15T13:00:00Z"
        }
    ]
    await db.epc_sites.insert_many(sites)
    print(f"Created {len(sites)} sites")
    
    data_products = [
        {
            "id": "dp1",
            "name": "Vessel Status API",
            "domain": "port",
            "description": "Real-time vessel berthing and arrival status at Port of Duqm",
            "data_type": "operational",
            "endpoint": "/api/port/vessels",
            "schema_fields": ["vessel_id", "vessel_name", "status", "berth_number", "eta"],
            "update_frequency": "15min",
            "owner_email": "admin@port.om",
            "tags": ["real-time", "logistics", "port-operations"],
            "created_at": "2025-01-15T10:00:00Z"
        },
        {
            "id": "dp2",
            "name": "Shipment Tracking API",
            "domain": "fleet",
            "description": "Asyad fleet shipment tracking for hydrogen turbine components",
            "data_type": "operational",
            "endpoint": "/api/fleet/shipments",
            "schema_fields": ["shipment_id", "vessel_id", "component_type", "status", "destination_site"],
            "update_frequency": "30min",
            "owner_email": "fleet@asyad.om",
            "tags": ["logistics", "tracking", "supply-chain"],
            "created_at": "2025-01-15T10:00:00Z"
        },
        {
            "id": "dp3",
            "name": "Site Readiness API",
            "domain": "epc",
            "description": "Hydrogen developer site readiness and installation status",
            "data_type": "operational",
            "endpoint": "/api/epc/sites",
            "schema_fields": ["site_id", "site_name", "readiness_status", "expected_component"],
            "update_frequency": "1hour",
            "owner_email": "site@hydrogen.om",
            "tags": ["construction", "readiness", "hydrogen"],
            "created_at": "2025-01-15T10:00:00Z"
        },
        {
            "id": "dp4",
            "name": "Logistics Routes API",
            "domain": "logistics",
            "description": "Transport routes with restrictions and real-time status for wind turbine components",
            "data_type": "operational",
            "endpoint": "/api/logistics/routes",
            "schema_fields": ["route_name", "origin", "destination", "transport_mode", "distance_km", "road_restrictions"],
            "update_frequency": "1hour",
            "owner_email": "admin@port.om",
            "tags": ["routes", "transport", "restrictions", "control-tower"],
            "created_at": "2025-01-15T11:00:00Z"
        },
        {
            "id": "dp5",
            "name": "Permit Management API",
            "domain": "logistics",
            "description": "Oversized load permits and customs clearances tracking",
            "data_type": "regulatory",
            "endpoint": "/api/logistics/permits",
            "schema_fields": ["permit_number", "permit_type", "shipment_id", "issuing_authority", "status"],
            "update_frequency": "15min",
            "owner_email": "admin@port.om",
            "tags": ["permits", "compliance", "regulatory"],
            "created_at": "2025-01-15T11:00:00Z"
        },
        {
            "id": "dp6",
            "name": "Weather Forecasts API",
            "domain": "logistics",
            "description": "Real-time weather data for transport safety assessment",
            "data_type": "environmental",
            "endpoint": "/api/logistics/weather",
            "schema_fields": ["location", "forecast_date", "wind_speed_kmh", "weather_condition", "safe_for_transport"],
            "update_frequency": "30min",
            "owner_email": "admin@port.om",
            "tags": ["weather", "safety", "meteorology"],
            "created_at": "2025-01-15T11:00:00Z"
        },
        {
            "id": "dp7",
            "name": "Assembly Areas API",
            "domain": "logistics",
            "description": "Storage capacity and component inventory at assembly staging areas",
            "data_type": "operational",
            "endpoint": "/api/logistics/assembly-areas",
            "schema_fields": ["area_name", "location", "capacity", "current_occupancy", "components_stored"],
            "update_frequency": "1hour",
            "owner_email": "admin@port.om",
            "tags": ["inventory", "storage", "assembly"],
            "created_at": "2025-01-15T11:00:00Z"
        }
    ]
    await db.data_catalog.insert_many(data_products)
    print(f"Created {len(data_products)} data products")
    
    mappings = [
        {
            "id": "m1",
            "source_domain": "port",
            "source_field": "Vessel_ID",
            "target_standard": "IDS",
            "target_field": "vessel_identifier",
            "description": "Port Authority vessel identification to IDS standard"
        },
        {
            "id": "m2",
            "source_domain": "fleet",
            "source_field": "Ship_Ref",
            "target_standard": "IDS",
            "target_field": "vessel_identifier",
            "description": "Fleet operations ship reference to IDS standard"
        },
        {
            "id": "m3",
            "source_domain": "epc",
            "source_field": "Component_Status",
            "target_standard": "Gaia-X",
            "target_field": "resource_status",
            "description": "EPC component status to Gaia-X resource status"
        }
    ]
    await db.semantic_mappings.insert_many(mappings)
    print(f"Created {len(mappings)} semantic mappings")
    
    policies = [
        {
            "id": "p1",
            "resource_domain": "port",
            "allowed_domains": ["port", "fleet"],
            "allowed_roles": ["viewer", "editor", "admin"],
            "data_fields_visible": ["vessel_id", "vessel_name", "status", "berth_number", "eta", "cargo_type"]
        },
        {
            "id": "p2",
            "resource_domain": "fleet",
            "allowed_domains": ["fleet", "epc"],
            "allowed_roles": ["viewer", "editor", "admin"],
            "data_fields_visible": ["shipment_id", "component_type", "status", "destination_site"]
        },
        {
            "id": "p3",
            "resource_domain": "epc",
            "allowed_domains": ["epc", "fleet"],
            "allowed_roles": ["editor", "admin"],
            "data_fields_visible": ["site_id", "site_name", "readiness_status", "expected_component"]
        }
    ]
    await db.access_policies.insert_many(policies)
    print(f"Created {len(policies)} access policies")
    
    events = [
        {
            "id": "e1",
            "event_type": "vessel_update",
            "domain": "port",
            "resource_id": "v1",
            "description": "Vessel Hydrogen Pioneer berthed at B-12",
            "triggered_actions": ["notify_fleet", "update_catalog"],
            "timestamp": "2025-01-15T12:00:00Z"
        },
        {
            "id": "e2",
            "event_type": "shipment_update",
            "domain": "fleet",
            "resource_id": "s1",
            "description": "Shipment SHP-2025-001 arrived at port",
            "triggered_actions": ["notify_site", "check_readiness"],
            "timestamp": "2025-01-15T12:15:00Z"
        },
        {
            "id": "e3",
            "event_type": "site_update",
            "domain": "epc",
            "resource_id": "site1",
            "description": "Site Duqm Hydrogen Hub A ready for component delivery",
            "triggered_actions": ["notify_fleet", "enable_shipping"],
            "timestamp": "2025-01-15T11:30:00Z"
        },
        {
            "id": "e4",
            "event_type": "permit_requested",
            "domain": "logistics",
            "resource_id": "permit2",
            "description": "Permit TRP-2025-002 requested for oversized turbine blade transport",
            "triggered_actions": ["notify_authority", "track_status"],
            "timestamp": "2025-01-14T09:00:00Z"
        },
        {
            "id": "e5",
            "event_type": "route_created",
            "domain": "logistics",
            "resource_id": "route3",
            "description": "New route planned: Hub B Coastal Route with bridge clearance restrictions",
            "triggered_actions": ["update_permits", "notify_fleet"],
            "timestamp": "2025-01-15T08:00:00Z"
        },
        {
            "id": "e6",
            "event_type": "vessel_update",
            "domain": "port",
            "resource_id": "v3",
            "description": "Vessel Test Vessel status: approaching",
            "triggered_actions": ["prepare_berth", "customs_alert"],
            "timestamp": "2025-01-15T07:00:00Z"
        },
        {
            "id": "e7",
            "event_type": "shipment_update",
            "domain": "fleet",
            "resource_id": "s3",
            "description": "Shipment SHIP-081933 status: pending",
            "triggered_actions": ["check_permits", "weather_check"],
            "timestamp": "2025-01-14T16:00:00Z"
        }
    ]
    await db.event_logs.insert_many(events)
    print(f"Created {len(events)} event logs")
    
    routes = [
        {
            "id": "route1",
            "route_name": "Port Duqm to Hub A",
            "origin": "Port of Duqm",
            "destination": "Duqm Hydrogen Hub A",
            "transport_mode": "Heavy Duty Truck",
            "distance_km": 45.5,
            "estimated_duration_hours": 3.5,
            "road_restrictions": ["Height limit 6m", "Weight limit 120 tons", "Night transport only"],
            "status": "active",
            "last_updated": "2025-01-15T10:00:00Z"
        },
        {
            "id": "route2",
            "route_name": "Port Salalah to Assembly Area",
            "origin": "Port of Salalah",
            "destination": "Secondary Assembly Area",
            "transport_mode": "Specialized Heavy Transport",
            "distance_km": 78.2,
            "estimated_duration_hours": 6.0,
            "road_restrictions": ["Blade length 80m", "Escort vehicle required", "Weather dependent"],
            "status": "active",
            "last_updated": "2025-01-15T10:00:00Z"
        },
        {
            "id": "route3",
            "route_name": "Hub B Coastal Route",
            "origin": "Port of Duqm",
            "destination": "Duqm Hydrogen Hub B",
            "transport_mode": "Multi-axle Trailer",
            "distance_km": 62.0,
            "estimated_duration_hours": 4.5,
            "road_restrictions": ["Bridge clearance 5.5m", "Permit required"],
            "status": "planned",
            "last_updated": "2025-01-15T10:00:00Z"
        }
    ]
    await db.logistics_routes.insert_many(routes)
    print(f"Created {len(routes)} logistics routes")
    
    permits = [
        {
            "id": "permit1",
            "permit_number": "TRP-2025-001",
            "permit_type": "Oversized Load Transport",
            "shipment_id": "SHP-2025-001",
            "issuing_authority": "Royal Oman Police - Traffic Department",
            "status": "approved",
            "requested_date": "2025-01-10",
            "approved_date": "2025-01-12",
            "expiry_date": "2025-02-10",
            "restrictions": ["Night transport only", "Escort vehicle required"]
        },
        {
            "id": "permit2",
            "permit_number": "TRP-2025-002",
            "permit_type": "Special Cargo Permit",
            "shipment_id": "SHP-2025-002",
            "issuing_authority": "Ministry of Transport",
            "status": "pending",
            "requested_date": "2025-01-14",
            "approved_date": None,
            "expiry_date": None,
            "restrictions": ["Weather clearance needed", "Height restriction waiver"]
        },
        {
            "id": "permit3",
            "permit_number": "CUS-2025-003",
            "permit_type": "Customs Clearance",
            "shipment_id": "SHP-2025-003",
            "issuing_authority": "Royal Oman Police - Customs",
            "status": "approved",
            "requested_date": "2025-01-13",
            "approved_date": "2025-01-14",
            "expiry_date": "2025-03-13",
            "restrictions": ["Certificate of origin required"]
        }
    ]
    await db.logistics_permits.insert_many(permits)
    print(f"Created {len(permits)} logistics permits")
    
    weather_forecasts = [
        {
            "id": "weather1",
            "location": "Port of Duqm",
            "forecast_date": "2025-01-16",
            "temperature_celsius": 24.5,
            "wind_speed_kmh": 15.0,
            "weather_condition": "Clear",
            "visibility_km": 10.0,
            "safe_for_transport": True
        },
        {
            "id": "weather2",
            "location": "Duqm Hydrogen Hub A",
            "forecast_date": "2025-01-16",
            "temperature_celsius": 26.0,
            "wind_speed_kmh": 22.0,
            "weather_condition": "Partly Cloudy",
            "visibility_km": 8.5,
            "safe_for_transport": True
        },
        {
            "id": "weather3",
            "location": "Coastal Route",
            "forecast_date": "2025-01-16",
            "temperature_celsius": 23.0,
            "wind_speed_kmh": 45.0,
            "weather_condition": "Strong Winds",
            "visibility_km": 6.0,
            "safe_for_transport": False
        }
    ]
    await db.weather_forecasts.insert_many(weather_forecasts)
    print(f"Created {len(weather_forecasts)} weather forecasts")
    
    # ============================================
    # ASSEMBLY AREAS - Primary & Secondary per Asyad Flow
    # ============================================
    assembly_areas = [
        {
            "id": "area1",
            "area_name": "Primary Assembly Area - Thumrait",
            "area_type": "Primary",
            "location": "Thumrait Industrial Zone, Dhofar",
            "capacity": 80,
            "current_occupancy": 45,
            "available_space": 35,
            "status": "available",
            "components_stored": ["Turbine Blades x18", "Tower Sections x24", "Nacelles x6"],
            "stakeholder": "Asyad Logistics",
            "coordinates": {"lat": 17.64, "lon": 54.02}
        },
        {
            "id": "area2",
            "area_name": "Primary Assembly Area - Duqm SEZ",
            "area_type": "Primary",
            "location": "Duqm Special Economic Zone",
            "capacity": 60,
            "current_occupancy": 38,
            "available_space": 22,
            "status": "available",
            "components_stored": ["Turbine Blades x12", "Generator Units x8", "Control Systems x15"],
            "stakeholder": "Asyad Logistics",
            "coordinates": {"lat": 19.52, "lon": 57.70}
        },
        {
            "id": "area3",
            "area_name": "Secondary Assembly - Site Alpha",
            "area_type": "Secondary",
            "location": "Near Dhofar Wind Farm Block A",
            "capacity": 25,
            "current_occupancy": 22,
            "available_space": 3,
            "status": "near_capacity",
            "components_stored": ["Tower Sections x16", "Blade Adapters x6"],
            "stakeholder": "GE Renewable Energy",
            "coordinates": {"lat": 17.03, "lon": 54.13}
        },
        {
            "id": "area4",
            "area_name": "Secondary Assembly - Site Beta",
            "area_type": "Secondary",
            "location": "Near Dhofar Wind Farm Block B",
            "capacity": 20,
            "current_occupancy": 8,
            "available_space": 12,
            "status": "available",
            "components_stored": ["Foundation Bolts x100", "Cables x12"],
            "stakeholder": "Siemens Gamesa",
            "coordinates": {"lat": 17.08, "lon": 54.18}
        }
    ]
    await db.assembly_areas.insert_many(assembly_areas)
    print(f"Created {len(assembly_areas)} assembly areas")
    
    # ============================================
    # DATA PRODUCT CANVAS - Complete Canvas Examples
    # ============================================
    
    data_product_canvases = [
        {
            "id": "canvas1",
            "name": "Vessel Arrival Status",
            "domain": "port",
            "owner_name": "Port Authority Admin",
            "owner_email": "admin@port.om",
            "date": "2025-01-15",
            "version": "2.1.0",
            "description": "Real-time vessel arrival and departure status for the Port of Duqm. Provides current berth assignments, ETAs, and vessel details for hydrogen component logistics.",
            "classification": "source-aligned",
            "consumers": [
                {"name": "Fleet Operations", "domain": "fleet", "role": "consumer", "use_cases": ["shipment_planning", "delivery_scheduling"]},
                {"name": "Logistics Control Tower", "domain": "logistics", "role": "consumer", "use_cases": ["route_optimization", "capacity_planning"]},
                {"name": "Site Installation Team", "domain": "epc", "role": "consumer", "use_cases": ["delivery_reception", "installation_scheduling"]}
            ],
            "use_cases": [
                {"name": "Shipment Coordination", "description": "Coordinate vessel arrivals with land transport for hydrogen components", "business_objective": "Minimize port dwell time", "success_metrics": ["Average dwell time < 24h", "On-time departure rate > 95%"]},
                {"name": "Berth Optimization", "description": "Optimize berth allocation for hydrogen component vessels", "business_objective": "Maximize port throughput", "success_metrics": ["Berth utilization > 80%", "Queue time < 4h"]}
            ],
            "output_ports": [
                {"format": "REST API", "protocol": "HTTPS", "location": "/api/port/vessels", "description": "Real-time vessel status endpoint"},
                {"format": "Parquet", "protocol": "S3", "location": "s3://hydrogen-data/port/vessels/", "description": "Daily vessel snapshots for analytics"}
            ],
            "terms": "Data available for all Oman Hydrogen Project participants. Attribution required for external use. Data retention: 2 years. No commercial redistribution.",
            "data_model": [
                {"name": "vessel_id", "data_type": "string", "description": "Unique vessel identifier (IMO number)", "constraints": ["NOT NULL", "UNIQUE"], "is_pii": False, "is_business_key": True, "is_join_key": True},
                {"name": "vessel_name", "data_type": "string", "description": "Official vessel name", "constraints": ["NOT NULL"], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "status", "data_type": "enum", "description": "Current vessel status", "constraints": ["IN ('berthed', 'approaching', 'departing', 'unloading')"], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "berth_number", "data_type": "string", "description": "Assigned berth location", "constraints": [], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "eta", "data_type": "datetime", "description": "Estimated time of arrival", "constraints": [], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "cargo_type", "data_type": "string", "description": "Type of hydrogen components being transported", "constraints": [], "is_pii": False, "is_business_key": False, "is_join_key": False}
            ],
            "quality_checks": [
                {"check_name": "vessel_id_uniqueness", "check_type": "uniqueness", "expression": "COUNT(DISTINCT vessel_id) = COUNT(*)", "threshold": 100.0, "description": "Each vessel should have a unique ID"},
                {"check_name": "status_freshness", "check_type": "freshness", "expression": "MAX(last_updated) > NOW() - INTERVAL '15 minutes'", "threshold": None, "description": "Data should be updated within 15 minutes"},
                {"check_name": "eta_validity", "check_type": "validity", "expression": "eta >= NOW() OR status IN ('berthed', 'departing')", "threshold": 95.0, "description": "ETA should be in the future unless vessel is already present"}
            ],
            "sla": {"availability": "99.5%", "support_hours": "24/7", "retention_period": "2 years", "backup_frequency": "Daily", "response_time": "< 500ms"},
            "security": {"access_level": "internal", "approval_required": False, "allowed_roles": ["admin", "editor", "viewer"], "allowed_domains": ["port", "fleet", "epc", "logistics"], "pii_handling": "No PII present"},
            "input_ports": [
                {"source_type": "operational_system", "source_name": "Port Management System", "source_domain": "port", "format": "PostgreSQL", "protocol": "CDC", "description": "Real-time vessel tracking from port operations"},
                {"source_type": "operational_system", "source_name": "AIS System", "source_domain": "port", "format": "Stream", "protocol": "Kafka", "description": "Automatic Identification System vessel positions"}
            ],
            "architecture": {
                "processing_type": "streaming",
                "framework": "Apache Flink",
                "storage_type": "tables",
                "query_engine": "SQL",
                "transformation_steps": ["Ingestion from PMS", "AIS enrichment", "Status calculation", "ETA prediction"],
                "scheduling_tool": "Airflow",
                "monitoring_tool": "Grafana",
                "estimated_cost": "$2,500/month"
            },
            "ubiquitous_language": {
                "Berth": "A designated location at the port where vessels can dock for loading/unloading",
                "ETA": "Estimated Time of Arrival - predicted arrival time based on AIS data",
                "IMO Number": "International Maritime Organization unique vessel identifier",
                "Dwell Time": "Duration a vessel spends at port from arrival to departure"
            },
            "status": "active",
            "created_at": "2025-01-10T10:00:00Z",
            "follow_up_actions": ["Add weather impact on ETA", "Integrate with berth scheduling system"],
            "follow_up_date": "2025-02-15"
        },
        {
            "id": "canvas2",
            "name": "Hydrogen Component Shipments",
            "domain": "fleet",
            "owner_name": "Asyad Fleet Manager",
            "owner_email": "fleet@asyad.om",
            "date": "2025-01-12",
            "version": "1.5.0",
            "description": "Tracking data for hydrogen components being transported from port to installation sites. Includes shipment status, location, and delivery estimates.",
            "classification": "aggregate",
            "consumers": [
                {"name": "Site Installation Team", "domain": "epc", "role": "consumer", "use_cases": ["delivery_tracking", "installation_planning"]},
                {"name": "Logistics Control Tower", "domain": "logistics", "role": "consumer", "use_cases": ["route_monitoring", "delay_prediction"]}
            ],
            "use_cases": [
                {"name": "Component Delivery Tracking", "description": "Track hydrogen components from port to installation site", "business_objective": "Ensure on-time delivery", "success_metrics": ["On-time delivery > 90%", "Component damage < 0.1%"]},
                {"name": "Fleet Utilization", "description": "Optimize truck and trailer allocation for component transport", "business_objective": "Maximize fleet efficiency", "success_metrics": ["Fleet utilization > 75%", "Empty runs < 10%"]}
            ],
            "output_ports": [
                {"format": "REST API", "protocol": "HTTPS", "location": "/api/fleet/shipments", "description": "Real-time shipment tracking API"},
                {"format": "Delta Lake", "protocol": "S3", "location": "s3://hydrogen-data/fleet/shipments/", "description": "Historical shipment data for analytics"}
            ],
            "terms": "Data available to authorized Oman Hydrogen Project members. Location data aggregated to regional level for security. 3-year retention for compliance.",
            "data_model": [
                {"name": "shipment_id", "data_type": "string", "description": "Unique shipment identifier", "constraints": ["NOT NULL", "UNIQUE"], "is_pii": False, "is_business_key": True, "is_join_key": True},
                {"name": "vessel_id", "data_type": "string", "description": "Source vessel IMO number", "constraints": ["NOT NULL"], "is_pii": False, "is_business_key": False, "is_join_key": True},
                {"name": "component_type", "data_type": "string", "description": "Type of hydrogen component (Electrolyzer, Tower, Blade, etc.)", "constraints": ["NOT NULL"], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "status", "data_type": "enum", "description": "Current shipment status", "constraints": ["IN ('at_port', 'in_transit', 'delivered', 'pending')"], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "destination_site", "data_type": "string", "description": "Target installation site ID", "constraints": ["NOT NULL"], "is_pii": False, "is_business_key": False, "is_join_key": True},
                {"name": "driver_id", "data_type": "string", "description": "Assigned driver identifier", "constraints": [], "is_pii": True, "is_business_key": False, "is_join_key": False}
            ],
            "quality_checks": [
                {"check_name": "shipment_completeness", "check_type": "completeness", "expression": "component_type IS NOT NULL AND destination_site IS NOT NULL", "threshold": 100.0, "description": "All shipments must have component type and destination"},
                {"check_name": "status_consistency", "check_type": "consistency", "expression": "status = 'delivered' IMPLIES actual_delivery_time IS NOT NULL", "threshold": 99.0, "description": "Delivered shipments must have delivery time recorded"}
            ],
            "sla": {"availability": "99.0%", "support_hours": "Business hours (8AM-6PM GST)", "retention_period": "3 years", "backup_frequency": "Hourly", "response_time": "< 1s"},
            "security": {"access_level": "restricted", "approval_required": True, "allowed_roles": ["admin", "editor"], "allowed_domains": ["fleet", "epc", "logistics"], "pii_handling": "Driver ID masked for non-fleet users"},
            "input_ports": [
                {"source_type": "data_product", "source_name": "Vessel Arrival Status", "source_domain": "port", "format": "REST API", "protocol": "HTTPS", "description": "Vessel arrival data for shipment initiation"},
                {"source_type": "operational_system", "source_name": "Fleet TMS", "source_domain": "fleet", "format": "PostgreSQL", "protocol": "CDC", "description": "Transport Management System shipment records"},
                {"source_type": "operational_system", "source_name": "GPS Tracking", "source_domain": "fleet", "format": "Stream", "protocol": "MQTT", "description": "Real-time vehicle location data"}
            ],
            "architecture": {
                "processing_type": "hybrid",
                "framework": "Databricks",
                "storage_type": "Delta Lake",
                "query_engine": "SQL",
                "transformation_steps": ["Ingest from TMS", "Join vessel data", "GPS enrichment", "Status aggregation", "ETA calculation"],
                "scheduling_tool": "Databricks Workflows",
                "monitoring_tool": "Soda",
                "estimated_cost": "$3,200/month"
            },
            "ubiquitous_language": {
                "Component": "A major hydrogen production equipment piece (Electrolyzer, Tower Section, Blade, Cable)",
                "TMS": "Transport Management System - operational system for fleet coordination",
                "In Transit": "Shipment has departed port and is en route to destination",
                "Oversized Load": "Component requiring special permits due to dimensions exceeding standard limits"
            },
            "status": "active",
            "created_at": "2025-01-12T10:00:00Z",
            "follow_up_actions": ["Add predictive ETA model", "Integrate weather delays"],
            "follow_up_date": "2025-03-01"
        },
        {
            "id": "canvas3",
            "name": "Site Installation Readiness",
            "domain": "epc",
            "owner_name": "EPC Site Manager",
            "owner_email": "site@hydrogen.om",
            "date": "2025-01-08",
            "version": "1.2.0",
            "description": "Installation site readiness status for receiving and installing hydrogen production components. Includes foundation status, crew availability, and equipment readiness.",
            "classification": "consumer-aligned",
            "consumers": [
                {"name": "Fleet Operations", "domain": "fleet", "role": "consumer", "use_cases": ["delivery_scheduling", "route_planning"]},
                {"name": "Project Management", "domain": "logistics", "role": "consumer", "use_cases": ["progress_tracking", "milestone_reporting"]}
            ],
            "use_cases": [
                {"name": "Delivery Coordination", "description": "Ensure site is ready before component delivery arrives", "business_objective": "Zero delivery rejections", "success_metrics": ["Rejection rate = 0%", "Site ready 24h before arrival"]},
                {"name": "Installation Scheduling", "description": "Schedule installation crews based on component arrivals", "business_objective": "Maximize crew utilization", "success_metrics": ["Crew utilization > 85%", "Installation delays < 5%"]}
            ],
            "output_ports": [
                {"format": "REST API", "protocol": "HTTPS", "location": "/api/epc/sites", "description": "Site readiness status endpoint"},
                {"format": "Dashboard", "protocol": "HTTPS", "location": "/dashboard/sites", "description": "Visual site status dashboard"}
            ],
            "terms": "Internal project use only. Site location data classified as confidential. Weekly data refresh for analytics.",
            "data_model": [
                {"name": "site_id", "data_type": "string", "description": "Unique site identifier", "constraints": ["NOT NULL", "UNIQUE"], "is_pii": False, "is_business_key": True, "is_join_key": True},
                {"name": "site_name", "data_type": "string", "description": "Human-readable site name", "constraints": ["NOT NULL"], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "readiness_status", "data_type": "enum", "description": "Current site readiness level", "constraints": ["IN ('ready', 'preparing', 'installing', 'offline')"], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "expected_component", "data_type": "string", "description": "Next component expected at site", "constraints": [], "is_pii": False, "is_business_key": False, "is_join_key": False},
                {"name": "crew_count", "data_type": "integer", "description": "Number of installation crew members on site", "constraints": [">=0"], "is_pii": False, "is_business_key": False, "is_join_key": False}
            ],
            "quality_checks": [
                {"check_name": "site_id_uniqueness", "check_type": "uniqueness", "expression": "COUNT(DISTINCT site_id) = COUNT(*)", "threshold": 100.0, "description": "Each site must have unique ID"},
                {"check_name": "status_freshness", "check_type": "freshness", "expression": "MAX(last_updated) > NOW() - INTERVAL '1 hour'", "threshold": None, "description": "Status should be updated hourly"}
            ],
            "sla": {"availability": "98.5%", "support_hours": "Business hours", "retention_period": "5 years", "backup_frequency": "Daily", "response_time": "< 2s"},
            "security": {"access_level": "confidential", "approval_required": True, "allowed_roles": ["admin", "editor"], "allowed_domains": ["epc", "logistics"], "pii_handling": "Location coordinates restricted"},
            "input_ports": [
                {"source_type": "operational_system", "source_name": "Site Management System", "source_domain": "epc", "format": "PostgreSQL", "protocol": "JDBC", "description": "Site operational data"},
                {"source_type": "operational_system", "source_name": "Crew Management", "source_domain": "epc", "format": "REST API", "protocol": "HTTPS", "description": "Crew scheduling and availability"}
            ],
            "architecture": {
                "processing_type": "batch",
                "framework": "dbt",
                "storage_type": "tables",
                "query_engine": "SQL",
                "transformation_steps": ["Extract site data", "Join crew data", "Calculate readiness score", "Publish to API"],
                "scheduling_tool": "Airflow",
                "monitoring_tool": "Great Expectations",
                "estimated_cost": "$1,800/month"
            },
            "ubiquitous_language": {
                "Readiness Score": "Calculated metric (0-100) indicating site preparedness for installation",
                "Foundation Ready": "Site concrete foundation has cured and is ready for equipment installation",
                "Crew Availability": "Percentage of required installation crew currently on site"
            },
            "status": "active",
            "created_at": "2025-01-08T10:00:00Z",
            "follow_up_actions": ["Add weather impact assessment", "Integrate supply chain data"],
            "follow_up_date": "2025-02-28"
        }
    ]
    
    await db.data_product_canvases.insert_many(data_product_canvases)
    print(f"Created {len(data_product_canvases)} data product canvases")
    
    # ============================================
    # DOMAIN OWNERSHIP - Domain Journey Data
    # ============================================
    await db.domain_journeys.delete_many({})
    
    domain_journeys = [
        {
            "id": "dj1",
            "domain_name": "port",
            "current_level": 4,
            "level_description": "Data Mesh Contributor - Active participant in the mesh ecosystem",
            "data_products_published": 3,
            "data_products_consumed": 5,
            "journey_started": "2024-06-01",
            "last_updated": "2025-01-15T10:00:00Z"
        },
        {
            "id": "dj2",
            "domain_name": "fleet",
            "current_level": 3,
            "level_description": "Data Producer - Publishing initial data products",
            "data_products_published": 2,
            "data_products_consumed": 4,
            "journey_started": "2024-08-15",
            "last_updated": "2025-01-15T10:00:00Z"
        },
        {
            "id": "dj3",
            "domain_name": "epc",
            "current_level": 2,
            "level_description": "Data Aware - Understanding data needs and dependencies",
            "data_products_published": 1,
            "data_products_consumed": 6,
            "journey_started": "2024-10-01",
            "last_updated": "2025-01-15T10:00:00Z"
        },
        {
            "id": "dj4",
            "domain_name": "logistics",
            "current_level": 4,
            "level_description": "Data Mesh Contributor - Active participant in the mesh ecosystem",
            "data_products_published": 4,
            "data_products_consumed": 3,
            "journey_started": "2024-07-01",
            "last_updated": "2025-01-15T10:00:00Z"
        }
    ]
    await db.domain_journeys.insert_many(domain_journeys)
    print(f"Created {len(domain_journeys)} domain journeys")
    
    # ============================================
    # DATA AS A PRODUCT - Data Contracts
    # ============================================
    await db.data_contracts.delete_many({})
    
    # ============================================
    # ENHANCED DATA CONTRACTS - Based on Data Contract Specification
    # ============================================
    data_contracts = [
        {
            "id": "dc1",
            "contract_name": "Vessel Arrival Status Contract",
            "version": "2.0.0",
            "status": "active",
            "data_product_id": "dp1",
            "description": "Contract for Vessel Arrival Status data product with comprehensive SLAs and quality guarantees",
            
            "provider": {
                "name": "Port Authority Admin",
                "email": "admin@port.om",
                "team": "Port Operations",
                "domain": "port",
                "output_port": "s3://data-products/port/vessel-status/v2/"
            },
            
            "dataset": {
                "name": "Vessel Arrival Status",
                "description": "Real-time vessel arrival and berth status for Sohar Port operations. Provides current position, ETA, berth assignments, and cargo information for all vessels.",
                "domain": "port",
                "dataset_type": "source-aligned"
            },
            
            "schema_fields": [
                {
                    "name": "vessel_id",
                    "data_type": "string",
                    "description": "Unique identifier for the vessel (IMO number)",
                    "business_term": "Vessel Identifier",
                    "example": "IMO9876543",
                    "format": "^IMO[0-9]{7}$",
                    "required": True,
                    "nullable": False,
                    "unique": True,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": ["IMO format validation"],
                    "tags": ["identifier", "vessel"]
                },
                {
                    "name": "vessel_name",
                    "data_type": "string",
                    "description": "Official registered name of the vessel",
                    "business_term": "Vessel Name",
                    "example": "MV Hydrogen Pioneer",
                    "format": None,
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "public",
                    "constraints": ["Max 100 characters"],
                    "tags": ["vessel", "name"]
                },
                {
                    "name": "status",
                    "data_type": "enum",
                    "description": "Current operational status of the vessel at port",
                    "business_term": "Vessel Status",
                    "example": "berthed",
                    "format": "enum(berthed,approaching,departing,unloading,waiting)",
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": ["Valid enum value"],
                    "tags": ["status", "operational"]
                },
                {
                    "name": "berth_number",
                    "data_type": "string",
                    "description": "Assigned berth number at Sohar Port",
                    "business_term": "Berth Assignment",
                    "example": "B-12",
                    "format": "^B-[0-9]{1,2}$",
                    "required": False,
                    "nullable": True,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["berth", "location"]
                },
                {
                    "name": "eta",
                    "data_type": "datetime",
                    "description": "Estimated time of arrival at port",
                    "business_term": "ETA",
                    "example": "2025-07-15T08:30:00Z",
                    "format": "ISO8601",
                    "required": False,
                    "nullable": True,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": ["Must be future date for approaching vessels"],
                    "tags": ["time", "arrival"]
                },
                {
                    "name": "cargo_type",
                    "data_type": "string",
                    "description": "Type of hydrogen equipment cargo being transported",
                    "business_term": "Cargo Classification",
                    "example": "Electrolyzer Units",
                    "format": None,
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["cargo", "hydrogen"]
                },
                {
                    "name": "last_updated",
                    "data_type": "datetime",
                    "description": "Timestamp of last status update",
                    "business_term": "Update Timestamp",
                    "example": "2025-07-15T10:00:00Z",
                    "format": "ISO8601",
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["metadata", "timestamp"]
                }
            ],
            
            "quality": {
                "freshness_slo": "15 minutes",
                "freshness_description": "Data is updated every 15 minutes from AIS feed and port management system",
                "expected_row_count_min": 5,
                "expected_row_count_max": 50,
                "completeness_threshold": 98.0,
                "accuracy_threshold": 99.5,
                "validity_rules": [
                    "vessel_id must be valid IMO format",
                    "status must be valid enum value",
                    "ETA must be future date for approaching vessels",
                    "berth_number required when status is 'berthed'"
                ],
                "data_quality_checks": [
                    "Uniqueness check on vessel_id",
                    "Referential integrity with vessel registry",
                    "Timeliness check on last_updated",
                    "Format validation on all fields"
                ]
            },
            
            "slo": {
                "availability": "99.5%",
                "availability_description": "Measured monthly, excluding scheduled maintenance windows",
                "latency_p95": "200ms",
                "latency_p99": "500ms",
                "throughput": "100 requests/second",
                "support_hours": "24x7 for critical issues, Business hours (08:00-18:00 UTC+4) for non-critical",
                "response_time_critical": "1 hour",
                "response_time_normal": "24 hours",
                "maintenance_window": "Sundays 02:00-04:00 UTC",
                "incident_notification": "Email to registered consumers, Slack #port-data-alerts"
            },
            
            "billing": {
                "pricing_model": "free",
                "cost_per_query": None,
                "monthly_subscription": None,
                "free_tier_limit": "Unlimited for Oman Hydrogen ecosystem partners",
                "billing_contact": "billing@port.om",
                "billing_cycle": "monthly",
                "currency": "OMR",
                "cost_center": "PORT-OPS-001"
            },
            
            "terms": {
                "usage_restrictions": [
                    "Data must not be shared outside Oman Hydrogen ecosystem",
                    "No commercial resale permitted",
                    "Real-time data must not be cached for more than 15 minutes"
                ],
                "allowed_purposes": [
                    "Logistics planning and coordination",
                    "Supply chain optimization",
                    "Operational dashboards and reporting",
                    "Integration with other data products"
                ],
                "retention_period": "2 years",
                "data_residency": "Oman",
                "licensing": "Oman Hydrogen Data Ecosystem License v1.0",
                "attribution_required": True,
                "redistribution_allowed": False,
                "modification_allowed": True,
                "change_notice_period": "30 days",
                "breaking_change_policy": "Major version bump, 60 days deprecation notice, parallel running of old version",
                "deprecation_policy": "90 days notice before deprecation, migration guide provided"
            },
            
            "consumers": [
                {
                    "name": "Asyad Fleet Management",
                    "team": "Logistics Operations",
                    "domain": "fleet",
                    "email": "fleet@asyad.om",
                    "use_cases": ["Shipment scheduling", "Route optimization", "ETA tracking"],
                    "approved_date": "2025-01-15",
                    "access_level": "read"
                },
                {
                    "name": "EPC Site Planning",
                    "team": "Site Operations",
                    "domain": "epc",
                    "email": "site@hydrogen.om",
                    "use_cases": ["Delivery coordination", "Site readiness planning"],
                    "approved_date": "2025-01-20",
                    "access_level": "read"
                },
                {
                    "name": "Control Tower Analytics",
                    "team": "Central Analytics",
                    "domain": "analytics",
                    "email": "analytics@hydrogen.om",
                    "use_cases": ["Real-time dashboards", "Performance KPIs"],
                    "approved_date": "2025-02-01",
                    "access_level": "read"
                }
            ],
            
            "effective_date": "2025-01-01",
            "expiry_date": None,
            "created_at": "2025-01-10T10:00:00Z"
        },
        {
            "id": "dc2",
            "contract_name": "Shipment Tracking Contract",
            "version": "1.5.0",
            "status": "active",
            "data_product_id": "dp2",
            "description": "Contract for Shipment Tracking data product with delivery guarantees",
            
            "provider": {
                "name": "Asyad Fleet Manager",
                "email": "fleet@asyad.om",
                "team": "Fleet Operations",
                "domain": "fleet",
                "output_port": "kafka://events.fleet.asyad.om/shipments"
            },
            
            "dataset": {
                "name": "Shipment Tracking",
                "description": "Real-time tracking of hydrogen equipment shipments from port to installation sites. Includes component details, transport status, and delivery estimates.",
                "domain": "fleet",
                "dataset_type": "aggregate"
            },
            
            "schema_fields": [
                {
                    "name": "shipment_id",
                    "data_type": "string",
                    "description": "Unique identifier for the shipment",
                    "business_term": "Shipment ID",
                    "example": "SHP-2025-001234",
                    "format": "^SHP-[0-9]{4}-[0-9]{6}$",
                    "required": True,
                    "nullable": False,
                    "unique": True,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["identifier", "shipment"]
                },
                {
                    "name": "vessel_id",
                    "data_type": "string",
                    "description": "Reference to source vessel (foreign key to Vessel Status)",
                    "business_term": "Source Vessel",
                    "example": "IMO9876543",
                    "format": "^IMO[0-9]{7}$",
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": ["Must exist in Vessel Status data product"],
                    "tags": ["reference", "vessel"]
                },
                {
                    "name": "component_type",
                    "data_type": "string",
                    "description": "Type of hydrogen component being shipped",
                    "business_term": "Component Type",
                    "example": "Electrolyzer Stack",
                    "format": None,
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["component", "hydrogen"]
                },
                {
                    "name": "status",
                    "data_type": "enum",
                    "description": "Current shipment status",
                    "business_term": "Shipment Status",
                    "example": "in_transit",
                    "format": "enum(at_port,loading,in_transit,delivered,pending)",
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["status"]
                },
                {
                    "name": "destination_site",
                    "data_type": "string",
                    "description": "Target installation site ID",
                    "business_term": "Destination Site",
                    "example": "DUQM-H2-SITE-01",
                    "format": None,
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": ["Must exist in Site Readiness data product"],
                    "tags": ["destination", "site"]
                },
                {
                    "name": "estimated_delivery",
                    "data_type": "datetime",
                    "description": "Estimated delivery date and time",
                    "business_term": "ETA Delivery",
                    "example": "2025-07-20T14:00:00Z",
                    "format": "ISO8601",
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["time", "delivery"]
                },
                {
                    "name": "driver_contact",
                    "data_type": "string",
                    "description": "Driver contact information for delivery coordination",
                    "business_term": "Driver Contact",
                    "example": "+968 9XXX XXXX",
                    "format": "phone",
                    "required": False,
                    "nullable": True,
                    "unique": False,
                    "sensitive": True,
                    "is_pii": True,
                    "classification": "confidential",
                    "constraints": ["PII - restricted access"],
                    "tags": ["pii", "contact"]
                }
            ],
            
            "quality": {
                "freshness_slo": "30 minutes",
                "freshness_description": "Data updated from GPS tracking and fleet management system every 30 minutes",
                "expected_row_count_min": 10,
                "expected_row_count_max": 200,
                "completeness_threshold": 95.0,
                "accuracy_threshold": 99.0,
                "validity_rules": [
                    "shipment_id must be unique",
                    "vessel_id must exist in vessel registry",
                    "estimated_delivery must be future date for active shipments"
                ],
                "data_quality_checks": [
                    "Uniqueness check on shipment_id",
                    "Cross-reference with port vessel data",
                    "GPS coordinate validation",
                    "PII field masking verification"
                ]
            },
            
            "slo": {
                "availability": "99.0%",
                "availability_description": "Measured monthly, streaming endpoint availability",
                "latency_p95": "500ms",
                "latency_p99": "1000ms",
                "throughput": "50 events/second",
                "support_hours": "Business hours (08:00-20:00 UTC+4)",
                "response_time_critical": "2 hours",
                "response_time_normal": "48 hours",
                "maintenance_window": "Saturdays 00:00-02:00 UTC",
                "incident_notification": "Email, SMS for critical issues"
            },
            
            "billing": {
                "pricing_model": "subscription",
                "cost_per_query": None,
                "monthly_subscription": "500 OMR",
                "free_tier_limit": "First 3 months free for ecosystem partners",
                "billing_contact": "finance@asyad.om",
                "billing_cycle": "monthly",
                "currency": "OMR",
                "cost_center": "FLEET-OPS-002"
            },
            
            "terms": {
                "usage_restrictions": [
                    "PII fields require additional approval",
                    "No real-time location sharing outside ecosystem",
                    "Driver contact info limited to delivery coordination only"
                ],
                "allowed_purposes": [
                    "Delivery coordination",
                    "Site readiness planning",
                    "Supply chain analytics",
                    "Performance tracking"
                ],
                "retention_period": "3 years",
                "data_residency": "Oman",
                "licensing": "Oman Hydrogen Data Ecosystem License v1.0",
                "attribution_required": True,
                "redistribution_allowed": False,
                "modification_allowed": True,
                "change_notice_period": "30 days",
                "breaking_change_policy": "Semantic versioning, backward compatible for minor versions",
                "deprecation_policy": "60 days notice, migration support provided"
            },
            
            "consumers": [
                {
                    "name": "Port Operations",
                    "team": "Harbor Master",
                    "domain": "port",
                    "email": "admin@port.om",
                    "use_cases": ["Berth planning", "Vessel coordination"],
                    "approved_date": "2025-01-12",
                    "access_level": "read"
                },
                {
                    "name": "EPC Installation Team",
                    "team": "Site Operations",
                    "domain": "epc",
                    "email": "site@hydrogen.om",
                    "use_cases": ["Delivery scheduling", "Component tracking"],
                    "approved_date": "2025-01-18",
                    "access_level": "read"
                }
            ],
            
            "effective_date": "2025-01-12",
            "expiry_date": None,
            "created_at": "2025-01-12T10:00:00Z"
        },
        {
            "id": "dc3",
            "contract_name": "Site Readiness Contract",
            "version": "2.1.0",
            "status": "active",
            "data_product_id": "dp3",
            "description": "Contract for Site Readiness data product with installation status and capacity information",
            
            "provider": {
                "name": "EPC Site Manager",
                "email": "site@hydrogen.om",
                "team": "Site Engineering",
                "domain": "epc",
                "output_port": "api://data.hydrogen.om/api/sites/readiness"
            },
            
            "dataset": {
                "name": "Site Readiness Status",
                "description": "Current readiness status of hydrogen installation sites including infrastructure, capacity, and expected equipment. Critical for delivery scheduling and installation planning.",
                "domain": "epc",
                "dataset_type": "source-aligned"
            },
            
            "schema_fields": [
                {
                    "name": "site_id",
                    "data_type": "string",
                    "description": "Unique identifier for the installation site",
                    "business_term": "Site Identifier",
                    "example": "DUQM-H2-SITE-01",
                    "format": "^[A-Z]{4}-H2-SITE-[0-9]{2}$",
                    "required": True,
                    "nullable": False,
                    "unique": True,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["identifier", "site"]
                },
                {
                    "name": "site_name",
                    "data_type": "string",
                    "description": "Human-readable name of the site",
                    "business_term": "Site Name",
                    "example": "Duqm Green Hydrogen Plant",
                    "format": None,
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "public",
                    "constraints": [],
                    "tags": ["name", "site"]
                },
                {
                    "name": "readiness_status",
                    "data_type": "enum",
                    "description": "Current site readiness status for equipment installation",
                    "business_term": "Readiness Status",
                    "example": "ready",
                    "format": "enum(ready,preparing,installing,commissioning,offline)",
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["status", "readiness"]
                },
                {
                    "name": "expected_component",
                    "data_type": "string",
                    "description": "Next expected component delivery",
                    "business_term": "Expected Component",
                    "example": "Electrolyzer Stack Unit 3",
                    "format": None,
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": [],
                    "tags": ["component", "delivery"]
                },
                {
                    "name": "capacity_mw",
                    "data_type": "float",
                    "description": "Site capacity in megawatts",
                    "business_term": "Site Capacity",
                    "example": "100.5",
                    "format": "decimal(5,1)",
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": False,
                    "is_pii": False,
                    "classification": "internal",
                    "constraints": ["Must be positive"],
                    "tags": ["capacity", "power"]
                },
                {
                    "name": "gps_coordinates",
                    "data_type": "object",
                    "description": "Site GPS coordinates",
                    "business_term": "Location Coordinates",
                    "example": "{lat: 19.67, lon: 57.71}",
                    "format": "geo_point",
                    "required": True,
                    "nullable": False,
                    "unique": False,
                    "sensitive": True,
                    "is_pii": False,
                    "classification": "restricted",
                    "constraints": ["Valid lat/lon range"],
                    "tags": ["location", "geo"]
                }
            ],
            
            "quality": {
                "freshness_slo": "1 hour",
                "freshness_description": "Site status updated hourly from SCADA systems and manual reporting",
                "expected_row_count_min": 3,
                "expected_row_count_max": 20,
                "completeness_threshold": 97.0,
                "accuracy_threshold": 99.0,
                "validity_rules": [
                    "site_id must be unique and follow naming convention",
                    "capacity_mw must be positive",
                    "GPS coordinates must be within Oman boundaries"
                ],
                "data_quality_checks": [
                    "Site ID format validation",
                    "Geographic boundary check",
                    "Status transition validation",
                    "Capacity range check"
                ]
            },
            
            "slo": {
                "availability": "98.5%",
                "availability_description": "Measured monthly, API endpoint availability",
                "latency_p95": "300ms",
                "latency_p99": "800ms",
                "throughput": "30 requests/second",
                "support_hours": "Business hours (08:00-18:00 UTC+4), on-call for critical",
                "response_time_critical": "4 hours",
                "response_time_normal": "72 hours",
                "maintenance_window": "Sundays 04:00-06:00 UTC",
                "incident_notification": "Email to registered consumers"
            },
            
            "billing": {
                "pricing_model": "free",
                "cost_per_query": None,
                "monthly_subscription": None,
                "free_tier_limit": "Unlimited for Oman Hydrogen partners",
                "billing_contact": "finance@hydrogen.om",
                "billing_cycle": "N/A",
                "currency": "OMR",
                "cost_center": "EPC-SITES-003"
            },
            
            "terms": {
                "usage_restrictions": [
                    "GPS coordinates restricted to delivery planning only",
                    "No public disclosure of site locations",
                    "Capacity data for internal planning only"
                ],
                "allowed_purposes": [
                    "Delivery scheduling",
                    "Installation planning",
                    "Capacity planning",
                    "Operational dashboards"
                ],
                "retention_period": "5 years",
                "data_residency": "Oman",
                "licensing": "Oman Hydrogen Data Ecosystem License v1.0",
                "attribution_required": False,
                "redistribution_allowed": False,
                "modification_allowed": False,
                "change_notice_period": "60 days",
                "breaking_change_policy": "60 days notice for schema changes, parallel API versions",
                "deprecation_policy": "120 days notice, full migration support"
            },
            
            "consumers": [
                {
                    "name": "Fleet Logistics",
                    "team": "Transport Planning",
                    "domain": "fleet",
                    "email": "fleet@asyad.om",
                    "use_cases": ["Delivery routing", "Schedule optimization"],
                    "approved_date": "2025-01-08",
                    "access_level": "read"
                },
                {
                    "name": "Port Authority",
                    "team": "Operations",
                    "domain": "port",
                    "email": "admin@port.om",
                    "use_cases": ["Berth allocation", "Vessel scheduling"],
                    "approved_date": "2025-01-10",
                    "access_level": "read"
                }
            ],
            
            "effective_date": "2025-01-08",
            "expiry_date": None,
            "created_at": "2025-01-08T10:00:00Z"
        }
    ]
    await db.data_contracts.insert_many(data_contracts)
    print(f"Created {len(data_contracts)} enhanced data contracts")
    
    # ============================================
    # DATA AS A PRODUCT - Quality Metrics
    # ============================================
    await db.quality_metrics.delete_many({})
    
    quality_metrics = [
        {
            "id": "qm1",
            "data_product_id": "dp1",
            "metric_type": "availability",
            "value": 99.7,
            "threshold": 99.5,
            "status": "healthy",
            "measured_at": "2025-01-15T12:00:00Z"
        },
        {
            "id": "qm2",
            "data_product_id": "dp1",
            "metric_type": "freshness",
            "value": 12.5,
            "threshold": 15.0,
            "status": "healthy",
            "measured_at": "2025-01-15T12:00:00Z"
        },
        {
            "id": "qm3",
            "data_product_id": "dp2",
            "metric_type": "availability",
            "value": 98.2,
            "threshold": 99.0,
            "status": "warning",
            "measured_at": "2025-01-15T12:00:00Z"
        },
        {
            "id": "qm4",
            "data_product_id": "dp2",
            "metric_type": "accuracy",
            "value": 99.8,
            "threshold": 99.5,
            "status": "healthy",
            "measured_at": "2025-01-15T12:00:00Z"
        },
        {
            "id": "qm5",
            "data_product_id": "dp3",
            "metric_type": "completeness",
            "value": 96.5,
            "threshold": 97.0,
            "status": "warning",
            "measured_at": "2025-01-15T12:00:00Z"
        }
    ]
    await db.quality_metrics.insert_many(quality_metrics)
    print(f"Created {len(quality_metrics)} quality metrics")
    
    # ============================================
    # DATA AS A PRODUCT - Data Lineage
    # ============================================
    await db.data_lineages.delete_many({})
    
    data_lineages = [
        {
            "id": "dl1",
            "source_product_id": "dp1",
            "target_product_id": "dp2",
            "relationship_type": "feeds",
            "transformation_description": "Vessel data enriches shipment tracking with arrival information"
        },
        {
            "id": "dl2",
            "source_product_id": "dp2",
            "target_product_id": "dp3",
            "relationship_type": "triggers",
            "transformation_description": "Shipment status updates trigger site readiness checks"
        },
        {
            "id": "dl3",
            "source_product_id": "dp4",
            "target_product_id": "dp5",
            "relationship_type": "requires",
            "transformation_description": "Route planning requires permit validation"
        }
    ]
    await db.data_lineages.insert_many(data_lineages)
    print(f"Created {len(data_lineages)} data lineages")
    
    # ============================================
    # SELF-SERVE PLATFORM - Platform Capabilities
    # ============================================
    await db.platform_capabilities.delete_many({})
    
    platform_capabilities = [
        {
            "id": "pc1",
            "name": "Data Product Builder",
            "category": "Creation",
            "description": "Low-code tool for domain teams to create and publish data products",
            "features": ["Schema designer", "API endpoint generator", "Documentation auto-generation", "Version management"],
            "status": "active",
            "usage_count": 45
        },
        {
            "id": "pc2",
            "name": "Data Catalog Explorer",
            "category": "Discovery",
            "description": "Search and discover data products across all domains",
            "features": ["Full-text search", "Tag filtering", "Schema preview", "Consumer tracking"],
            "status": "active",
            "usage_count": 128
        },
        {
            "id": "pc3",
            "name": "Quality Monitor",
            "category": "Observability",
            "description": "Real-time monitoring of data product quality metrics",
            "features": ["SLA tracking", "Freshness alerts", "Accuracy monitoring", "Trend analysis"],
            "status": "active",
            "usage_count": 67
        },
        {
            "id": "pc4",
            "name": "Contract Manager",
            "category": "Governance",
            "description": "Create and manage data contracts with versioning",
            "features": ["Contract templates", "Version control", "Breaking change detection", "Consumer notifications"],
            "status": "active",
            "usage_count": 23
        },
        {
            "id": "pc5",
            "name": "Lineage Visualizer",
            "category": "Observability",
            "description": "Visual representation of data flow across domains",
            "features": ["Interactive graph", "Impact analysis", "Dependency tracking", "Change propagation"],
            "status": "active",
            "usage_count": 34
        },
        {
            "id": "pc6",
            "name": "Access Control Manager",
            "category": "Security",
            "description": "Configure and manage data access policies",
            "features": ["ABAC policies", "Role management", "Audit logging", "Field-level security"],
            "status": "active",
            "usage_count": 19
        }
    ]
    await db.platform_capabilities.insert_many(platform_capabilities)
    print(f"Created {len(platform_capabilities)} platform capabilities")
    
    # ============================================
    # FEDERATED GOVERNANCE - Compliance Rules
    # ============================================
    await db.compliance_rules.delete_many({})
    
    compliance_rules = [
        {
            "id": "cr1",
            "rule_name": "Data Retention Policy",
            "standard": "Oman Data Protection",
            "description": "All operational data must have defined retention periods",
            "severity": "high",
            "applicable_domains": ["port", "fleet", "epc", "logistics"],
            "validation_logic": "contract.retention_period IS NOT NULL AND contract.retention_period >= '1 year'",
            "status": "active"
        },
        {
            "id": "cr2",
            "rule_name": "Schema Documentation",
            "standard": "IDS",
            "description": "All data products must have complete schema documentation",
            "severity": "medium",
            "applicable_domains": ["port", "fleet", "epc", "logistics"],
            "validation_logic": "product.schema_fields.length > 0 AND product.description IS NOT NULL",
            "status": "active"
        },
        {
            "id": "cr3",
            "rule_name": "Quality SLA Compliance",
            "standard": "Gaia-X",
            "description": "Data products must meet minimum quality thresholds",
            "severity": "high",
            "applicable_domains": ["port", "fleet", "epc"],
            "validation_logic": "metric.value >= metric.threshold",
            "status": "active"
        },
        {
            "id": "cr4",
            "rule_name": "Access Policy Required",
            "standard": "ABAC",
            "description": "Every domain must have explicit access policies defined",
            "severity": "critical",
            "applicable_domains": ["port", "fleet", "epc", "logistics"],
            "validation_logic": "policy.allowed_domains.length > 0 AND policy.allowed_roles.length > 0",
            "status": "active"
        }
    ]
    await db.compliance_rules.insert_many(compliance_rules)
    print(f"Created {len(compliance_rules)} compliance rules")
    
    # ============================================
    # FEDERATED GOVERNANCE - Interoperability Standards
    # ============================================
    await db.interop_standards.delete_many({})
    
    interop_standards = [
        {
            "id": "is1",
            "name": "International Data Spaces (IDS)",
            "version": "4.0",
            "description": "Reference architecture for secure, sovereign data exchange",
            "supported_domains": ["port", "fleet", "logistics"],
            "compliance_level": "Full",
            "certification_date": "2024-11-15"
        },
        {
            "id": "is2",
            "name": "Gaia-X",
            "version": "22.10",
            "description": "European data infrastructure framework for trustworthy data ecosystems",
            "supported_domains": ["port", "fleet", "epc", "logistics"],
            "compliance_level": "Partial",
            "certification_date": "2024-09-20"
        },
        {
            "id": "is3",
            "name": "Oman National Data Standards",
            "version": "1.0",
            "description": "National standards for government and industrial data exchange",
            "supported_domains": ["port", "fleet", "epc", "logistics"],
            "compliance_level": "Full",
            "certification_date": "2025-01-01"
        },
        {
            "id": "is4",
            "name": "OpenAPI Specification",
            "version": "3.1.0",
            "description": "Standard for API documentation and interoperability",
            "supported_domains": ["port", "fleet", "epc", "logistics"],
            "compliance_level": "Full",
            "certification_date": None
        }
    ]
    await db.interop_standards.insert_many(interop_standards)
    print(f"Created {len(interop_standards)} interoperability standards")
    
    print("Database seeding completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
