# Oman National Hydrogen Data Mesh - MVP

## Overview
A decentralized Data Mesh platform demonstrating the four fundamental principles of Data Mesh architecture for managing hydrogen supply chain operations across Port of Duqm, Asyad Fleet Operations, and Hydrogen Developer (EPC) sites.

## Architecture Principles Implemented

### 1. Domain-Oriented Decentralized Data Ownership
- **Port Authority Domain**: Manages vessel tracking, berth assignments, and cargo management
- **Fleet Operations Domain (Asyad)**: Handles shipment tracking and logistics coordination
- **EPC Sites Domain**: Tracks site readiness and component installation status
- Each domain has independent data management with full sovereignty

### 2. Data as a Product
- **Data Catalog**: Centralized registry of all data products with metadata
- **Service Contracts**: Each data product has defined schemas, update frequencies, and access patterns
- **Self-Describing**: All data products are tagged and discoverable
- Examples: Vessel Status API, Shipment Tracking API, Site Readiness API

### 3. Self-Serve Data Infrastructure Platform
- **Low-Code UI**: Domain teams can view and manage their data through intuitive dashboards
- **API-First**: RESTful APIs for programmatic access to all data products
- **Real-Time Updates**: Automatic data synchronization across domains (30-second polling)
- **Visual Dashboards**: Pre-built KPI cards and event tracking

### 4. Federated Computational Governance
- **Semantic Mappings**: Automatic translation between domain-specific fields and national standards (IDS, Gaia-X)
- **Access Policies (ABAC)**: Attribute-Based Access Control ensuring data sovereignty
- **Event Orchestration**: Automated workflows triggering cross-domain notifications
- **Policy Automation**: Validators enforce data quality rules automatically

## Technology Stack (Open-Source Alternatives to Huawei GDE.ADC)

### Backend
- **FastAPI**: High-performance Python web framework (replaces GDE.ADC Service Layer)
- **Motor**: Async MongoDB driver for data persistence
- **JWT Authentication**: Secure token-based authentication
- **Pydantic**: Data validation and serialization

### Frontend
- **React**: Component-based UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Shadcn/UI**: Modern component library
- **Tailwind CSS**: Utility-first styling

### Database
- **MongoDB**: Document database for flexible schema and domain isolation

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access (admin, editor, viewer)
- Domain-based permissions

### Dashboard
- Real-time KPI metrics across all domains
- Event log with triggered actions
- Quick navigation to domain workspaces

### Domain Workspaces

#### Port Authority
- Vessel registration and tracking
- Berth management
- ETA monitoring
- Cargo type classification

#### Fleet Operations
- Shipment creation and tracking
- Component type management (turbine blades, nacelles, tower sections, etc.)
- Vessel-shipment association
- Destination site routing

#### EPC Sites
- Site registration
- Readiness status tracking
- Expected component matching
- Installation phase monitoring

### Data Catalog
- Browse all available data products
- Search by name, description, or tags
- View data product schemas and metadata
- API endpoint documentation

### Federated Governance
- **Semantic Mappings**: View field translation rules across domains
- **Access Policies**: Review domain access permissions and visible fields

## Demo Credentials

```
Email: admin@port.om
Password: password123
Domain: Port Authority
Role: Admin
```

Other available users:
- fleet@asyad.om / password123 (Fleet Operations, Editor)
- site@hydrogen.om / password123 (EPC Sites, Editor)

## Sample Data

### Vessels (Port Domain)
- Hydrogen Pioneer (DQM-V001) - Berthed at B-12
- Green Energy Carrier (DQM-V002) - Approaching

### Shipments (Fleet Domain)
- SHP-2025-001: Turbine blade to Duqm Hydrogen Hub A
- SHP-2025-002: Nacelle to Duqm Hydrogen Hub B

### Sites (EPC Domain)
- Duqm Hydrogen Hub A (DHH-A) - Ready
- Duqm Hydrogen Hub B (DHH-B) - Preparing

### Data Products
1. Vessel Status API (/api/port/vessels)
2. Shipment Tracking API (/api/fleet/shipments)
3. Site Readiness API (/api/epc/sites)

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- GET /api/auth/me - Get current user

### Port Domain
- GET /api/port/vessels - List all vessels
- POST /api/port/vessels - Add new vessel

### Fleet Domain
- GET /api/fleet/shipments - List all shipments
- POST /api/fleet/shipments - Create shipment

### EPC Domain
- GET /api/epc/sites - List all sites
- POST /api/epc/sites - Add new site

### Data Catalog
- GET /api/catalog/products - List data products
- POST /api/catalog/products - Publish data product

### Governance
- GET /api/governance/mappings - Get semantic mappings
- POST /api/governance/mappings - Create mapping
- GET /api/governance/policies - Get access policies
- POST /api/governance/policies - Create policy

### Dashboard
- GET /api/dashboard/stats - Get aggregated statistics
- GET /api/events - Get recent event logs

## Data Mesh Principles Mapping

| Data Mesh Principle | MVP Implementation | Technology Used |
|---------------------|-------------------|-----------------|
| Domain Ownership | Separate MongoDB collections per domain | MongoDB + FastAPI routers |
| Data as a Product | RESTful APIs with schema validation | FastAPI + Pydantic |
| Self-Serve Platform | React dashboards with CRUD operations | React + Shadcn/UI |
| Federated Governance | Semantic mappings + ABAC policies | Custom middleware + JWT |

## Event-Driven Architecture

Events are logged and trigger automated actions:

1. **Vessel Update** → Notifies fleet operations
2. **Shipment Update** → Checks site readiness
3. **Site Update** → Enables shipping permissions

## Future Enhancements

1. **Real-time WebSockets**: Replace polling with WebSocket connections
2. **Advanced Analytics**: Add Recharts visualizations for trends
3. **Workflow Automation**: Implement complex multi-step workflows
4. **Data Quality Monitoring**: Add automated validation dashboards
5. **API Gateway**: Implement rate limiting and caching
6. **Multi-tenancy**: Support multiple organizations
7. **Audit Logs**: Comprehensive change tracking
8. **Export/Import**: Bulk data operations

## Development

### Backend Development
```bash
cd /app/backend
python server.py
```

### Frontend Development
```bash
cd /app/frontend
yarn start
```

### Database Seeding
```bash
cd /app/backend
python seed_data.py
```

## Production Considerations

1. **Environment Variables**: Use proper secrets management
2. **HTTPS**: Enable SSL/TLS encryption
3. **Rate Limiting**: Implement API throttling
4. **Monitoring**: Add application performance monitoring
5. **Backup**: Regular database backups
6. **Scaling**: Horizontal scaling with load balancing
