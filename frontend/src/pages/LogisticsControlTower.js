import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tower, MapPin, AlertTriangle, CloudSun, Warehouse } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function LogisticsControlTower() {
  const [routes, setRoutes] = useState([]);
  const [permits, setPermits] = useState([]);
  const [weather, setWeather] = useState([]);
  const [assemblyAreas, setAssemblyAreas] = useState([]);
  const [activeTab, setActiveTab] = useState('routes');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    
    axios.get(`${API}/logistics/routes`, { headers })
      .then(res => setRoutes(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API}/logistics/permits`, { headers })
      .then(res => setPermits(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API}/logistics/weather`, { headers })
      .then(res => setWeather(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API}/logistics/assembly-areas`, { headers })
      .then(res => setAssemblyAreas(res.data))
      .catch(err => console.error(err));
  }, []);

  const getStatusColor = (status) => {
    if (status === 'active' || status === 'approved' || status === 'available') return 'bg-green-100 text-green-700';
    if (status === 'pending' || status === 'planned') return 'bg-yellow-100 text-yellow-700';
    if (status === 'blocked' || status === 'rejected' || status === 'full') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="logistics-control-tower-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Logistics Control Tower</h1>
          <p className="text-slate-600">Integrated wind turbine components management</p>
        </div>

        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 ${activeTab === 'routes' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-slate-600'}`}
            data-testid="tab-routes"
          >
            Routes
          </button>
          <button
            onClick={() => setActiveTab('permits')}
            className={`px-4 py-2 ${activeTab === 'permits' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-slate-600'}`}
            data-testid="tab-permits"
          >
            Permits
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 ${activeTab === 'weather' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-slate-600'}`}
            data-testid="tab-weather"
          >
            Weather
          </button>
          <button
            onClick={() => setActiveTab('assembly')}
            className={`px-4 py-2 ${activeTab === 'assembly' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-slate-600'}`}
            data-testid="tab-assembly"
          >
            Assembly Areas
          </button>
        </div>

        {activeTab === 'routes' && (
          <Card>
            <CardHeader>
              <CardTitle>Transport Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routes.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">No routes</p>
                ) : (
                  routes.map((route) => (
                    <div key={route.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{route.route_name}</h3>
                          <div className="text-sm text-slate-600 mt-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {route.origin} → {route.destination}
                          </div>
                        </div>
                        <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <div><span className="text-slate-500">Distance:</span> {route.distance_km} km</div>
                        <div><span className="text-slate-500">Duration:</span> {route.estimated_duration_hours} hrs</div>
                      </div>
                      {route.road_restrictions.length > 0 && (
                        <div className="mt-2 text-xs">
                          <AlertTriangle className="h-3 w-3 inline text-amber-600 mr-1" />
                          {route.road_restrictions.join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'permits' && (
          <Card>
            <CardHeader>
              <CardTitle>Logistics Permits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {permits.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">No permits</p>
                ) : (
                  permits.map((permit) => (
                    <div key={permit.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{permit.permit_number}</h3>
                          <p className="text-sm text-slate-600">{permit.permit_type}</p>
                        </div>
                        <Badge className={getStatusColor(permit.status)}>{permit.status}</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><span className="text-slate-500">Shipment:</span> {permit.shipment_id}</div>
                        <div><span className="text-slate-500">Authority:</span> {permit.issuing_authority}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'weather' && (
          <Card>
            <CardHeader>
              <CardTitle>Weather Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weather.length === 0 ? (
                  <p className="col-span-full text-sm text-slate-500 py-8 text-center">No weather data</p>
                ) : (
                  weather.map((forecast) => (
                    <div key={forecast.id} className={`p-4 border rounded-lg ${forecast.safe_for_transport ? 'border-green-200' : 'border-red-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{forecast.location}</h3>
                          <p className="text-xs text-slate-500">{forecast.forecast_date}</p>
                        </div>
                        <CloudSun className={`h-5 w-5 ${forecast.safe_for_transport ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>Temp: {forecast.temperature_celsius}°C</div>
                        <div>Wind: {forecast.wind_speed_kmh} km/h</div>
                        <div>Visibility: {forecast.visibility_km} km</div>
                        <Badge className={getStatusColor(forecast.safe_for_transport ? 'approved' : 'rejected')}>
                          {forecast.safe_for_transport ? 'Safe' : 'Not Safe'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'assembly' && (
          <Card>
            <CardHeader>
              <CardTitle>Assembly Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assemblyAreas.length === 0 ? (
                  <p className="col-span-full text-sm text-slate-500 py-8 text-center">No assembly areas</p>
                ) : (
                  assemblyAreas.map((area) => (
                    <div key={area.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{area.area_name}</h3>
                          <Badge variant="outline" className="mt-1">{area.area_type}</Badge>
                        </div>
                        <Warehouse className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="text-sm mb-2">
                        <p className="text-slate-500">Location: {area.location}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                        <div><span className="text-slate-500">Capacity</span><p className="font-bold">{area.capacity}</p></div>
                        <div><span className="text-slate-500">Occupied</span><p className="font-bold">{area.current_occupancy}</p></div>
                        <div><span className="text-slate-500">Available</span><p className="font-bold text-green-600">{area.available_space}</p></div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                        <div
                          className="h-2 rounded-full bg-indigo-600"
                          style={{ width: `${(area.current_occupancy / area.capacity) * 100}%` }}
                        ></div>
                      </div>
                      {area.components_stored.length > 0 && (
                        <div className="text-xs">
                          <p className="text-slate-500 mb-1">Components:</p>
                          <div className="flex flex-wrap gap-1">
                            {area.components_stored.map((comp, idx) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{comp}</span>
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
        )}
      </div>
    </Layout>
  );
}

export default LogisticsControlTower;
