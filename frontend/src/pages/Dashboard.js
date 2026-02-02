import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Ship, Truck, Wind, Warehouse, MapPin, CheckCircle2, Clock, 
  AlertTriangle, ArrowRight, Package, Activity, Users, Anchor,
  Building2, LayoutGrid, FileText, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// Asyad Wind Turbine Logistics Flow Component
function LogisticsFlow({ vessels, shipments, assemblyAreas, sites }) {
  // Calculate counts for each stage
  const portCount = vessels ? vessels.filter(function(v) { return v.status === 'berthed' || v.status === 'unloading'; }).length : 0;
  const approachingCount = vessels ? vessels.filter(function(v) { return v.status === 'approaching' || v.status === 'scheduled'; }).length : 0;
  const inTransitCount = shipments ? shipments.filter(function(s) { return s.status === 'in_transit' || s.status === 'loading_transport'; }).length : 0;
  const atAssemblyCount = shipments ? shipments.filter(function(s) { return s.status === 'at_assembly_area'; }).length : 0;
  const deliveredCount = shipments ? shipments.filter(function(s) { return s.status === 'delivered'; }).length : 0;
  
  const stages = [
    {
      id: 'port',
      title: 'Port Handling',
      titleAr: 'المناولة عند أرصفة الميناء',
      icon: Anchor,
      color: 'blue',
      count: portCount,
      approaching: approachingCount,
      locations: ['Port of Duqm', 'SOHAR Port', 'Port of Salalah']
    },
    {
      id: 'transport',
      title: 'Land Transport',
      titleAr: 'المناولة وعملية النقل البري',
      icon: Truck,
      color: 'purple',
      count: inTransitCount,
      label: 'In Transit'
    },
    {
      id: 'primary_assembly',
      title: 'Primary Assembly',
      titleAr: 'مناطق التجميع الرئيسية',
      icon: Warehouse,
      color: 'amber',
      count: atAssemblyCount,
      label: 'At Assembly'
    },
    {
      id: 'secondary_assembly',
      title: 'Secondary Assembly',
      titleAr: 'مناطق التجميع الفرعية',
      icon: Building2,
      color: 'orange',
      count: assemblyAreas ? assemblyAreas.filter(function(a) { return a.area_type === 'Secondary'; }).length : 0,
      label: 'Sites Ready'
    },
    {
      id: 'concession',
      title: 'Concession Area',
      titleAr: 'منطقة الامتياز',
      icon: Wind,
      color: 'green',
      count: deliveredCount,
      label: 'Delivered'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Wind Turbine Logistics Flow</h2>
          <p className="text-slate-400 text-sm">Real-time component tracking across Oman</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
          <Activity className="h-3 w-3 mr-1" /> LIVE
        </Badge>
      </div>
      
      {/* Flow Diagram */}
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-amber-500 via-orange-500 to-green-500 opacity-30 -translate-y-1/2 z-0"></div>
        
        {stages.map(function(stage, index) {
          const Icon = stage.icon;
          const colorClasses = {
            blue: 'from-blue-500 to-blue-600 border-blue-400',
            purple: 'from-purple-500 to-purple-600 border-purple-400',
            amber: 'from-amber-500 to-amber-600 border-amber-400',
            orange: 'from-orange-500 to-orange-600 border-orange-400',
            green: 'from-green-500 to-green-600 border-green-400'
          }[stage.color];
          
          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10">
              {/* Stage Circle */}
              <div className={'w-20 h-20 rounded-full bg-gradient-to-br ' + colorClasses + ' flex items-center justify-center shadow-lg border-2'}>
                <Icon className="h-10 w-10 text-white" />
              </div>
              
              {/* Count Badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-black text-slate-900">{stage.count}</span>
              </div>
              
              {/* Labels */}
              <div className="mt-4 text-center">
                <p className="text-white font-bold text-sm">{stage.title}</p>
                <p className="text-slate-400 text-xs mt-1" dir="rtl">{stage.titleAr}</p>
              </div>
              
              {/* Arrow (except last) */}
              {index < stages.length - 1 && (
                <ArrowRight className="absolute -right-8 top-8 h-6 w-6 text-slate-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Vessel Card Component
function VesselCard({ vessel }) {
  const statusColors = {
    berthed: 'bg-emerald-500',
    unloading: 'bg-blue-500',
    approaching: 'bg-amber-500',
    scheduled: 'bg-slate-500'
  };
  
  return (
    <div className="p-4 border rounded-xl hover:shadow-lg transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Ship className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{vessel.vessel_name}</h4>
            <p className="text-xs text-slate-500">{vessel.vessel_id}</p>
          </div>
        </div>
        <Badge className={statusColors[vessel.status] + ' text-white'}>{vessel.status}</Badge>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Port:</span>
          <span className="font-medium">{vessel.port}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Cargo:</span>
          <span className="font-medium">{vessel.cargo_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Quantity:</span>
          <span className="font-bold text-blue-600">{vessel.cargo_quantity} units</span>
        </div>
        {vessel.berth_number && vessel.berth_number !== 'TBD' && (
          <div className="flex justify-between">
            <span className="text-slate-500">Berth:</span>
            <span className="font-medium">{vessel.berth_number}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Shipment Card Component  
function ShipmentCard({ shipment }) {
  const statusColors = {
    loading_transport: 'bg-blue-500',
    in_transit: 'bg-purple-500',
    at_assembly_area: 'bg-amber-500',
    delivered: 'bg-emerald-500'
  };
  
  const statusLabels = {
    loading_transport: 'Loading',
    in_transit: 'In Transit',
    at_assembly_area: 'At Assembly',
    delivered: 'Delivered'
  };
  
  return (
    <div className="p-4 border rounded-xl hover:shadow-lg transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Truck className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{shipment.component_type}</h4>
            <p className="text-xs text-slate-500">{shipment.shipment_id}</p>
          </div>
        </div>
        <Badge className={statusColors[shipment.status] + ' text-white'}>{statusLabels[shipment.status]}</Badge>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Quantity:</span>
          <span className="font-bold">{shipment.quantity} units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Location:</span>
          <span className="font-medium text-xs">{shipment.current_location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Destination:</span>
          <span className="font-medium text-xs">{shipment.destination_site}</span>
        </div>
        {shipment.transport_convoy && (
          <div className="mt-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500">Convoy: </span>
            <span className="text-xs font-bold text-purple-600">{shipment.transport_convoy}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Assembly Area Card
function AssemblyCard({ area }) {
  const occupancyPercent = Math.round((area.current_occupancy / area.capacity) * 100);
  const barColor = occupancyPercent > 90 ? 'bg-red-500' : occupancyPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500';
  
  return (
    <div className="p-4 border rounded-xl hover:shadow-lg transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Badge variant="outline" className="mb-2">{area.area_type}</Badge>
          <h4 className="font-bold text-slate-900">{area.area_name}</h4>
          <p className="text-xs text-slate-500">{area.location}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Capacity</span>
            <span className="font-bold">{area.current_occupancy}/{area.capacity}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={'h-full rounded-full ' + barColor} style={{ width: occupancyPercent + '%' }}></div>
          </div>
        </div>
        <div className="text-xs text-slate-600">
          <span className="font-medium">Stored: </span>
          {area.components_stored.slice(0, 2).join(', ')}
          {area.components_stored.length > 2 && '...'}
        </div>
      </div>
    </div>
  );
}

// Wind Farm Site Card
function SiteCard({ site }) {
  const progress = site.turbines_installed && site.turbines_planned ? 
    Math.round((site.turbines_installed / site.turbines_planned) * 100) : 0;
    
  const statusColors = {
    installing: 'bg-blue-500',
    preparing: 'bg-amber-500',
    ready: 'bg-emerald-500'
  };
  
  return (
    <div className="p-4 border rounded-xl hover:shadow-lg transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Wind className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{site.site_name}</h4>
            <p className="text-xs text-slate-500">{site.site_id}</p>
          </div>
        </div>
        <Badge className={statusColors[site.readiness_status] + ' text-white'}>{site.readiness_status}</Badge>
      </div>
      <div className="space-y-3">
        {site.capacity_mw && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Capacity:</span>
            <span className="font-bold text-green-600">{site.capacity_mw} MW</span>
          </div>
        )}
        {site.turbines_planned && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Turbines Installed</span>
              <span className="font-bold">{site.turbines_installed}/{site.turbines_planned}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: progress + '%' }}></div>
            </div>
          </div>
        )}
        {site.contractor && (
          <div className="text-xs text-slate-600">
            <span className="font-medium">Contractor: </span>{site.contractor}
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [vessels, setVessels] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [sites, setSites] = useState([]);
  const [assemblyAreas, setAssemblyAreas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const fetchData = async function() {
      try {
        const headers = { Authorization: 'Bearer ' + token };
        const results = await Promise.all([
          axios.get(API + '/port/vessels', { headers }),
          axios.get(API + '/fleet/shipments', { headers }),
          axios.get(API + '/epc/sites', { headers }),
          axios.get(API + '/logistics/assembly-areas', { headers }),
          axios.get(API + '/dashboard/stats', { headers })
        ]);
        
        setVessels(results[0].data);
        setShipments(results[1].data);
        setSites(results[2].data);
        setAssemblyAreas(results[3].data);
        setStats(results[4].data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return function() { clearInterval(interval); };
  }, []);

  if (!user) return null;
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  // Calculate summary stats
  const totalVessels = vessels.length;
  const totalShipments = shipments.length;
  const totalAssembly = assemblyAreas.length;
  const turbinesInstalled = sites.reduce(function(acc, s) { return acc + (s.turbines_installed || 0); }, 0);
  const turbinesPlanned = sites.reduce(function(acc, s) { return acc + (s.turbines_planned || 0); }, 0);

  return (
    <Layout user={user}>
      <div className="space-y-8" data-testid="dashboard">
        
        {/* Hero Section - Asyad Branded */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <img src="https://www.asyad.om/wp-content/uploads/2023/04/Asyad_logo.svg" alt="Asyad" className="h-12 bg-white rounded-lg p-2" onError={function(e) { e.target.style.display = 'none'; }} />
              <Badge className="bg-white/20 text-white border-white/30 uppercase tracking-widest text-xs font-bold">
                Wind Turbine Logistics Command
              </Badge>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Oman Renewable Energy Logistics
            </h1>
            <p className="text-purple-200 font-medium text-lg max-w-2xl mb-6">
              End-to-end wind turbine component tracking from port to installation site.
              Powered by Data Mesh for real-time visibility across all stakeholders.
            </p>
            
            {/* Key Metrics Row */}
            <div className="flex gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Ship className="h-8 w-8 text-blue-300" />
                  <div>
                    <p className="text-3xl font-black">{totalVessels}</p>
                    <p className="text-xs text-purple-200 uppercase">Vessels Active</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-purple-300" />
                  <div>
                    <p className="text-3xl font-black">{totalShipments}</p>
                    <p className="text-xs text-purple-200 uppercase">Shipments Tracked</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Wind className="h-8 w-8 text-green-300" />
                  <div>
                    <p className="text-3xl font-black">{turbinesInstalled}/{turbinesPlanned}</p>
                    <p className="text-xs text-purple-200 uppercase">Turbines Installed</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Warehouse className="h-8 w-8 text-amber-300" />
                  <div>
                    <p className="text-3xl font-black">{totalAssembly}</p>
                    <p className="text-xs text-purple-200 uppercase">Assembly Areas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Flow Visualization */}
        <LogisticsFlow 
          vessels={vessels} 
          shipments={shipments} 
          assemblyAreas={assemblyAreas}
          sites={sites}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
            onClick={function() { navigate('/canvas'); }}
          >
            <LayoutGrid className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-bold">Data Product Canvas</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300"
            onClick={function() { navigate('/contracts'); }}
          >
            <FileText className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-bold">Data Contracts</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-300"
            onClick={function() { navigate('/catalog'); }}
          >
            <Package className="h-6 w-6 text-amber-600" />
            <span className="text-sm font-bold">Data Catalog</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
            onClick={function() { navigate('/governance'); }}
          >
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <span className="text-sm font-bold">Governance</span>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Vessels at Port */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-black uppercase tracking-tight flex items-center gap-2">
                  <Ship className="h-5 w-5 text-blue-600" />
                  Vessels at Ports
                </CardTitle>
                <Badge variant="outline">{vessels.length} Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {vessels.map(function(v) {
                  return <VesselCard key={v.id} vessel={v} />;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipments In Transit */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-black uppercase tracking-tight flex items-center gap-2">
                  <Truck className="h-5 w-5 text-purple-600" />
                  Component Shipments
                </CardTitle>
                <Badge variant="outline">{shipments.length} Tracked</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {shipments.map(function(s) {
                  return <ShipmentCard key={s.id} shipment={s} />;
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assembly Areas and Sites */}
        <div className="grid grid-cols-2 gap-6">
          {/* Assembly Areas */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-black uppercase tracking-tight flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-amber-600" />
                  Assembly Areas
                </CardTitle>
                <Badge variant="outline">{assemblyAreas.length} Locations</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {assemblyAreas.map(function(a) {
                  return <AssemblyCard key={a.id} area={a} />;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Wind Farm Sites */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-black uppercase tracking-tight flex items-center gap-2">
                  <Wind className="h-5 w-5 text-green-600" />
                  Wind Farm Sites (Concession Areas)
                </CardTitle>
                <Badge variant="outline">{sites.length} Sites</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sites.map(function(s) {
                  return <SiteCard key={s.id} site={s} />;
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stakeholder Logos Section */}
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-slate-600 text-sm uppercase tracking-widest">
              Ecosystem Partners & Stakeholders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8 py-4 opacity-70">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                  <Anchor className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-slate-600">Port of Duqm</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                  <Anchor className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-slate-600">SOHAR Port</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                  <Anchor className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-slate-600">Port of Salalah</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-slate-600">ROP Customs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                  <Building2 className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-xs text-slate-600">Ministry of Transport</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-slate-600">Hydrom</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
                  <Wind className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600">EPC Contractors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default Dashboard;
