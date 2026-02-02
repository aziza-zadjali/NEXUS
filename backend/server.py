from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SECRET_KEY = os.environ.get('JWT_SECRET', 'datamesh_secret_key_change_in_production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    domain: str
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    domain: str
    role: str = "viewer"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class VesselData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vessel_id: str
    vessel_name: str
    status: str
    berth_number: Optional[str] = None
    eta: Optional[str] = None
    cargo_type: str
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShipmentData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shipment_id: str
    vessel_id: str
    component_type: str
    status: str
    destination_site: str
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SiteData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str
    site_name: str
    readiness_status: str
    expected_component: str
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DataProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    domain: str
    description: str
    data_type: str
    endpoint: str
    schema_fields: List[str]
    update_frequency: str
    owner_email: str
    tags: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SemanticMapping(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_domain: str
    source_field: str
    target_standard: str
    target_field: str
    description: str

class AccessPolicy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    resource_domain: str
    allowed_domains: List[str]
    allowed_roles: List[str]
    data_fields_visible: List[str]

class EventLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str
    domain: str
    resource_id: str
    description: str
    triggered_actions: List[str]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Route(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    route_name: str
    origin: str
    destination: str
    transport_mode: str
    distance_km: float
    estimated_duration_hours: float
    road_restrictions: List[str]
    status: str
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Permit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    permit_number: str
    permit_type: str
    shipment_id: str
    issuing_authority: str
    status: str
    requested_date: str
    approved_date: Optional[str] = None
    expiry_date: Optional[str] = None
    restrictions: List[str]

class WeatherForecast(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location: str
    forecast_date: str
    temperature_celsius: float
    wind_speed_kmh: float
    weather_condition: str
    visibility_km: float
    safe_for_transport: bool

class AssemblyArea(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    area_name: str
    area_type: str
    location: str
    capacity: int
    current_occupancy: int
    available_space: int
    status: str
    components_stored: List[str]

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

@api_router.get("/")
async def root():
    return {"message": "Oman National Hydrogen Data Mesh API"}

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_data.password)
    user_dict = user_data.model_dump()
    user_dict.pop('password')
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['password'] = hashed_password
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user['email'], "domain": user['domain']})
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    user_obj = User(**{k: v for k, v in user.items() if k != 'password'})
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/port/vessels", response_model=List[VesselData])
async def get_vessels(current_user: User = Depends(get_current_user)):
    vessels = await db.port_vessels.find({}, {"_id": 0}).to_list(100)
    for vessel in vessels:
        if isinstance(vessel.get('last_updated'), str):
            vessel['last_updated'] = datetime.fromisoformat(vessel['last_updated'])
    return vessels

@api_router.post("/port/vessels", response_model=VesselData)
async def create_vessel(vessel_data: VesselData, current_user: User = Depends(get_current_user)):
    if current_user.domain != "port" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doc = vessel_data.model_dump()
    doc['last_updated'] = doc['last_updated'].isoformat()
    await db.port_vessels.insert_one(doc)
    
    await log_event("vessel_update", "port", vessel_data.id, 
                    f"Vessel {vessel_data.vessel_name} status: {vessel_data.status}",
                    ["notify_fleet"])
    
    return vessel_data

@api_router.get("/fleet/shipments", response_model=List[ShipmentData])
async def get_shipments(current_user: User = Depends(get_current_user)):
    shipments = await db.fleet_shipments.find({}, {"_id": 0}).to_list(100)
    for shipment in shipments:
        if isinstance(shipment.get('last_updated'), str):
            shipment['last_updated'] = datetime.fromisoformat(shipment['last_updated'])
    return shipments

@api_router.post("/fleet/shipments", response_model=ShipmentData)
async def create_shipment(shipment_data: ShipmentData, current_user: User = Depends(get_current_user)):
    if current_user.domain != "fleet" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doc = shipment_data.model_dump()
    doc['last_updated'] = doc['last_updated'].isoformat()
    await db.fleet_shipments.insert_one(doc)
    
    await log_event("shipment_update", "fleet", shipment_data.id,
                    f"Shipment {shipment_data.shipment_id} status: {shipment_data.status}",
                    ["notify_site", "check_readiness"])
    
    return shipment_data

@api_router.get("/epc/sites", response_model=List[SiteData])
async def get_sites(current_user: User = Depends(get_current_user)):
    sites = await db.epc_sites.find({}, {"_id": 0}).to_list(100)
    for site in sites:
        if isinstance(site.get('last_updated'), str):
            site['last_updated'] = datetime.fromisoformat(site['last_updated'])
    return sites

@api_router.post("/epc/sites", response_model=SiteData)
async def create_site(site_data: SiteData, current_user: User = Depends(get_current_user)):
    if current_user.domain != "epc" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doc = site_data.model_dump()
    doc['last_updated'] = doc['last_updated'].isoformat()
    await db.epc_sites.insert_one(doc)
    
    await log_event("site_update", "epc", site_data.id,
                    f"Site {site_data.site_name} readiness: {site_data.readiness_status}",
                    ["notify_fleet", "enable_shipping"])
    
    return site_data

@api_router.get("/catalog/products", response_model=List[DataProduct])
async def get_data_products(current_user: User = Depends(get_current_user)):
    products = await db.data_catalog.find({}, {"_id": 0}).to_list(100)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products

@api_router.post("/catalog/products", response_model=DataProduct)
async def create_data_product(product_data: DataProduct, current_user: User = Depends(get_current_user)):
    doc = product_data.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.data_catalog.insert_one(doc)
    return product_data

@api_router.get("/governance/mappings", response_model=List[SemanticMapping])
async def get_mappings(current_user: User = Depends(get_current_user)):
    mappings = await db.semantic_mappings.find({}, {"_id": 0}).to_list(100)
    return mappings

@api_router.post("/governance/mappings", response_model=SemanticMapping)
async def create_mapping(mapping_data: SemanticMapping, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    doc = mapping_data.model_dump()
    await db.semantic_mappings.insert_one(doc)
    return mapping_data

@api_router.get("/governance/policies", response_model=List[AccessPolicy])
async def get_policies(current_user: User = Depends(get_current_user)):
    policies = await db.access_policies.find({}, {"_id": 0}).to_list(100)
    return policies

@api_router.post("/governance/policies", response_model=AccessPolicy)
async def create_policy(policy_data: AccessPolicy, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    doc = policy_data.model_dump()
    await db.access_policies.insert_one(doc)
    return policy_data

@api_router.get("/events", response_model=List[EventLog])
async def get_events(current_user: User = Depends(get_current_user)):
    events = await db.event_logs.find({}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    for event in events:
        if isinstance(event.get('timestamp'), str):
            event['timestamp'] = datetime.fromisoformat(event['timestamp'])
    return events

async def log_event(event_type: str, domain: str, resource_id: str, description: str, triggered_actions: List[str]):
    event = EventLog(
        event_type=event_type,
        domain=domain,
        resource_id=resource_id,
        description=description,
        triggered_actions=triggered_actions
    )
    doc = event.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.event_logs.insert_one(doc)

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    vessels_count = await db.port_vessels.count_documents({})
    shipments_count = await db.fleet_shipments.count_documents({})
    sites_count = await db.epc_sites.count_documents({})
    products_count = await db.data_catalog.count_documents({})
    routes_count = await db.logistics_routes.count_documents({})
    permits_count = await db.logistics_permits.count_documents({})
    
    vessels_in_port = await db.port_vessels.count_documents({"status": "berthed"})
    shipments_in_transit = await db.fleet_shipments.count_documents({"status": "in_transit"})
    sites_ready = await db.epc_sites.count_documents({"readiness_status": "ready"})
    permits_pending = await db.logistics_permits.count_documents({"status": "pending"})
    
    return {
        "total_vessels": vessels_count,
        "vessels_in_port": vessels_in_port,
        "total_shipments": shipments_count,
        "shipments_in_transit": shipments_in_transit,
        "total_sites": sites_count,
        "sites_ready": sites_ready,
        "data_products": products_count,
        "total_routes": routes_count,
        "total_permits": permits_count,
        "permits_pending": permits_pending
    }

@api_router.get("/logistics/routes", response_model=List[Route])
async def get_routes(current_user: User = Depends(get_current_user)):
    routes = await db.logistics_routes.find({}, {"_id": 0}).to_list(100)
    for route in routes:
        if isinstance(route.get('last_updated'), str):
            route['last_updated'] = datetime.fromisoformat(route['last_updated'])
    return routes

@api_router.post("/logistics/routes", response_model=Route)
async def create_route(route_data: Route, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin" and current_user.domain != "logistics":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doc = route_data.model_dump()
    doc['last_updated'] = doc['last_updated'].isoformat()
    await db.logistics_routes.insert_one(doc)
    
    await log_event("route_created", "logistics", route_data.id,
                    f"Route {route_data.route_name} created: {route_data.origin} to {route_data.destination}",
                    ["notify_fleet", "update_permits"])
    
    return route_data

@api_router.get("/logistics/permits", response_model=List[Permit])
async def get_permits(current_user: User = Depends(get_current_user)):
    permits = await db.logistics_permits.find({}, {"_id": 0}).to_list(100)
    return permits

@api_router.post("/logistics/permits", response_model=Permit)
async def create_permit(permit_data: Permit, current_user: User = Depends(get_current_user)):
    doc = permit_data.model_dump()
    await db.logistics_permits.insert_one(doc)
    
    await log_event("permit_requested", "logistics", permit_data.id,
                    f"Permit {permit_data.permit_number} requested for shipment {permit_data.shipment_id}",
                    ["notify_authority", "track_status"])
    
    return permit_data

@api_router.put("/logistics/permits/{permit_id}", response_model=Permit)
async def update_permit(permit_id: str, status: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    permit = await db.logistics_permits.find_one({"id": permit_id}, {"_id": 0})
    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")
    
    await db.logistics_permits.update_one(
        {"id": permit_id},
        {"$set": {"status": status, "approved_date": datetime.now(timezone.utc).isoformat() if status == "approved" else None}}
    )
    
    permit['status'] = status
    if status == "approved":
        permit['approved_date'] = datetime.now(timezone.utc).isoformat()
    
    await log_event("permit_updated", "logistics", permit_id,
                    f"Permit {permit['permit_number']} status changed to {status}",
                    ["notify_shipper", "enable_transport"])
    
    return Permit(**permit)

@api_router.get("/logistics/weather", response_model=List[WeatherForecast])
async def get_weather_forecasts(current_user: User = Depends(get_current_user)):
    forecasts = await db.weather_forecasts.find({}, {"_id": 0}).to_list(100)
    return forecasts

@api_router.post("/logistics/weather", response_model=WeatherForecast)
async def create_weather_forecast(forecast_data: WeatherForecast, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    doc = forecast_data.model_dump()
    await db.weather_forecasts.insert_one(doc)
    return forecast_data

@api_router.get("/logistics/assembly-areas", response_model=List[AssemblyArea])
async def get_assembly_areas(current_user: User = Depends(get_current_user)):
    areas = await db.assembly_areas.find({}, {"_id": 0}).to_list(100)
    return areas

@api_router.post("/logistics/assembly-areas", response_model=AssemblyArea)
async def create_assembly_area(area_data: AssemblyArea, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    doc = area_data.model_dump()
    await db.assembly_areas.insert_one(doc)
    
    await log_event("assembly_area_registered", "logistics", area_data.id,
                    f"Assembly area {area_data.area_name} registered with capacity {area_data.capacity}",
                    ["update_inventory", "notify_logistics"])
    
    return area_data

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
