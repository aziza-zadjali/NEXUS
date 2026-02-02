import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Ship, Building2, Package, Activity, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, eventsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers }),
        axios.get(`${API}/events`, { headers })
      ]);
      
      setStats(statsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const getEventColor = (eventType) => {
    switch(eventType) {
      case 'vessel_update': return 'bg-blue-100 text-blue-700';
      case 'shipment_update': return 'bg-purple-100 text-purple-700';
      case 'site_update': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="dashboard">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Data Mesh Dashboard</h1>
          <p className="text-slate-600">Welcome, {user?.name} | Domain: <Badge variant="outline" className="ml-1">{user?.domain}</Badge></p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow" data-testid="stat-card-vessels">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Port Vessels</CardTitle>
                <Ship className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.total_vessels}</div>
                <p className="text-xs text-slate-500 mt-1">{stats.vessels_in_port} currently berthed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow" data-testid="stat-card-shipments">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Fleet Shipments</CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.total_shipments}</div>
                <p className="text-xs text-slate-500 mt-1">{stats.shipments_in_transit} in transit</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow" data-testid="stat-card-sites">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">EPC Sites</CardTitle>
                <Building2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.total_sites}</div>
                <p className="text-xs text-slate-500 mt-1">{stats.sites_ready} ready for delivery</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow" data-testid="stat-card-products">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Data Products</CardTitle>
                <Database className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.data_products}</div>
                <p className="text-xs text-slate-500 mt-1">Available in catalog</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2" data-testid="recent-events-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No events yet</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-2 status-pulse ${event.event_type === 'vessel_update' ? 'bg-blue-500' : event.event_type === 'shipment_update' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getEventColor(event.event_type)} variant="secondary">
                            {event.event_type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500 uppercase">{event.domain}</span>
                        </div>
                        <p className="text-sm text-slate-700">{event.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.triggered_actions.map((action, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="domain-access-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Domain Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/domain/port')}
                  className="w-full p-3 text-left rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors domain-badge"
                  data-testid="navigate-port-domain"
                >
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Port Authority</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Vessel & berth management</p>
                </button>
                
                <button
                  onClick={() => navigate('/domain/fleet')}
                  className="w-full p-3 text-left rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors domain-badge"
                  data-testid="navigate-fleet-domain"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900">Fleet Operations</span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">Logistics & shipments</p>
                </button>
                
                <button
                  onClick={() => navigate('/domain/epc')}
                  className="w-full p-3 text-left rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors domain-badge"
                  data-testid="navigate-epc-domain"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">EPC Sites</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">Site readiness tracking</p>
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
