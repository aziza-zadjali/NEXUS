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
import { Building2, Plus, Wrench } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DomainEPC() {
  const { user } = useContext(AuthContext);
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState({
    site_id: '',
    site_name: '',
    readiness_status: 'preparing',
    expected_component: ''
  });

  useEffect(() => {
    fetchSites();
    const interval = setInterval(fetchSites, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/epc/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSites(response.data);
    } catch (error) {
      toast.error('Failed to fetch sites');
    }
  };

  const handleCreateSite = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/epc/sites`, newSite, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Site added successfully!');
      fetchSites();
      setNewSite({
        site_id: '',
        site_name: '',
        readiness_status: 'preparing',
        expected_component: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add site');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'receiving': return 'bg-blue-100 text-blue-700';
      case 'installing': return 'bg-purple-100 text-purple-700';
      case 'complete': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const canEdit = user?.domain === 'epc' || user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="epc-domain-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Building2 className="h-10 w-10 text-green-600" />
              EPC Sites Domain
            </h1>
            <p className="text-slate-600">Hydrogen developer site readiness and installation tracking</p>
          </div>
          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700" data-testid="add-site-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Site
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Site</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSite} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site_id">Site ID</Label>
                      <Input
                        id="site_id"
                        value={newSite.site_id}
                        onChange={(e) => setNewSite({...newSite, site_id: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_name">Site Name</Label>
                      <Input
                        id="site_name"
                        value={newSite.site_name}
                        onChange={(e) => setNewSite({...newSite, site_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="readiness_status">Readiness Status</Label>
                      <select
                        id="readiness_status"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={newSite.readiness_status}
                        onChange={(e) => setNewSite({...newSite, readiness_status: e.target.value})}
                      >
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="receiving">Receiving</option>
                        <option value="installing">Installing</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expected_component">Expected Component</Label>
                      <Input
                        id="expected_component"
                        value={newSite.expected_component}
                        onChange={(e) => setNewSite({...newSite, expected_component: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Add Site
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No sites registered</p>
            </div>
          ) : (
            sites.map((site) => (
              <Card key={site.id} className="hover:shadow-lg transition-shadow" data-testid="site-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        {site.site_name}
                      </CardTitle>
                      <p className="text-sm text-slate-500 font-mono mt-1">{site.site_id}</p>
                    </div>
                    <Badge className={getStatusColor(site.readiness_status)}>
                      {site.readiness_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expected:</span>
                      <span className="font-medium">{site.expected_component}</span>
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

export default DomainEPC;
