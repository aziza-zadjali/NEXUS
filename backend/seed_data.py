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
            "email": "admin@port.om",
            "password": pwd_context.hash("password123"),
            "name": "Port Authority Admin",
            "domain": "port",
            "role": "admin",
            "created_at": "2025-01-15T10:00:00Z"
        },
        {
            "id": "user2",
            "email": "fleet@asyad.om",
            "password": pwd_context.hash("password123"),
            "name": "Asyad Fleet Manager",
            "domain": "fleet",
            "role": "editor",
            "created_at": "2025-01-15T10:00:00Z"
        },
        {
            "id": "user3",
            "email": "site@hydrogen.om",
            "password": pwd_context.hash("password123"),
            "name": "EPC Site Coordinator",
            "domain": "epc",
            "role": "editor",
            "created_at": "2025-01-15T10:00:00Z"
        }
    ]
    await db.users.insert_many(users)
    print(f"Created {len(users)} users")
    
    vessels = [
        {
            "id": "v1",
            "vessel_id": "DQM-V001",
            "vessel_name": "Hydrogen Pioneer",
            "status": "berthed",
            "berth_number": "B-12",
            "eta": "2025-01-20T08:00:00Z",
            "cargo_type": "turbine_blades",
            "last_updated": "2025-01-15T12:00:00Z"
        },
        {
            "id": "v2",
            "vessel_id": "DQM-V002",
            "vessel_name": "Green Energy Carrier",
            "status": "approaching",
            "berth_number": "",
            "eta": "2025-01-22T14:00:00Z",
            "cargo_type": "nacelles",
            "last_updated": "2025-01-15T12:00:00Z"
        },
        {
            "id": "v3",
            "vessel_id": "SAL-V103",
            "vessel_name": "Wind Turbine Express",
            "status": "unloading",
            "berth_number": "B-7",
            "eta": "2025-01-15T06:00:00Z",
            "cargo_type": "tower_sections",
            "last_updated": "2025-01-15T14:00:00Z"
        }
    ]
    await db.port_vessels.insert_many(vessels)
    print(f"Created {len(vessels)} vessels")
    
    shipments = [
        {
            "id": "s1",
            "shipment_id": "SHP-2025-001",
            "vessel_id": "DQM-V001",
            "component_type": "turbine_blade",
            "status": "at_port",
            "destination_site": "Duqm Hydrogen Hub A",
            "last_updated": "2025-01-15T12:00:00Z"
        },
        {
            "id": "s2",
            "shipment_id": "SHP-2025-002",
            "vessel_id": "DQM-V002",
            "component_type": "nacelle",
            "status": "in_transit",
            "destination_site": "Duqm Hydrogen Hub B",
            "last_updated": "2025-01-15T12:00:00Z"
        },
        {
            "id": "s3",
            "shipment_id": "SHP-2025-003",
            "vessel_id": "SAL-V103",
            "component_type": "tower_section",
            "status": "at_port",
            "destination_site": "Duqm Hydrogen Hub A",
            "last_updated": "2025-01-15T14:00:00Z"
        }
    ]
    await db.fleet_shipments.insert_many(shipments)
    print(f"Created {len(shipments)} shipments")
    
    sites = [
        {
            "id": "site1",
            "site_id": "DHH-A",
            "site_name": "Duqm Hydrogen Hub A",
            "readiness_status": "ready",
            "expected_component": "turbine_blade",
            "last_updated": "2025-01-15T12:00:00Z"
        },
        {
            "id": "site2",
            "site_id": "DHH-B",
            "site_name": "Duqm Hydrogen Hub B",
            "readiness_status": "preparing",
            "expected_component": "nacelle",
            "last_updated": "2025-01-15T12:00:00Z"
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
    
    assembly_areas = [
        {
            "id": "area1",
            "area_name": "Main Assembly Area - Duqm",
            "area_type": "Primary",
            "location": "Duqm Special Economic Zone",
            "capacity": 50,
            "current_occupancy": 32,
            "available_space": 18,
            "status": "available",
            "components_stored": ["Turbine Blades (12)", "Tower Sections (8)", "Nacelles (12)"]
        },
        {
            "id": "area2",
            "area_name": "Secondary Assembly - Salalah",
            "area_type": "Secondary",
            "location": "Port of Salalah Free Zone",
            "capacity": 30,
            "current_occupancy": 18,
            "available_space": 12,
            "status": "available",
            "components_stored": ["Generators (6)", "Control Systems (12)"]
        },
        {
            "id": "area3",
            "area_name": "Staging Area - Hub B",
            "area_type": "Staging",
            "location": "Near Duqm Hydrogen Hub B",
            "capacity": 20,
            "current_occupancy": 19,
            "available_space": 1,
            "status": "full",
            "components_stored": ["Tower Sections (15)", "Cables (4)"]
        }
    ]
    await db.assembly_areas.insert_many(assembly_areas)
    print(f"Created {len(assembly_areas)} assembly areas")
    
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
    
    data_contracts = [
        {
            "id": "dc1",
            "data_product_id": "dp1",
            "version": "1.2.0",
            "owner": "admin@port.om",
            "description": "Contract for Vessel Status API with guaranteed SLAs",
            "schema_definition": {
                "vessel_id": {"type": "string", "required": True},
                "vessel_name": {"type": "string", "required": True},
                "status": {"type": "enum", "values": ["berthed", "approaching", "departing", "unloading"]},
                "berth_number": {"type": "string", "required": False},
                "eta": {"type": "datetime", "required": False}
            },
            "quality_sla": {
                "availability": "99.5%",
                "freshness": "15 minutes",
                "accuracy": "99.9%",
                "completeness": "98%"
            },
            "terms_of_use": "Data can be used for operational planning and logistics coordination. Attribution required.",
            "update_frequency": "15min",
            "retention_period": "2 years",
            "created_at": "2025-01-10T10:00:00Z"
        },
        {
            "id": "dc2",
            "data_product_id": "dp2",
            "version": "1.0.0",
            "owner": "fleet@asyad.om",
            "description": "Contract for Shipment Tracking API with delivery guarantees",
            "schema_definition": {
                "shipment_id": {"type": "string", "required": True},
                "vessel_id": {"type": "string", "required": True},
                "component_type": {"type": "string", "required": True},
                "status": {"type": "enum", "values": ["at_port", "in_transit", "delivered", "pending"]},
                "destination_site": {"type": "string", "required": True}
            },
            "quality_sla": {
                "availability": "99.0%",
                "freshness": "30 minutes",
                "accuracy": "99.5%",
                "completeness": "95%"
            },
            "terms_of_use": "Data for supply chain coordination. Notify consumers of breaking changes 30 days in advance.",
            "update_frequency": "30min",
            "retention_period": "3 years",
            "created_at": "2025-01-12T10:00:00Z"
        },
        {
            "id": "dc3",
            "data_product_id": "dp3",
            "version": "2.1.0",
            "owner": "site@hydrogen.om",
            "description": "Contract for Site Readiness API with installation status",
            "schema_definition": {
                "site_id": {"type": "string", "required": True},
                "site_name": {"type": "string", "required": True},
                "readiness_status": {"type": "enum", "values": ["ready", "preparing", "installing", "offline"]},
                "expected_component": {"type": "string", "required": True}
            },
            "quality_sla": {
                "availability": "98.5%",
                "freshness": "1 hour",
                "accuracy": "99.0%",
                "completeness": "97%"
            },
            "terms_of_use": "Data for delivery scheduling. Changes to schema require 60 days notice.",
            "update_frequency": "1hour",
            "retention_period": "5 years",
            "created_at": "2025-01-08T10:00:00Z"
        }
    ]
    await db.data_contracts.insert_many(data_contracts)
    print(f"Created {len(data_contracts)} data contracts")
    
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
