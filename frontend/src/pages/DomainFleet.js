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
import { Package, Plus, Truck } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DomainFleet() {
  const { user } = useContext(AuthContext);
  const [shipments, setShipments] = useState([]);
  const [newShipment, setNewShipment] = useState({
    shipment_id: '',
    vessel_id: '',
    component_type: 'turbine_blade',
    status: 'pending',
    destination_site: ''
  });

  useEffect(() => {
    fetchShipments();
    const interval = setInterval(fetchShipments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/fleet/shipments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShipments(response.data);
    } catch (error) {
      toast.error('Failed to fetch shipments');
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/fleet/shipments`, newShipment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Shipment created successfully!');
      fetchShipments();
      setNewShipment({
        shipment_id: '',
        vessel_id: '',
        component_type: 'turbine_blade',
        status: 'pending',
        destination_site: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create shipment');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in_transit': return 'bg-blue-100 text-blue-700';
      case 'at_port': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const canEdit = user?.domain === 'fleet' || user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="fleet-domain-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Package className="h-10 w-10 text-purple-600" />
              Fleet Operations Domain
            </h1>
            <p className="text-slate-600">Asyad logistics and shipment tracking</p>
          </div>
          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700" data-testid="create-shipment-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Shipment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Shipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateShipment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipment_id">Shipment ID</Label>
                      <Input
                        id="shipment_id"
                        value={newShipment.shipment_id}
                        onChange={(e) => setNewShipment({...newShipment, shipment_id: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vessel_id">Vessel ID</Label>
                      <Input
                        id="vessel_id"
                        value={newShipment.vessel_id}
                        onChange={(e) => setNewShipment({...newShipment, vessel_id: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="component_type">Component Type</Label>
                    <select
                      id="component_type"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      value={newShipment.component_type}
                      onChange={(e) => setNewShipment({...newShipment, component_type: e.target.value})}
                    >
                      <option value="turbine_blade">Turbine Blade</option>
                      <option value="nacelle">Nacelle</option>
                      <option value="tower_section">Tower Section</option>
                      <option value="generator">Generator</option>
                      <option value="control_system">Control System</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={newShipment.status}
                        onChange={(e) => setNewShipment({...newShipment, status: e.target.value})}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="at_port">At Port</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination_site">Destination Site</Label>
                      <Input
                        id="destination_site"
                        value={newShipment.destination_site}
                        onChange={(e) => setNewShipment({...newShipment, destination_site: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Create Shipment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shipments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No shipments tracked</p>
            </div>
          ) : (
            shipments.map((shipment) => (
              <Card key={shipment.id} className="hover:shadow-lg transition-shadow" data-testid="shipment-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {shipment.component_type}
                      </CardTitle>
                      <p className="text-sm text-slate-500 font-mono mt-1">{shipment.shipment_id}</p>
                    </div>
                    <Badge className={getStatusColor(shipment.status)}>
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vessel:</span>
                      <span className="font-medium font-mono">{shipment.vessel_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination:</span>
                      <span className="font-medium">{shipment.destination_site}</span>
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

export default DomainFleet;
