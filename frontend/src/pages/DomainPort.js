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
import { Ship, Plus, Anchor } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DomainPort() {
  const { user } = useContext(AuthContext);
  const [vessels, setVessels] = useState([]);
  const [newVessel, setNewVessel] = useState({
    vessel_id: '',
    vessel_name: '',
    status: 'approaching',
    berth_number: '',
    eta: '',
    cargo_type: 'turbine_components'
  });

  useEffect(() => {
    fetchVessels();
    const interval = setInterval(fetchVessels, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchVessels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/port/vessels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVessels(response.data);
    } catch (error) {
      toast.error('Failed to fetch vessels');
    }
  };

  const handleCreateVessel = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/port/vessels`, newVessel, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vessel added successfully!');
      fetchVessels();
      setNewVessel({
        vessel_id: '',
        vessel_name: '',
        status: 'approaching',
        berth_number: '',
        eta: '',
        cargo_type: 'turbine_components'
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add vessel');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approaching': return 'bg-yellow-100 text-yellow-700';
      case 'berthed': return 'bg-green-100 text-green-700';
      case 'unloading': return 'bg-blue-100 text-blue-700';
      case 'departed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const canEdit = user?.domain === 'port' || user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="port-domain-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Ship className="h-10 w-10 text-blue-600" />
              Port Authority Domain
            </h1>
            <p className="text-slate-600">Vessel tracking and berth management at Port of Duqm</p>
          </div>
          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-vessel-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vessel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Vessel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateVessel} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vessel_id">Vessel ID</Label>
                      <Input
                        id="vessel_id"
                        value={newVessel.vessel_id}
                        onChange={(e) => setNewVessel({...newVessel, vessel_id: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vessel_name">Vessel Name</Label>
                      <Input
                        id="vessel_name"
                        value={newVessel.vessel_name}
                        onChange={(e) => setNewVessel({...newVessel, vessel_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={newVessel.status}
                        onChange={(e) => setNewVessel({...newVessel, status: e.target.value})}
                      >
                        <option value="approaching">Approaching</option>
                        <option value="berthed">Berthed</option>
                        <option value="unloading">Unloading</option>
                        <option value="departed">Departed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="berth_number">Berth Number</Label>
                      <Input
                        id="berth_number"
                        value={newVessel.berth_number}
                        onChange={(e) => setNewVessel({...newVessel, berth_number: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eta">ETA</Label>
                      <Input
                        id="eta"
                        type="datetime-local"
                        value={newVessel.eta}
                        onChange={(e) => setNewVessel({...newVessel, eta: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargo_type">Cargo Type</Label>
                      <Input
                        id="cargo_type"
                        value={newVessel.cargo_type}
                        onChange={(e) => setNewVessel({...newVessel, cargo_type: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Add Vessel
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vessels.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Ship className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No vessels registered</p>
            </div>
          ) : (
            vessels.map((vessel) => (
              <Card key={vessel.id} className="hover:shadow-lg transition-shadow" data-testid="vessel-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Anchor className="h-4 w-4" />
                        {vessel.vessel_name}
                      </CardTitle>
                      <p className="text-sm text-slate-500 font-mono mt-1">{vessel.vessel_id}</p>
                    </div>
                    <Badge className={getStatusColor(vessel.status)}>
                      {vessel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {vessel.berth_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Berth:</span>
                        <span className="font-medium">{vessel.berth_number}</span>
                      </div>
                    )}
                    {vessel.eta && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">ETA:</span>
                        <span className="font-medium">{new Date(vessel.eta).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cargo:</span>
                      <span className="font-medium">{vessel.cargo_type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DomainPort;
