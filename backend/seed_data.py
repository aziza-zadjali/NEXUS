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
        }
    ]
    await db.event_logs.insert_many(events)
    print(f"Created {len(events)} event logs")
    
    print("Database seeding completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
