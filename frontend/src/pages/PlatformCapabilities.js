import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Database, FileText, Zap, Activity, Wrench, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function CapabilityCard({ capability }) {
  return (
    <Card className="hover:shadow-lg transition-all border-t-4 border-t-cyan-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
            <Wrench className="h-6 w-6" />
          </div>
          <Badge className={capability.status === 'active' ? 'bg-emerald-500 text-white' : ''}>
            {capability.status}
          </Badge>
        </div>
        <CardTitle className="text-lg font-black uppercase tracking-tight mt-4">
          {capability.name}
        </CardTitle>
        <CardDescription>{capability.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase">Features</p>
          <div className="flex flex-wrap gap-2">
            {capability.features && capability.features[0] && <Badge variant="outline" className="text-xs">{capability.features[0]}</Badge>}
            {capability.features && capability.features[1] && <Badge variant="outline" className="text-xs">{capability.features[1]}</Badge>}
            {capability.features && capability.features[2] && <Badge variant="outline" className="text-xs">{capability.features[2]}</Badge>}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <span className="text-sm text-slate-600">
            <strong className="text-slate-900">{capability.usage_count}</strong> uses
          </span>
          <Badge className="bg-slate-100 text-slate-700 uppercase text-xs font-bold">
            {capability.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformCapabilities() {
  const [capabilities, setCapabilities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: 'Bearer ' + token };
        
        const capabilitiesRes = await axios.get(API + '/platform/capabilities', { headers });
        const statsRes = await axios.get(API + '/platform/stats', { headers });
        
        setCapabilities(capabilitiesRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch platform data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </Layout>
    );
  }

  let totalUsage = 0;
  if (capabilities && capabilities.length > 0) {
    for (let i = 0; i < capabilities.length; i++) {
      totalUsage = totalUsage + (capabilities[i].usage_count || 0);
    }
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="platform-capabilities-page">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
              Self-Serve Data Infrastructure
            </Badge>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Platform Capabilities</h1>
            <p className="text-emerald-100 font-medium text-lg max-w-2xl">
              Domain-agnostic tools enabling teams to build and maintain data products.
            </p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Data Products</p>
                    <p className="text-3xl font-black text-emerald-600">{stats.total_data_products}</p>
                  </div>
                  <Database className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Contracts</p>
                    <p className="text-3xl font-black text-orange-600">{stats.total_contracts}</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Active Tools</p>
                    <p className="text-3xl font-black text-blue-600">{stats.active_capabilities}</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Usage</p>
                    <p className="text-3xl font-black text-purple-600">{totalUsage}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities && capabilities.length > 0 && capabilities.map(function(capability) {
            return <CapabilityCard key={capability.id} capability={capability} />;
          })}
        </div>

        <Card className="bg-slate-900 text-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Self-Serve Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Wrench className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold mb-2">Build</h4>
                <p className="text-sm text-slate-400">Low-code tools for domain teams.</p>
              </div>
              <div className="p-6 bg-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-lg font-bold mb-2">Execute</h4>
                <p className="text-sm text-slate-400">Scalable infrastructure for data products.</p>
              </div>
              <div className="p-6 bg-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-lg font-bold mb-2">Maintain</h4>
                <p className="text-sm text-slate-400">Observability and monitoring tools.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default PlatformCapabilities;
