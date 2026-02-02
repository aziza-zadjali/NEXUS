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

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="dashboard">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Data Mesh Dashboard</h1>
          <p className="text-slate-600">Welcome, {user.name}</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500" data-testid="stat-card-vessels">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Port Vessels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total_vessels}</div>
                <p className="text-xs text-slate-500 mt-1">{stats.vessels_in_port} berthed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500" data-testid="stat-card-shipments">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Fleet Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total_shipments}</div>
                <p className="text-xs text-slate-500 mt-1">{stats.shipments_in_transit} in transit</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500" data-testid="stat-card-sites">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">EPC Sites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total_sites}</div>
                <p className="text-xs text-slate-500 mt-1">{stats.sites_ready} ready</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500" data-testid="stat-card-products">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Data Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.data_products}</div>
                <p className="text-xs text-slate-500 mt-1">Available</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No events yet</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg border">
                      <Badge className="mb-2">{event.event_type}</Badge>
                      <p className="text-sm">{event.description}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/domain/port')}
                  className="w-full p-3 text-left rounded-lg border bg-blue-50"
                  data-testid="navigate-port-domain"
                >
                  <div className="font-medium">Port Authority</div>
                  <p className="text-xs text-slate-600">Vessel management</p>
                </button>
                <button
                  onClick={() => navigate('/domain/fleet')}
                  className="w-full p-3 text-left rounded-lg border bg-purple-50"
                  data-testid="navigate-fleet-domain"
                >
                  <div className="font-medium">Fleet Operations</div>
                  <p className="text-xs text-slate-600">Logistics</p>
                </button>
                <button
                  onClick={() => navigate('/domain/epc')}
                  className="w-full p-3 text-left rounded-lg border bg-green-50"
                  data-testid="navigate-epc-domain"
                >
                  <div className="font-medium">EPC Sites</div>
                  <p className="text-xs text-slate-600">Site readiness</p>
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
