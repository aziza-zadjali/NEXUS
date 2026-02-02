import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tower, Route as RouteIcon, FileCheck, CloudSun, Warehouse, Plus, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function LogisticsControlTower() {
  const { user } = useContext(AuthContext);
  const [routes, setRoutes] = useState([]);
  const [permits, setPermits] = useState([]);
  const [weather, setWeather] = useState([]);
  const [assemblyAreas, setAssemblyAreas] = useState([]);
  const [activeTab, setActiveTab] = useState('routes');

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [routesRes, permitsRes, weatherRes, areasRes] = await Promise.all([
        axios.get(`${API}/logistics/routes`, { headers }),
        axios.get(`${API}/logistics/permits`, { headers }),
        axios.get(`${API}/logistics/weather`, { headers }),
        axios.get(`${API}/logistics/assembly-areas`, { headers })
      ]);
      
      setRoutes(routesRes.data);
      setPermits(permitsRes.data);
      setWeather(weatherRes.data);
      setAssemblyAreas(areasRes.data);
    } catch (error) {
      console.error('Failed to fetch logistics data', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-700',
      'planned': 'bg-blue-100 text-blue-700',
      'blocked': 'bg-red-100 text-red-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'available': 'bg-green-100 text-green-700',
      'full': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const approvePermit = async (permitId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/logistics/permits/${permitId}?status=approved`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Permit approved successfully!');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to approve permit');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="logistics-control-tower-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Tower className="h-10 w-10 text-indigo-600" />
            Logistics Control Tower
          </h1>
          <p className="text-slate-600">Integrated logistics management for wind turbine components</p>
        </div>

        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'routes'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="tab-routes"
          >
            <RouteIcon className="h-4 w-4 inline mr-2" />
            Routes
          </button>
          <button
            onClick={() => setActiveTab('permits')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'permits'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="tab-permits"
          >
            <FileCheck className="h-4 w-4 inline mr-2" />
            Permits
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'weather'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="tab-weather"
          >
            <CloudSun className="h-4 w-4 inline mr-2" />
            Weather
          </button>
          <button
            onClick={() => setActiveTab('assembly')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'assembly'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="tab-assembly"
          >
            <Warehouse className="h-4 w-4 inline mr-2" />
            Assembly Areas
          </button>
        </div>

        {activeTab === 'routes' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transport Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routes.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No routes configured</p>
                  ) : (
                    routes.map((route) => (
                      <div
                        key={route.id}
                        className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                        data-testid="route-card"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-slate-900">{route.route_name}</h3>
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                              <MapPin className="h-4 w-4" />
                              <span>{route.origin}</span>
                              <span>→</span>
                              <span>{route.destination}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(route.status)}>
                            {route.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Transport Mode:</span>
                            <p className="font-medium">{route.transport_mode}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Distance:</span>
                            <p className="font-medium">{route.distance_km} km</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Duration:</span>
                            <p className="font-medium">{route.estimated_duration_hours} hrs</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Restrictions:</span>
                            <p className="font-medium">{route.road_restrictions.length} items</p>
                          </div>
                        </div>
                        
                        {route.road_restrictions.length > 0 && (
                          <div className="mt-3 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {route.road_restrictions.map((restriction, idx) => (
                                <span key={idx} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                                  {restriction}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'permits' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logistics Permits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {permits.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No permits requested</p>
                  ) : (
                    permits.map((permit) => (
                      <div
                        key={permit.id}
                        className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                        data-testid="permit-card"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{permit.permit_number}</h3>
                            <p className="text-sm text-slate-600 mt-1">{permit.permit_type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(permit.status)}>
                              {permit.status}
                            </Badge>
                            {permit.status === 'pending' && user?.role === 'admin' && (
                              <Button
                                size="sm"
                                onClick={() => approvePermit(permit.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Shipment ID:</span>
                            <p className="font-medium font-mono">{permit.shipment_id}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Authority:</span>
                            <p className="font-medium">{permit.issuing_authority}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Requested:</span>
                            <p className="font-medium">{permit.requested_date}</p>
                          </div>
                        </div>
                        
                        {permit.restrictions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-1">Restrictions:</p>
                            <div className="flex flex-wrap gap-1">
                              {permit.restrictions.map((restriction, idx) => (
                                <span key={idx} className="text-xs bg-slate-100 px-2 py-1 rounded">
                                  {restriction}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weather Forecasts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weather.length === 0 ? (
                    <p className="col-span-full text-sm text-slate-500 text-center py-8">No weather data</p>
                  ) : (
                    weather.map((forecast) => (
                      <Card
                        key={forecast.id}
                        className={`${forecast.safe_for_transport ? 'border-green-200' : 'border-red-200'}`}
                        data-testid="weather-card"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{forecast.location}</CardTitle>
                            <CloudSun className={`h-5 w-5 ${forecast.safe_for_transport ? 'text-green-600' : 'text-red-600'}`} />
                          </div>
                          <p className="text-xs text-slate-500">{forecast.forecast_date}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Temperature:</span>
                              <span className="font-medium">{forecast.temperature_celsius}°C</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Wind Speed:</span>
                              <span className="font-medium">{forecast.wind_speed_kmh} km/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Visibility:</span>
                              <span className="font-medium">{forecast.visibility_km} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Condition:</span>
                              <span className="font-medium">{forecast.weather_condition}</span>
                            </div>
                            <div className="pt-2 border-t">
                              <Badge className={forecast.safe_for_transport ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {forecast.safe_for_transport ? 'Safe for Transport' : 'Not Safe'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'assembly' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assembly Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assemblyAreas.length === 0 ? (
                    <p className="col-span-full text-sm text-slate-500 text-center py-8">No assembly areas</p>
                  ) : (
                    assemblyAreas.map((area) => (
                      <Card key={area.id} className="border" data-testid="assembly-area-card">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{area.area_name}</CardTitle>
                              <Badge variant="outline" className="mt-1">{area.area_type}</Badge>
                            </div>
                            <Warehouse className="h-6 w-6 text-indigo-600" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-slate-500">Location</p>
                              <p className="font-medium">{area.location}</p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-slate-500">Capacity</p>
                                <p className="font-bold text-lg">{area.capacity}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Occupied</p>
                                <p className="font-bold text-lg">{area.current_occupancy}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Available</p>
                                <p className="font-bold text-lg text-green-600">{area.available_space}</p>
                              </div>
                            </div>
                            
                            <div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    (area.current_occupancy / area.capacity) > 0.8
                                      ? 'bg-red-600'
                                      : (area.current_occupancy / area.capacity) > 0.5
                                      ? 'bg-amber-600'
                                      : 'bg-green-600'
                                  }`}
                                  style={{ width: `${(area.current_occupancy / area.capacity) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {area.components_stored.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Stored Components:</p>
                                <div className="flex flex-wrap gap-1">
                                  {area.components_stored.map((component, idx) => (
                                    <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                                      {component}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LogisticsControlTower;
