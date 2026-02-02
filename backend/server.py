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
    capacity_mw: Optional[int] = None
    turbines_planned: Optional[int] = None
    turbines_installed: Optional[int] = None
    contractor: Optional[str] = None
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

# ============================================
# DATA PRODUCT CANVAS - Full Implementation
# ============================================

class OutputPort(BaseModel):
    model_config = ConfigDict(extra="ignore")
    format: str  # S3, Parquet, Delta, topic, schema, table, dashboard
    protocol: str  # REST, gRPC, SQL, Stream
    location: str  # URL or path
    description: str

class InputPort(BaseModel):
    model_config = ConfigDict(extra="ignore")
    source_type: str  # operational_system, data_product
    source_name: str
    source_domain: str
    format: str
    protocol: str
    description: str

class DataModelField(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    data_type: str
    description: str
    constraints: List[str]
    is_pii: bool = False
    is_business_key: bool = False
    is_join_key: bool = False

class QualityCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    check_name: str
    check_type: str  # uniqueness, consistency, freshness, completeness, validity
    expression: str
    threshold: Optional[float] = None
    description: str

class SLADefinition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    availability: str
    support_hours: str
    retention_period: str
    backup_frequency: str
    response_time: str

class SecurityDefinition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    access_level: str  # public, internal, restricted, confidential
    approval_required: bool
    allowed_roles: List[str]
    allowed_domains: List[str]
    pii_handling: str

class DataProductArchitecture(BaseModel):
    model_config = ConfigDict(extra="ignore")
    processing_type: str  # streaming, batch, hybrid
    framework: str  # dbt, Databricks, Spark, Java
    storage_type: str  # tables, files, topic
    query_engine: str  # SQL, Python, Notebook
    transformation_steps: List[str]
    scheduling_tool: str  # CI/CD, Airflow, Soda
    monitoring_tool: str
    estimated_cost: Optional[str] = None

class UseCase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    description: str
    business_objective: str
    success_metrics: List[str]

class Consumer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    domain: str
    role: str
    use_cases: List[str]

class DataProductCanvas(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Basic Info
    name: str
    domain: str
    owner_name: str
    owner_email: str
    date: str
    version: str
    description: str
    
    # Classification
    classification: str  # source-aligned, aggregate, consumer-aligned
    
    # Consumers and Use Cases
    consumers: List[Consumer]
    use_cases: List[UseCase]
    
    # Data Contract
    output_ports: List[OutputPort]
    terms: str
    data_model: List[DataModelField]
    quality_checks: List[QualityCheck]
    sla: SLADefinition
    security: SecurityDefinition
    
    # Sources
    input_ports: List[InputPort]
    
    # Architecture
    architecture: DataProductArchitecture
    
    # Ubiquitous Language
    ubiquitous_language: Dict[str, str]
    
    # Metadata
    status: str = "draft"  # draft, active, deprecated
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    follow_up_actions: List[str] = []
    follow_up_date: Optional[str] = None

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

# ============================================
# ENHANCED DATA CONTRACT - Based on Data Contract Specification
# ============================================

class ContractProvider(BaseModel):
    """Data Product Provider information"""
    model_config = ConfigDict(extra="ignore")
    name: str  # Owner name
    email: str  # Owner email
    team: str  # Team/department responsible
    domain: str  # Domain the provider belongs to
    output_port: str  # Reference to output port to access data

class ContractDataset(BaseModel):
    """Dataset information"""
    model_config = ConfigDict(extra="ignore")
    name: str  # Dataset name
    description: str  # What the data represents
    domain: str  # Business domain
    dataset_type: str  # source, aggregate, consumer-aligned

class SchemaField(BaseModel):
    """Schema field with semantic information"""
    model_config = ConfigDict(extra="ignore")
    name: str
    data_type: str  # string, integer, float, boolean, datetime, etc.
    description: str  # What this field represents
    business_term: Optional[str] = None  # Business glossary term
    example: Optional[str] = None  # Example value
    format: Optional[str] = None  # date format, regex pattern, etc.
    required: bool = True
    nullable: bool = False
    unique: bool = False
    sensitive: bool = False
    is_pii: bool = False
    classification: Optional[str] = None  # public, internal, confidential, restricted
    constraints: List[str] = []  # Validation rules
    tags: List[str] = []

class ContractQuality(BaseModel):
    """Quality attributes"""
    model_config = ConfigDict(extra="ignore")
    freshness_slo: str  # e.g., "15 minutes", "daily at 6am UTC"
    freshness_description: str  # What freshness means for this data
    expected_row_count_min: Optional[int] = None
    expected_row_count_max: Optional[int] = None
    completeness_threshold: float  # e.g., 99.5 (percentage)
    accuracy_threshold: float  # e.g., 99.9 (percentage)
    validity_rules: List[str] = []  # Business validation rules
    data_quality_checks: List[str] = []  # Automated checks performed

class ContractSLO(BaseModel):
    """Service Level Objectives"""
    model_config = ConfigDict(extra="ignore")
    availability: str  # e.g., "99.9%"
    availability_description: str  # What counts as available
    latency_p95: Optional[str] = None  # 95th percentile response time
    latency_p99: Optional[str] = None  # 99th percentile response time
    throughput: Optional[str] = None  # Requests per second
    support_hours: str  # e.g., "24x7", "Business hours UTC+4"
    response_time_critical: str  # Response time for critical issues
    response_time_normal: str  # Response time for normal issues
    maintenance_window: Optional[str] = None  # Scheduled maintenance
    incident_notification: str  # How consumers are notified

class ContractBilling(BaseModel):
    """Billing details for data usage"""
    model_config = ConfigDict(extra="ignore")
    pricing_model: str  # free, per-query, subscription, tiered
    cost_per_query: Optional[str] = None  # e.g., "$0.001"
    monthly_subscription: Optional[str] = None  # e.g., "$500/month"
    free_tier_limit: Optional[str] = None  # e.g., "10,000 queries/month"
    billing_contact: str
    billing_cycle: str  # monthly, quarterly, annual
    currency: str = "USD"
    cost_center: Optional[str] = None

class ContractTerms(BaseModel):
    """Terms and conditions of data usage"""
    model_config = ConfigDict(extra="ignore")
    usage_restrictions: List[str]  # What consumers cannot do
    allowed_purposes: List[str]  # What data can be used for
    retention_period: str  # How long consumers can retain data
    data_residency: Optional[str] = None  # Geographic restrictions
    licensing: str  # License type
    attribution_required: bool = False
    redistribution_allowed: bool = False
    modification_allowed: bool = False
    change_notice_period: str  # e.g., "30 days"
    breaking_change_policy: str  # How breaking changes are handled
    deprecation_policy: str  # How deprecation is communicated

class ContractConsumer(BaseModel):
    """Consumer information"""
    model_config = ConfigDict(extra="ignore")
    name: str
    team: str
    domain: str
    email: str
    use_cases: List[str]
    approved_date: str
    access_level: str  # read, write, admin

class DataContract(BaseModel):
    """Enhanced Data Contract based on Data Contract Specification"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Contract metadata
    contract_name: str
    version: str
    status: str = "draft"  # draft, active, deprecated
    
    # Provider section
    provider: ContractProvider
    
    # Dataset info
    dataset: ContractDataset
    
    # Schema with semantics
    schema_fields: List[SchemaField]
    
    # Quality attributes
    quality: ContractQuality
    
    # Service level objectives
    slo: ContractSLO
    
    # Billing details
    billing: Optional[ContractBilling] = None
    
    # Terms and conditions
    terms: ContractTerms
    
    # Consumers
    consumers: List[ContractConsumer] = []
    
    # Legacy fields for backward compatibility
    data_product_id: Optional[str] = None
    description: Optional[str] = None
    
    # Timestamps
    effective_date: Optional[str] = None
    expiry_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

class DomainJourney(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    domain_name: str
    current_level: int
    level_description: str
    data_products_published: int
    data_products_consumed: int
    journey_started: str
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QualityMetric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    data_product_id: str
    metric_type: str
    value: float
    threshold: float
    status: str
    measured_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DataLineage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_product_id: str
    target_product_id: str
    relationship_type: str
    transformation_description: str

class PlatformCapability(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    description: str
    features: List[str]
    status: str
    usage_count: int = 0

class ComplianceRule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rule_name: str
    standard: str
    description: str
    severity: str
    applicable_domains: List[str]
    validation_logic: str
    status: str

class InteroperabilityStandard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    version: str
    description: str
    supported_domains: List[str]
    compliance_level: str
    certification_date: Optional[str] = None

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

# ============================================
# TAG TEMPLATES API - Based on Google Cloud Data Mesh Demo
# ============================================

@api_router.get("/catalog/tag-templates")
async def get_tag_templates(current_user: User = Depends(get_current_user)):
    """Get all data catalog tag templates for data mesh governance"""
    # Return standardized tag templates based on Google Cloud Data Mesh patterns
    templates = [
        {
            "id": "tt-data-product",
            "template_type": "data_product",
            "display_name": "Data Product",
            "description": "Core metadata for data products in the mesh - identifies discoverable data assets",
            "fields": [
                {"name": "product_name", "display_name": "Product Name", "type": "string", "required": True, "order": 1},
                {"name": "data_product_description", "display_name": "Description", "type": "string", "required": True, "order": 2},
                {"name": "data_product_status", "display_name": "Status", "type": "enum", "values": ["DRAFT", "RELEASED", "DEPRECATED"], "required": True, "order": 3},
                {"name": "data_domain", "display_name": "Data Domain", "type": "enum", "values": ["Port", "Fleet", "EPC", "Logistics", "Analytics"], "required": True, "order": 4},
                {"name": "business_owner", "display_name": "Business Owner", "type": "string", "required": True, "order": 5},
                {"name": "technical_owner", "display_name": "Technical Owner", "type": "string", "required": True, "order": 6},
                {"name": "documentation_link", "display_name": "Documentation Link", "type": "string", "required": False, "order": 7},
                {"name": "access_request_link", "display_name": "Access Request Link", "type": "string", "required": False, "order": 8}
            ]
        },
        {
            "id": "tt-data-quality",
            "template_type": "data_quality",
            "display_name": "Data Quality SLA",
            "description": "Quality metrics and service level agreements for data products",
            "fields": [
                {"name": "freshness_sla", "display_name": "Freshness SLA", "type": "string", "required": True, "order": 1},
                {"name": "completeness_threshold", "display_name": "Completeness Threshold (%)", "type": "number", "required": True, "order": 2},
                {"name": "accuracy_threshold", "display_name": "Accuracy Threshold (%)", "type": "number", "required": True, "order": 3},
                {"name": "availability_sla", "display_name": "Availability SLA (%)", "type": "number", "required": False, "order": 4},
                {"name": "validation_rules", "display_name": "Validation Rules", "type": "string", "required": False, "order": 5}
            ]
        },
        {
            "id": "tt-streaming-topic",
            "template_type": "streaming_topic",
            "display_name": "Streaming Topic Details",
            "description": "Metadata for Pub/Sub streaming data products",
            "fields": [
                {"name": "schema_ref", "display_name": "Schema Reference", "type": "string", "required": True, "order": 1},
                {"name": "message_format", "display_name": "Message Format", "type": "enum", "values": ["JSON", "Avro", "Protobuf"], "required": True, "order": 2},
                {"name": "throughput", "display_name": "Expected Throughput", "type": "string", "required": False, "order": 3},
                {"name": "retention_period", "display_name": "Retention Period", "type": "string", "required": False, "order": 4},
                {"name": "partitioning_key", "display_name": "Partitioning Key", "type": "string", "required": False, "order": 5}
            ]
        },
        {
            "id": "tt-access-control",
            "template_type": "access_control",
            "display_name": "Access Control Policy",
            "description": "Access policies and permissions for data products",
            "fields": [
                {"name": "classification", "display_name": "Data Classification", "type": "enum", "values": ["Public", "Internal", "Confidential", "Restricted"], "required": True, "order": 1},
                {"name": "allowed_consumers", "display_name": "Allowed Consumers", "type": "string", "required": False, "order": 2},
                {"name": "column_level_security", "display_name": "Column-Level Security", "type": "boolean", "required": False, "order": 3},
                {"name": "row_level_security", "display_name": "Row-Level Security", "type": "boolean", "required": False, "order": 4},
                {"name": "pii_fields", "display_name": "PII Fields", "type": "string", "required": False, "order": 5}
            ]
        },
        {
            "id": "tt-lineage",
            "template_type": "lineage",
            "display_name": "Data Lineage",
            "description": "Tracks data origin, transformations, and dependencies",
            "fields": [
                {"name": "source_systems", "display_name": "Source Systems", "type": "string", "required": True, "order": 1},
                {"name": "transformation_logic", "display_name": "Transformation Logic", "type": "string", "required": False, "order": 2},
                {"name": "upstream_dependencies", "display_name": "Upstream Dependencies", "type": "string", "required": False, "order": 3},
                {"name": "downstream_consumers", "display_name": "Downstream Consumers", "type": "string", "required": False, "order": 4}
            ]
        }
    ]
    return templates

# ============================================
# DATA PRODUCT CANVAS APIs
# ============================================

@api_router.get("/canvas", response_model=List[DataProductCanvas])
async def get_all_canvases(current_user: User = Depends(get_current_user)):
    """Get all data product canvases"""
    canvases = await db.data_product_canvases.find({}, {"_id": 0}).to_list(100)
    for canvas in canvases:
        if isinstance(canvas.get('created_at'), str):
            canvas['created_at'] = datetime.fromisoformat(canvas['created_at'])
        if canvas.get('updated_at') and isinstance(canvas.get('updated_at'), str):
            canvas['updated_at'] = datetime.fromisoformat(canvas['updated_at'])
    return canvases

@api_router.get("/canvas/stats")
async def get_canvas_stats(current_user: User = Depends(get_current_user)):
    """Get statistics about data product canvases"""
    total = await db.data_product_canvases.count_documents({})
    active = await db.data_product_canvases.count_documents({"status": "active"})
    draft = await db.data_product_canvases.count_documents({"status": "draft"})
    deprecated = await db.data_product_canvases.count_documents({"status": "deprecated"})
    
    # Count by classification
    source_aligned = await db.data_product_canvases.count_documents({"classification": "source-aligned"})
    aggregate = await db.data_product_canvases.count_documents({"classification": "aggregate"})
    consumer_aligned = await db.data_product_canvases.count_documents({"classification": "consumer-aligned"})
    
    # Count by domain
    port_canvases = await db.data_product_canvases.count_documents({"domain": "port"})
    fleet_canvases = await db.data_product_canvases.count_documents({"domain": "fleet"})
    epc_canvases = await db.data_product_canvases.count_documents({"domain": "epc"})
    logistics_canvases = await db.data_product_canvases.count_documents({"domain": "logistics"})
    
    return {
        "total": total,
        "by_status": {
            "active": active,
            "draft": draft,
            "deprecated": deprecated
        },
        "by_classification": {
            "source_aligned": source_aligned,
            "aggregate": aggregate,
            "consumer_aligned": consumer_aligned
        },
        "by_domain": {
            "port": port_canvases,
            "fleet": fleet_canvases,
            "epc": epc_canvases,
            "logistics": logistics_canvases
        }
    }

@api_router.get("/canvas/domain/{domain_name}")
async def get_canvases_by_domain(domain_name: str, current_user: User = Depends(get_current_user)):
    """Get all canvases for a specific domain"""
    canvases = await db.data_product_canvases.find({"domain": domain_name}, {"_id": 0}).to_list(100)
    for canvas in canvases:
        if isinstance(canvas.get('created_at'), str):
            canvas['created_at'] = datetime.fromisoformat(canvas['created_at'])
    return canvases

@api_router.get("/canvas/{canvas_id}")
async def get_canvas(canvas_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific data product canvas by ID"""
    canvas = await db.data_product_canvases.find_one({"id": canvas_id}, {"_id": 0})
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    if isinstance(canvas.get('created_at'), str):
        canvas['created_at'] = datetime.fromisoformat(canvas['created_at'])
    if canvas.get('updated_at') and isinstance(canvas.get('updated_at'), str):
        canvas['updated_at'] = datetime.fromisoformat(canvas['updated_at'])
    return canvas

@api_router.post("/canvas", response_model=DataProductCanvas)
async def create_canvas(canvas_data: DataProductCanvas, current_user: User = Depends(get_current_user)):
    """Create a new data product canvas"""
    doc = canvas_data.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('updated_at'):
        doc['updated_at'] = doc['updated_at'].isoformat()
    await db.data_product_canvases.insert_one(doc)
    
    await log_event("canvas_created", canvas_data.domain, canvas_data.id,
                    f"Data Product Canvas '{canvas_data.name}' created",
                    ["notify_governance", "update_catalog"])
    
    return canvas_data

@api_router.put("/canvas/{canvas_id}")
async def update_canvas(canvas_id: str, canvas_data: DataProductCanvas, current_user: User = Depends(get_current_user)):
    """Update an existing data product canvas"""
    existing = await db.data_product_canvases.find_one({"id": canvas_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Canvas not found")
    
    doc = canvas_data.model_dump()
    doc['id'] = canvas_id
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    doc['created_at'] = existing.get('created_at', datetime.now(timezone.utc).isoformat())
    
    await db.data_product_canvases.replace_one({"id": canvas_id}, doc)
    
    await log_event("canvas_updated", canvas_data.domain, canvas_id,
                    f"Data Product Canvas '{canvas_data.name}' updated to v{canvas_data.version}",
                    ["notify_consumers", "review_changes"])
    
    return {"message": "Canvas updated successfully", "id": canvas_id}

@api_router.delete("/canvas/{canvas_id}")
async def delete_canvas(canvas_id: str, current_user: User = Depends(get_current_user)):
    """Delete a data product canvas"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.data_product_canvases.delete_one({"id": canvas_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Canvas not found")
    
    return {"message": "Canvas deleted successfully"}

@api_router.get("/canvas/domain/{domain_name}")
async def get_canvases_by_domain(domain_name: str, current_user: User = Depends(get_current_user)):
    """Get all canvases for a specific domain"""
    canvases = await db.data_product_canvases.find({"domain": domain_name}, {"_id": 0}).to_list(100)
    for canvas in canvases:
        if isinstance(canvas.get('created_at'), str):
            canvas['created_at'] = datetime.fromisoformat(canvas['created_at'])
    return canvases

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

# ============================================
# DOMAIN OWNERSHIP PRINCIPLE - Domain Journey APIs
# ============================================

@api_router.get("/domains/journey", response_model=List[DomainJourney])
async def get_domain_journeys(current_user: User = Depends(get_current_user)):
    """Get maturity journey for all domains"""
    journeys = await db.domain_journeys.find({}, {"_id": 0}).to_list(100)
    for journey in journeys:
        if isinstance(journey.get('last_updated'), str):
            journey['last_updated'] = datetime.fromisoformat(journey['last_updated'])
    return journeys

@api_router.get("/domains/journey/{domain_name}")
async def get_domain_journey(domain_name: str, current_user: User = Depends(get_current_user)):
    """Get maturity journey for a specific domain"""
    journey = await db.domain_journeys.find_one({"domain_name": domain_name}, {"_id": 0})
    if not journey:
        raise HTTPException(status_code=404, detail="Domain journey not found")
    if isinstance(journey.get('last_updated'), str):
        journey['last_updated'] = datetime.fromisoformat(journey['last_updated'])
    return journey

@api_router.put("/domains/journey/{domain_name}/level")
async def update_domain_level(domain_name: str, new_level: int, current_user: User = Depends(get_current_user)):
    """Update domain maturity level"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    level_descriptions = {
        1: "Data Consumer - Consuming data from other domains",
        2: "Data Aware - Understanding data needs and dependencies",
        3: "Data Producer - Publishing initial data products",
        4: "Data Mesh Contributor - Active participant in the mesh ecosystem",
        5: "Data Mesh Leader - Driving data mesh excellence"
    }
    
    await db.domain_journeys.update_one(
        {"domain_name": domain_name},
        {"$set": {
            "current_level": new_level,
            "level_description": level_descriptions.get(new_level, "Unknown level"),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    await log_event("domain_level_update", domain_name, domain_name,
                    f"Domain {domain_name} reached maturity level {new_level}",
                    ["notify_governance", "update_metrics"])
    
    return {"message": f"Domain {domain_name} updated to level {new_level}"}

# ============================================
# DATA AS A PRODUCT PRINCIPLE - Enhanced Data Contracts APIs
# ============================================

def parse_contract_dates(contract: dict) -> dict:
    """Parse date strings to datetime objects"""
    if isinstance(contract.get('created_at'), str):
        contract['created_at'] = datetime.fromisoformat(contract['created_at'])
    if isinstance(contract.get('updated_at'), str):
        contract['updated_at'] = datetime.fromisoformat(contract['updated_at'])
    return contract

def contract_to_yaml(contract: dict) -> str:
    """Convert contract to YAML format based on Data Contract Specification"""
    import yaml
    
    yaml_dict = {
        "dataContractSpecification": "0.9.3",
        "id": contract.get("id"),
        "info": {
            "title": contract.get("contract_name", ""),
            "version": contract.get("version", "1.0.0"),
            "status": contract.get("status", "draft"),
            "description": contract.get("dataset", {}).get("description", "") if isinstance(contract.get("dataset"), dict) else contract.get("description", "")
        },
        "provider": contract.get("provider", {}),
        "dataset": contract.get("dataset", {}),
        "schema": {
            "fields": contract.get("schema_fields", [])
        },
        "quality": contract.get("quality", {}),
        "slo": contract.get("slo", {}),
        "terms": contract.get("terms", {}),
    }
    
    if contract.get("billing"):
        yaml_dict["billing"] = contract.get("billing")
    
    if contract.get("consumers"):
        yaml_dict["consumers"] = contract.get("consumers")
    
    return yaml.dump(yaml_dict, default_flow_style=False, sort_keys=False, allow_unicode=True)

@api_router.get("/contracts")
async def get_data_contracts(current_user: User = Depends(get_current_user)):
    """Get all data contracts"""
    contracts = await db.data_contracts.find({}, {"_id": 0}).to_list(100)
    for contract in contracts:
        parse_contract_dates(contract)
    return contracts

@api_router.get("/contracts/{contract_id}")
async def get_data_contract(contract_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific data contract by ID"""
    contract = await db.data_contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return parse_contract_dates(contract)

@api_router.get("/contracts/{contract_id}/yaml")
async def get_data_contract_yaml(contract_id: str, current_user: User = Depends(get_current_user)):
    """Get a data contract in YAML format (Data Contract Specification format)"""
    contract = await db.data_contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    yaml_content = contract_to_yaml(contract)
    return {"yaml": yaml_content, "contract_id": contract_id}

@api_router.post("/contracts", response_model=DataContract)
async def create_data_contract(contract_data: DataContract, current_user: User = Depends(get_current_user)):
    """Create a new data contract for a data product"""
    doc = contract_data.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('updated_at'):
        doc['updated_at'] = doc['updated_at'].isoformat()
    await db.data_contracts.insert_one(doc)
    
    contract_name = contract_data.contract_name if hasattr(contract_data, 'contract_name') else contract_data.data_product_id
    await log_event("contract_created", "governance", contract_data.id,
                    f"Data contract v{contract_data.version} created: {contract_name}",
                    ["notify_consumers", "update_catalog"])
    
    return contract_data

@api_router.put("/contracts/{contract_id}")
async def update_data_contract(contract_id: str, contract_data: DataContract, current_user: User = Depends(get_current_user)):
    """Update an existing data contract"""
    existing = await db.data_contracts.find_one({"id": contract_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    doc = contract_data.model_dump()
    doc['id'] = contract_id  # Preserve original ID
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    doc['created_at'] = existing.get('created_at', datetime.now(timezone.utc).isoformat())
    
    await db.data_contracts.replace_one({"id": contract_id}, doc)
    
    await log_event("contract_updated", "governance", contract_id,
                    f"Data contract updated to v{contract_data.version}",
                    ["notify_consumers", "version_update"])
    
    return doc

@api_router.delete("/contracts/{contract_id}")
async def delete_data_contract(contract_id: str, current_user: User = Depends(get_current_user)):
    """Delete a data contract (soft delete - mark as deprecated)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.data_contracts.update_one(
        {"id": contract_id},
        {"$set": {"status": "deprecated", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return {"message": f"Contract {contract_id} has been deprecated"}

@api_router.post("/contracts/{contract_id}/consumers")
async def add_contract_consumer(contract_id: str, consumer: ContractConsumer, current_user: User = Depends(get_current_user)):
    """Add a consumer to a data contract"""
    contract = await db.data_contracts.find_one({"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    consumers = contract.get("consumers", [])
    consumers.append(consumer.model_dump())
    
    await db.data_contracts.update_one(
        {"id": contract_id},
        {"$set": {"consumers": consumers, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await log_event("consumer_added", "governance", contract_id,
                    f"Consumer {consumer.name} added to contract",
                    ["update_access", "notify_provider"])
    
    return {"message": f"Consumer {consumer.name} added to contract"}

@api_router.get("/contracts/stats/summary")
async def get_contracts_stats(current_user: User = Depends(get_current_user)):
    """Get contract statistics summary"""
    contracts = await db.data_contracts.find({}, {"_id": 0}).to_list(100)
    
    stats = {
        "total_contracts": len(contracts),
        "by_status": {"draft": 0, "active": 0, "deprecated": 0},
        "by_domain": {},
        "total_consumers": 0,
        "avg_schema_fields": 0,
        "with_billing": 0
    }
    
    total_fields = 0
    for contract in contracts:
        status = contract.get("status", "draft")
        stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
        
        domain = contract.get("dataset", {}).get("domain", "unknown") if isinstance(contract.get("dataset"), dict) else "unknown"
        stats["by_domain"][domain] = stats["by_domain"].get(domain, 0) + 1
        
        consumers = contract.get("consumers", [])
        stats["total_consumers"] += len(consumers)
        
        schema_fields = contract.get("schema_fields", [])
        total_fields += len(schema_fields)
        
        if contract.get("billing"):
            stats["with_billing"] += 1
    
    if len(contracts) > 0:
        stats["avg_schema_fields"] = round(total_fields / len(contracts), 1)
    
    return stats

@api_router.get("/quality/metrics", response_model=List[QualityMetric])
async def get_quality_metrics(current_user: User = Depends(get_current_user)):
    """Get quality metrics for all data products"""
    metrics = await db.quality_metrics.find({}, {"_id": 0}).to_list(100)
    for metric in metrics:
        if isinstance(metric.get('measured_at'), str):
            metric['measured_at'] = datetime.fromisoformat(metric['measured_at'])
    return metrics

@api_router.post("/quality/metrics", response_model=QualityMetric)
async def create_quality_metric(metric_data: QualityMetric, current_user: User = Depends(get_current_user)):
    """Record a new quality metric"""
    doc = metric_data.model_dump()
    doc['measured_at'] = doc['measured_at'].isoformat()
    await db.quality_metrics.insert_one(doc)
    return metric_data

@api_router.get("/lineage", response_model=List[DataLineage])
async def get_data_lineage(current_user: User = Depends(get_current_user)):
    """Get data lineage information"""
    lineages = await db.data_lineages.find({}, {"_id": 0}).to_list(100)
    return lineages

@api_router.post("/lineage", response_model=DataLineage)
async def create_data_lineage(lineage_data: DataLineage, current_user: User = Depends(get_current_user)):
    """Create a data lineage relationship"""
    doc = lineage_data.model_dump()
    await db.data_lineages.insert_one(doc)
    return lineage_data

# ============================================
# SELF-SERVE PLATFORM PRINCIPLE - Platform APIs
# ============================================

@api_router.get("/platform/capabilities", response_model=List[PlatformCapability])
async def get_platform_capabilities(current_user: User = Depends(get_current_user)):
    """Get all platform capabilities available to domain teams"""
    capabilities = await db.platform_capabilities.find({}, {"_id": 0}).to_list(100)
    return capabilities

@api_router.get("/platform/stats")
async def get_platform_stats(current_user: User = Depends(get_current_user)):
    """Get platform usage statistics"""
    total_products = await db.data_catalog.count_documents({})
    total_contracts = await db.data_contracts.count_documents({})
    total_capabilities = await db.platform_capabilities.count_documents({})
    active_capabilities = await db.platform_capabilities.count_documents({"status": "active"})
    
    # Domain stats
    port_products = await db.data_catalog.count_documents({"domain": "port"})
    fleet_products = await db.data_catalog.count_documents({"domain": "fleet"})
    epc_products = await db.data_catalog.count_documents({"domain": "epc"})
    logistics_products = await db.data_catalog.count_documents({"domain": "logistics"})
    
    return {
        "total_data_products": total_products,
        "total_contracts": total_contracts,
        "total_capabilities": total_capabilities,
        "active_capabilities": active_capabilities,
        "products_by_domain": {
            "port": port_products,
            "fleet": fleet_products,
            "epc": epc_products,
            "logistics": logistics_products
        }
    }

# ============================================
# FEDERATED GOVERNANCE PRINCIPLE - Enhanced Governance APIs
# ============================================

@api_router.get("/governance/compliance", response_model=List[ComplianceRule])
async def get_compliance_rules(current_user: User = Depends(get_current_user)):
    """Get all compliance rules"""
    rules = await db.compliance_rules.find({}, {"_id": 0}).to_list(100)
    return rules

@api_router.post("/governance/compliance", response_model=ComplianceRule)
async def create_compliance_rule(rule_data: ComplianceRule, current_user: User = Depends(get_current_user)):
    """Create a new compliance rule"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    doc = rule_data.model_dump()
    await db.compliance_rules.insert_one(doc)
    
    await log_event("compliance_rule_created", "governance", rule_data.id,
                    f"Compliance rule '{rule_data.rule_name}' created for standard {rule_data.standard}",
                    ["notify_domains", "update_policies"])
    
    return rule_data

@api_router.get("/governance/standards", response_model=List[InteroperabilityStandard])
async def get_interoperability_standards(current_user: User = Depends(get_current_user)):
    """Get all interoperability standards"""
    standards = await db.interop_standards.find({}, {"_id": 0}).to_list(100)
    return standards

@api_router.post("/governance/standards", response_model=InteroperabilityStandard)
async def create_interoperability_standard(standard_data: InteroperabilityStandard, current_user: User = Depends(get_current_user)):
    """Register a new interoperability standard"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    doc = standard_data.model_dump()
    await db.interop_standards.insert_one(doc)
    return standard_data

@api_router.get("/governance/dashboard")
async def get_governance_dashboard(current_user: User = Depends(get_current_user)):
    """Get comprehensive governance dashboard stats"""
    mappings_count = await db.semantic_mappings.count_documents({})
    policies_count = await db.access_policies.count_documents({})
    compliance_count = await db.compliance_rules.count_documents({})
    standards_count = await db.interop_standards.count_documents({})
    
    active_rules = await db.compliance_rules.count_documents({"status": "active"})
    
    return {
        "semantic_mappings": mappings_count,
        "access_policies": policies_count,
        "compliance_rules": compliance_count,
        "active_compliance_rules": active_rules,
        "interoperability_standards": standards_count
    }

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
