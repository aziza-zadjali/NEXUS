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

const StatCard = ({ title, icon: Icon, value, subtitle, color, testId }) => (
  <Card className={`border-l-4 border-l-${color}-500 hover:shadow-md transition-shadow`} data-testid={testId}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-${color}-500`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
);

const DomainCard = ({ title, description, icon: Icon, color, onClick, testId }) => (
  <button
    onClick={onClick}
    className={`w-full p-3 text-left rounded-lg border border-${color}-200 bg-${color}-50 hover:bg-${color}-100 transition-colors domain-badge`}
    data-testid={testId}
  >
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 text-${color}-600`} />
      <span className={`font-medium text-${color}-900`}>{title}</span>
    </div>
    <p className={`text-xs text-${color}-700 mt-1`}>{description}</p>
  </button>
);

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
    const colors = {
      'vessel_update': 'bg-blue-100 text-blue-700',
      'shipment_update': 'bg-purple-100 text-purple-700',
      'site_update': 'bg-green-100 text-green-700'
    };
    return colors[eventType] || 'bg-slate-100 text-slate-700';
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="dashboard">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Data Mesh Dashboard</h1>
          <p className="text-slate-600">
            Welcome, {user?.name} | Domain: <Badge variant="outline" className="ml-1">{user?.domain}</Badge>
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Port Vessels"
              icon={Ship}
              value={stats.total_vessels}
              subtitle={`${stats.vessels_in_port} currently berthed`}
              color="blue"
              testId="stat-card-vessels"
            />
            <StatCard
              title="Fleet Shipments"
              icon={Package}
              value={stats.total_shipments}
              subtitle={`${stats.shipments_in_transit} in transit`}
              color="purple"
              testId="stat-card-shipments"
            />
            <StatCard
              title="EPC Sites"
              icon={Building2}
              value={stats.total_sites}
              subtitle={`${stats.sites_ready} ready for delivery`}
              color="green"
              testId="stat-card-sites"
            />
            <StatCard
              title="Data Products"
              icon={Database}
              value={stats.data_products}
              subtitle="Available in catalog"
              color="amber"
              testId="stat-card-products"
            />
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
                      <div className={`w-2 h-2 rounded-full mt-2 status-pulse ${
                        event.event_type === 'vessel_update' ? 'bg-blue-500' : 
                        event.event_type === 'shipment_update' ? 'bg-purple-500' : 'bg-green-500'
                      }`}></div>
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
                <DomainCard
                  title="Port Authority"
                  description="Vessel & berth management"
                  icon={Ship}
                  color="blue"
                  onClick={() => navigate('/domain/port')}
                  testId="navigate-port-domain"
                />
                <DomainCard
                  title="Fleet Operations"
                  description="Logistics & shipments"
                  icon={Package}
                  color="purple"
                  onClick={() => navigate('/domain/fleet')}
                  testId="navigate-fleet-domain"
                />
                <DomainCard
                  title="EPC Sites"
                  description="Site readiness tracking"
                  icon={Building2}
                  color="green"
                  onClick={() => navigate('/domain/epc')}
                  testId="navigate-epc-domain"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
