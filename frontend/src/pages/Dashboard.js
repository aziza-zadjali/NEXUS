import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Ship, Building2, Package, Activity, CheckCircle2, Anchor, Truck, Wind, MapPin, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [journey, setJourney] = useState({ currentStep: 1 });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, eventsRes] = await Promise.all([
          axios.get(`${API}/dashboard/stats`, { headers }),
          axios.get(`${API}/events`, { headers })
        ]);
        setStats(statsRes.data);
        setEvents(eventsRes.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const pillars = [
    { 
      id: 'domain', 
      title: 'Domain Ownership', 
      icon: LayoutGrid,
      color: 'cyan',
      desc: 'Bounded context teams',
      route: '/domain/port'
    },
    { 
      id: 'product', 
      title: 'Data as Product', 
      icon: Package,
      color: 'orange',
      desc: 'Curated data products',
      route: '/catalog'
    },
    { 
      id: 'platform', 
      title: 'Self-Serve Platform', 
      icon: Activity,
      color: 'emerald',
      desc: 'Low-code tools',
      route: '/domain/fleet'
    },
    { 
      id: 'governance', 
      title: 'Federated Governance', 
      icon: CheckCircle2,
      color: 'indigo',
      desc: 'Policy automation',
      route: '/governance'
    }
  ];

  const journeySteps = [
    { label: 'Port Handling', icon: Ship, node: 'Port Authority', active: journey.currentStep >= 0 },
    { label: 'Land Transport', icon: Truck, node: 'Asyad Fleet', active: journey.currentStep >= 1 },
    { label: 'Main Assembly', icon: LayoutGrid, node: 'Hub Alpha', active: journey.currentStep >= 2 },
    { label: 'Site Delivery', icon: Wind, node: 'EPC Site', active: journey.currentStep >= 3 }
  ];

  return (
    <Layout user={user}>
      <div className="space-y-8 animate-in" data-testid="dashboard">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[50px] p-12 text-white relative overflow-hidden shadow-2xl border-b-8 border-cyan-500">
          <div className="relative z-10">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-3 leading-none">Data Mesh Command</h1>
            <p className="text-cyan-400 font-bold uppercase text-sm tracking-widest mb-6">
              Welcome, {user?.name} | Domain: <span className="text-white">{user?.domain}</span>
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider">Mesh Sync Active</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-xs font-bold uppercase tracking-wider">Federated Network</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onClick={() => navigate(pillar.route)}
                className={`pillar-card bg-white p-8 rounded-[45px] border-2 border-${pillar.color}-500 shadow-sm flex flex-col group border-t-8`}
              >
                <div className={`w-14 h-14 bg-${pillar.color}-100 text-${pillar.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${pillar.color}-500 group-hover:text-white transition-all`}>
                  <Icon size="28" />
                </div>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-2 leading-tight">{pillar.title}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow" data-testid="stat-card-vessels">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">Port Vessels</CardTitle>
                  <Ship className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-slate-900">{stats.total_vessels}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">{stats.vessels_in_port} currently berthed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow" data-testid="stat-card-shipments">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">Shipments</CardTitle>
                  <Package className="h-5 w-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-slate-900">{stats.total_shipments}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">{stats.shipments_in_transit} in transit</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow" data-testid="stat-card-sites">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">EPC Sites</CardTitle>
                  <Building2 className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-slate-900">{stats.total_sites}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">{stats.sites_ready} ready</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow" data-testid="stat-card-products">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">Data Products</CardTitle>
                  <Database className="h-5 w-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-slate-900">{stats.data_products}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Available</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Journey Visualization */}
        <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl border-t-8 border-orange-500">
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 leading-none">Hydrogen Logistics Journey</h3>
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {journeySteps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center mb-4 transition-all ${
                      step.active 
                        ? 'bg-orange-500 border-orange-400 text-white pulse-glow' 
                        : 'bg-slate-800 border-slate-700 text-slate-600'
                    }`}>
                      <StepIcon size="32" />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-wider mb-1 ${step.active ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                    <span className="text-xs text-white/30 uppercase font-bold max-w-[80px]">{step.node}</span>
                  </div>
                  {i < journeySteps.length - 1 && (
                    <div className="flex-1 mx-4 h-0.5 border-t-2 border-dashed border-white/10 relative -mt-10">
                      <div 
                        className="absolute top-0 left-0 h-0.5 bg-orange-400 transition-all duration-1000"
                        style={{ width: journey.currentStep > i ? '100%' : journey.currentStep === i ? '50%' : '0%' }}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Events & Quick Access Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-black uppercase tracking-tighter">
                <Activity className="h-5 w-5" />
                Live Mesh Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No events yet</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.event_type === 'vessel_update' ? 'bg-blue-500 status-pulse' : 
                        event.event_type === 'shipment_update' ? 'bg-purple-500 status-pulse' : 
                        'bg-green-500 status-pulse'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-xs uppercase font-bold" variant="outline">{event.domain}</Badge>
                          <span className="text-xs text-slate-400">{event.event_type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium">{event.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-black uppercase tracking-tighter">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/domain/port')}
                  className="w-full p-4 text-left rounded-2xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all domain-badge"
                  data-testid="navigate-port-domain"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Ship className="h-5 w-5 text-blue-600" />
                    <span className="font-black text-blue-900 uppercase text-sm tracking-tight">Port Authority</span>
                  </div>
                  <p className="text-xs text-blue-700 font-medium">Vessel management</p>
                </button>
                
                <button
                  onClick={() => navigate('/domain/fleet')}
                  className="w-full p-4 text-left rounded-2xl border-2 border-purple-100 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all domain-badge"
                  data-testid="navigate-fleet-domain"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Package className="h-5 w-5 text-purple-600" />
                    <span className="font-black text-purple-900 uppercase text-sm tracking-tight">Fleet Operations</span>
                  </div>
                  <p className="text-xs text-purple-700 font-medium">Logistics</p>
                </button>
                
                <button
                  onClick={() => navigate('/domain/epc')}
                  className="w-full p-4 text-left rounded-2xl border-2 border-green-100 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-all domain-badge"
                  data-testid="navigate-epc-domain"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <span className="font-black text-green-900 uppercase text-sm tracking-tight">EPC Sites</span>
                  </div>
                  <p className="text-xs text-green-700 font-medium">Site readiness</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
