import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Plus, CheckCircle2, AlertTriangle, XCircle, 
  Clock, Gauge, Target, Shield, GitBranch, ArrowRight,
  Activity, TrendingUp, TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DataContracts() {
  const [contracts, setContracts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [lineages, setLineages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [contractsRes, metricsRes, lineagesRes, productsRes] = await Promise.all([
        axios.get(`${API}/contracts`, { headers }),
        axios.get(`${API}/quality/metrics`, { headers }),
        axios.get(`${API}/lineage`, { headers }),
        axios.get(`${API}/catalog/products`, { headers })
      ]);
      
      setContracts(contractsRes.data);
      setMetrics(metricsRes.data);
      setLineages(lineagesRes.data);
      setProducts(productsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : productId;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  const getMetricsByProduct = (productId) => {
    return metrics.filter(m => m.data_product_id === productId);
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

  return (
    <Layout>
      <div className="space-y-8" data-testid="data-contracts-page">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-[50px] p-12 text-white relative overflow-hidden shadow-2xl border-b-8 border-orange-400">
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
              Data as a Product Principle
            </Badge>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-3 leading-none">Data Contracts & Quality</h1>
            <p className="text-orange-100 font-medium text-lg max-w-2xl">
              Treat data as a product with formal contracts, SLAs, and quality guarantees. 
              Domain teams are responsible for satisfying the needs of data consumers.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
            <TabsTrigger value="contracts" className="font-bold uppercase text-xs">Contracts</TabsTrigger>
            <TabsTrigger value="quality" className="font-bold uppercase text-xs">Quality</TabsTrigger>
            <TabsTrigger value="lineage" className="font-bold uppercase text-xs">Lineage</TabsTrigger>
          </TabsList>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {contracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">
                          {getProductName(contract.data_product_id)}
                        </CardTitle>
                        <CardDescription>
                          Version {contract.version} • Owner: {contract.owner}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="font-bold">v{contract.version}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">{contract.description}</p>

                    {/* Quality SLA */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-700">Quality SLA</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(contract.quality_sla).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                            <span className="text-xs font-bold text-slate-500 capitalize">{key}</span>
                            <span className="text-sm font-black text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Schema Preview */}
                    <div className="p-4 bg-slate-900 rounded-xl">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Schema Definition</h4>
                      <div className="space-y-2">
                        {Object.entries(contract.schema_definition).slice(0, 3).map(([field, def]) => (
                          <div key={field} className="flex items-center gap-2 text-sm">
                            <span className="text-cyan-400 font-mono">{field}</span>
                            <span className="text-slate-500">:</span>
                            <span className="text-amber-300 font-mono">{def.type}</span>
                            {def.required && <Badge className="bg-red-500/20 text-red-300 text-xs">required</Badge>}
                          </div>
                        ))}
                        {Object.keys(contract.schema_definition).length > 3 && (
                          <span className="text-slate-500 text-xs">+{Object.keys(contract.schema_definition).length - 3} more fields</span>
                        )}
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Update: {contract.update_frequency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>Retention: {contract.retention_period}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-6">
            {/* Quality Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Healthy</p>
                      <p className="text-3xl font-black text-emerald-600">
                        {metrics.filter(m => m.status === 'healthy').length}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Warning</p>
                      <p className="text-3xl font-black text-amber-600">
                        {metrics.filter(m => m.status === 'warning').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Critical</p>
                      <p className="text-3xl font-black text-red-600">
                        {metrics.filter(m => m.status === 'critical').length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Total Metrics</p>
                      <p className="text-3xl font-black text-blue-600">{metrics.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Metrics Table */}
            <Card>
              <CardHeader>
                <CardTitle className="font-black uppercase tracking-tighter">Quality Metrics</CardTitle>
                <CardDescription>Real-time quality measurements for all data products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(metric.status)}
                        <div>
                          <p className="font-bold text-slate-900">{getProductName(metric.data_product_id)}</p>
                          <p className="text-xs text-slate-500 capitalize">{metric.metric_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-500">Value</p>
                          <p className={`text-lg font-black ${
                            metric.value >= metric.threshold ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {metric.value}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-500">Threshold</p>
                          <p className="text-lg font-black text-slate-700">{metric.threshold}%</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {metric.value >= metric.threshold ? (
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lineage Tab */}
          <TabsContent value="lineage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-black uppercase tracking-tighter">Data Lineage</CardTitle>
                <CardDescription>Understand how data flows between products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lineages.map((lineage) => (
                    <div key={lineage.id} className="p-6 rounded-xl border bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-xs font-bold text-blue-500 uppercase mb-1">Source</p>
                          <p className="font-bold text-blue-900">{getProductName(lineage.source_product_id)}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Badge className="bg-slate-900 text-white uppercase text-xs font-bold">
                            {lineage.relationship_type}
                          </Badge>
                          <ArrowRight className="h-6 w-6 text-slate-400" />
                        </div>
                        <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                          <p className="text-xs font-bold text-emerald-500 uppercase mb-1">Target</p>
                          <p className="font-bold text-emerald-900">{getProductName(lineage.target_product_id)}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-slate-600 italic">
                        {lineage.transformation_description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data as Product Principle Explanation */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Data as a Product Principle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              The <strong className="text-white">data as a product principle</strong> projects a product thinking 
              philosophy onto analytical data. This means that there are consumers for the data beyond the domain.
            </p>
            <p className="text-slate-300 leading-relaxed">
              The domain team is responsible for satisfying the needs of other domains by providing high-quality data. 
              Domain data should be treated as any other <strong className="text-white">public API</strong> with 
              formal contracts, versioning, SLAs, and quality guarantees.
            </p>
            <div className="flex gap-4 mt-6">
              <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">Product Thinking</Badge>
              <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">Quality SLAs</Badge>
              <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">Data Contracts</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default DataContracts;
