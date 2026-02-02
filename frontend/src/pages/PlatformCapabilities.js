import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Server, Wrench, Search, Eye, FileText, Lock, Activity, BarChart3, Users, Zap, Database, Settings } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function PlatformCapabilities() {
  const [capabilities, setCapabilities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const capabilitiesRes = await axios.get(`${API}/platform/capabilities`, { headers });
      const statsRes = await axios.get(`${API}/platform/stats`, { headers });
      
      setCapabilities(capabilitiesRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch platform data');
      setLoading(false);
    }
  };

  const getIcon = (category) => {
    if (category === 'Creation') return Wrench;
    if (category === 'Discovery') return Search;
    if (category === 'Observability') return Eye;
    if (category === 'Governance') return FileText;
    if (category === 'Security') return Lock;
    return Settings;
  };

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
  for (let i = 0; i < capabilities.length; i++) {
    totalUsage = totalUsage + capabilities[i].usage_count;
  }

  let maxDomainProducts = 1;
  if (stats && stats.products_by_domain) {
    const vals = Object.values(stats.products_by_domain);
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] > maxDomainProducts) maxDomainProducts = vals[i];
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
              Domain-agnostic tools and infrastructure enabling teams to build, execute, 
              and maintain interoperable data products without central dependencies.
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

        {stats && stats.products_by_domain && (
          <Card>
            <CardHeader>
              <CardTitle className="font-black uppercase tracking-tighter">Data Products by Domain</CardTitle>
              <CardDescription>Distribution of data products across domain teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700">Port</span>
                    <Badge className="bg-blue-100 text-blue-700">{stats.products_by_domain.port || 0}</Badge>
                  </div>
                  <Progress value={((stats.products_by_domain.port || 0) / maxDomainProducts) * 100} className="h-2" />
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700">Fleet</span>
                    <Badge className="bg-purple-100 text-purple-700">{stats.products_by_domain.fleet || 0}</Badge>
                  </div>
                  <Progress value={((stats.products_by_domain.fleet || 0) / maxDomainProducts) * 100} className="h-2" />
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700">EPC</span>
                    <Badge className="bg-green-100 text-green-700">{stats.products_by_domain.epc || 0}</Badge>
                  </div>
                  <Progress value={((stats.products_by_domain.epc || 0) / maxDomainProducts) * 100} className="h-2" />
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700">Logistics</span>
                    <Badge className="bg-orange-100 text-orange-700">{stats.products_by_domain.logistics || 0}</Badge>
                  </div>
                  <Progress value={((stats.products_by_domain.logistics || 0) / maxDomainProducts) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability) => {
            const Icon = getIcon(capability.category);
            return (
              <Card key={capability.id} className="hover:shadow-lg transition-all hover:-translate-y-1 border-t-4 border-t-cyan-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                      <Icon className="h-6 w-6" />
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {capability.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        <strong className="text-slate-900">{capability.usage_count}</strong> uses
                      </span>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 uppercase text-xs font-bold">
                      {capability.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-slate-900 text-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Self-Serve Platform Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Wrench className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold mb-2">Build</h4>
                <p className="text-sm text-slate-400">
                  Low-code tools for domain teams to create data products without deep technical expertise.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-lg font-bold mb-2">Execute</h4>
                <p className="text-sm text-slate-400">
                  Scalable infrastructure to run and serve data products with guaranteed availability.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-lg font-bold mb-2">Maintain</h4>
                <p className="text-sm text-slate-400">
                  Observability and monitoring tools to ensure data products meet quality SLAs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Self-Serve Data Infrastructure Principle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              The self-serve data infrastructure platform adopts platform thinking to data infrastructure. 
              A dedicated data platform team provides domain-agnostic functionality, tools, and systems 
              to build, execute, and maintain interoperable data products for all domains.
            </p>
            <div className="flex gap-4 mt-6">
              <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30">Platform Thinking</Badge>
              <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30">Domain Autonomy</Badge>
              <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30">Low-Code Tools</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default PlatformCapabilities;
