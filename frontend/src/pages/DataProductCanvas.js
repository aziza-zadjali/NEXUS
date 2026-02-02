import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Database, Users, FileText, Settings, Shield, Clock, 
  GitBranch, Layers, CheckCircle2, AlertCircle, Eye,
  ArrowRight, Box, Server, Code, Calendar, User
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function UbiquitousLanguageList({ language }) {
  if (!language) return <p className="text-sm text-slate-500">No terminology defined</p>;
  
  const terms = [];
  for (const key in language) {
    if (language.hasOwnProperty(key)) {
      terms.push({ term: key, definition: language[key] });
    }
  }
  
  return (
    <div className="space-y-3">
      {terms.map(function(item, idx) {
        return (
          <div key={idx} className="p-4 border rounded-lg">
            <dt className="font-bold text-slate-900">{item.term}</dt>
            <dd className="text-sm text-slate-600 mt-1">{item.definition}</dd>
          </div>
        );
      })}
    </div>
  );
}

function CanvasCard({ canvas, onView }) {
  const getClassificationColor = (classification) => {
    if (classification === 'source-aligned') return 'bg-blue-100 text-blue-700';
    if (classification === 'aggregate') return 'bg-purple-100 text-purple-700';
    if (classification === 'consumer-aligned') return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-emerald-500 text-white';
    if (status === 'draft') return 'bg-amber-500 text-white';
    return 'bg-slate-500 text-white';
  };

  const getDomainColor = (domain) => {
    if (domain === 'port') return 'border-t-blue-500';
    if (domain === 'fleet') return 'border-t-purple-500';
    if (domain === 'epc') return 'border-t-green-500';
    if (domain === 'logistics') return 'border-t-orange-500';
    return 'border-t-slate-500';
  };

  return (
    <Card className={`hover:shadow-lg transition-all border-t-4 ${getDomainColor(canvas.domain)}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">{canvas.name}</CardTitle>
            <CardDescription className="capitalize">{canvas.domain} Domain • v{canvas.version}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getClassificationColor(canvas.classification)}>{canvas.classification}</Badge>
            <Badge className={getStatusColor(canvas.status)}>{canvas.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">{canvas.description}</p>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{canvas.consumers ? canvas.consumers.length : 0}</p>
            <p className="text-xs text-slate-500">Consumers</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{canvas.output_ports ? canvas.output_ports.length : 0}</p>
            <p className="text-xs text-slate-500">Output Ports</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{canvas.data_model ? canvas.data_model.length : 0}</p>
            <p className="text-xs text-slate-500">Fields</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User className="h-4 w-4" />
            <span>{canvas.owner_name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onView(canvas)}>
            <Eye className="h-4 w-4 mr-1" /> View Canvas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CanvasDetailView({ canvas, onClose }) {
  if (!canvas) return null;

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-2">{canvas.classification}</Badge>
            <h2 className="text-2xl font-black uppercase tracking-tight">{canvas.name}</h2>
            <p className="text-slate-300 capitalize">{canvas.domain} Domain • Version {canvas.version}</p>
          </div>
          <Badge className={canvas.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}>{canvas.status}</Badge>
        </div>
        <p className="mt-4 text-slate-300">{canvas.description}</p>
        <div className="flex gap-6 mt-4 text-sm">
          <span><strong>Owner:</strong> {canvas.owner_name}</span>
          <span><strong>Date:</strong> {canvas.date}</span>
        </div>
      </div>

      <Tabs defaultValue="contract" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contract" className="text-xs font-bold">Data Contract</TabsTrigger>
          <TabsTrigger value="consumers" className="text-xs font-bold">Consumers</TabsTrigger>
          <TabsTrigger value="sources" className="text-xs font-bold">Sources</TabsTrigger>
          <TabsTrigger value="architecture" className="text-xs font-bold">Architecture</TabsTrigger>
          <TabsTrigger value="language" className="text-xs font-bold">Language</TabsTrigger>
        </TabsList>

        {/* Data Contract Tab */}
        <TabsContent value="contract" className="space-y-4">
          {/* Output Ports */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase">Output Ports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {canvas.output_ports && canvas.output_ports.map(function(port, idx) {
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <Badge variant="outline" className="mr-2">{port.format}</Badge>
                        <span className="text-sm font-medium">{port.description}</span>
                      </div>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">{port.location}</code>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Data Model */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase">Data Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-bold">Field</th>
                      <th className="text-left py-2 font-bold">Type</th>
                      <th className="text-left py-2 font-bold">Description</th>
                      <th className="text-left py-2 font-bold">Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canvas.data_model && canvas.data_model.map(function(field, idx) {
                      return (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="py-2 font-mono text-blue-600">{field.name}</td>
                          <td className="py-2 font-mono text-purple-600">{field.data_type}</td>
                          <td className="py-2 text-slate-600">{field.description}</td>
                          <td className="py-2">
                            {field.is_business_key && <Badge className="bg-amber-100 text-amber-700 mr-1 text-xs">BK</Badge>}
                            {field.is_join_key && <Badge className="bg-blue-100 text-blue-700 mr-1 text-xs">JK</Badge>}
                            {field.is_pii && <Badge className="bg-red-100 text-red-700 text-xs">PII</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quality & SLAs */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase">Quality Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {canvas.quality_checks && canvas.quality_checks.map(function(check, idx) {
                    return (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-sm">{check.check_name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{check.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase">SLAs</CardTitle>
              </CardHeader>
              <CardContent>
                {canvas.sla && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Availability:</span><strong>{canvas.sla.availability}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Support:</span><strong>{canvas.sla.support_hours}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Retention:</span><strong>{canvas.sla.retention_period}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Response:</span><strong>{canvas.sla.response_time}</strong></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase">Security</CardTitle>
            </CardHeader>
            <CardContent>
              {canvas.security && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Access Level</p>
                    <Badge className="capitalize">{canvas.security.access_level}</Badge>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Allowed Domains</p>
                    <div className="flex flex-wrap gap-1">
                      {canvas.security.allowed_domains && canvas.security.allowed_domains[0] && <Badge variant="outline" className="text-xs">{canvas.security.allowed_domains[0]}</Badge>}
                      {canvas.security.allowed_domains && canvas.security.allowed_domains[1] && <Badge variant="outline" className="text-xs">{canvas.security.allowed_domains[1]}</Badge>}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">PII Handling</p>
                    <p className="text-sm">{canvas.security.pii_handling}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumers Tab */}
        <TabsContent value="consumers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase">Consumers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {canvas.consumers && canvas.consumers.map(function(consumer, idx) {
                  return (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{consumer.name}</span>
                        <Badge variant="outline" className="capitalize">{consumer.domain}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">Role: {consumer.role}</p>
                      <div className="mt-2">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Use Cases</p>
                        <div className="flex flex-wrap gap-1">
                          {consumer.use_cases && consumer.use_cases.map(function(uc, i) {
                            return <Badge key={i} variant="outline" className="text-xs">{uc}</Badge>;
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase">Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {canvas.use_cases && canvas.use_cases.map(function(useCase, idx) {
                  return (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-bold text-slate-900">{useCase.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{useCase.description}</p>
                      <p className="text-sm mt-2"><strong>Objective:</strong> {useCase.business_objective}</p>
                      <div className="mt-2">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Success Metrics</p>
                        <div className="flex flex-wrap gap-1">
                          {useCase.success_metrics && useCase.success_metrics.map(function(metric, i) {
                            return <Badge key={i} className="bg-emerald-100 text-emerald-700 text-xs">{metric}</Badge>;
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase">Input Ports (Sources)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {canvas.input_ports && canvas.input_ports.map(function(port, idx) {
                  return (
                    <div key={idx} className="p-4 border rounded-lg flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${port.source_type === 'data_product' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {port.source_type === 'data_product' ? <Database className="h-5 w-5" /> : <Server className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{port.source_name}</span>
                          <Badge variant="outline" className="capitalize text-xs">{port.source_domain}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{port.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-slate-100 text-slate-700 text-xs">{port.format}</Badge>
                          <Badge className="bg-slate-100 text-slate-700 text-xs">{port.protocol}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-4">
          {canvas.architecture && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Code className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Processing</p>
                    <p className="font-bold capitalize">{canvas.architecture.processing_type}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Settings className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Framework</p>
                    <p className="font-bold">{canvas.architecture.framework}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Database className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Storage</p>
                    <p className="font-bold capitalize">{canvas.architecture.storage_type}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Server className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Query Engine</p>
                    <p className="font-bold">{canvas.architecture.query_engine}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase">Transformation Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 overflow-x-auto py-2">
                    {canvas.architecture.transformation_steps && canvas.architecture.transformation_steps.map(function(step, idx) {
                      return (
                        <React.Fragment key={idx}>
                          <div className="flex-shrink-0 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium">{step}</div>
                          {idx < canvas.architecture.transformation_steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Scheduling</p>
                    <Badge className="bg-blue-100 text-blue-700">{canvas.architecture.scheduling_tool}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Monitoring</p>
                    <Badge className="bg-purple-100 text-purple-700">{canvas.architecture.monitoring_tool}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Estimated Cost</p>
                    <Badge className="bg-green-100 text-green-700">{canvas.architecture.estimated_cost || 'TBD'}</Badge>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Ubiquitous Language Tab */}
        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase">Ubiquitous Language</CardTitle>
              <CardDescription>Domain-specific terminology for this data product</CardDescription>
            </CardHeader>
            <CardContent>
              <UbiquitousLanguageList language={canvas.ubiquitous_language} />
            </CardContent>
          </Card>

          {canvas.follow_up_actions && canvas.follow_up_actions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase">Follow-up Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {canvas.follow_up_actions.map(function(action, idx) {
                    return (
                      <li key={idx} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">{action}</span>
                      </li>
                    );
                  })}
                </ul>
                {canvas.follow_up_date && (
                  <p className="mt-4 text-sm text-slate-500">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Due: {canvas.follow_up_date}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DataProductCanvas() {
  const [canvases, setCanvases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCanvas, setSelectedCanvas] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };
      
      const canvasRes = await axios.get(API + '/canvas', { headers });
      const statsRes = await axios.get(API + '/canvas/stats', { headers });
      
      setCanvases(canvasRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch data product canvases');
      setLoading(false);
    }
  };

  const handleViewCanvas = (canvas) => {
    setSelectedCanvas(canvas);
    setDialogOpen(true);
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
      <div className="space-y-8" data-testid="data-product-canvas-page">
        {/* Header */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
              Data Product Canvas
            </Badge>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Data Products</h1>
            <p className="text-cyan-100 font-medium text-lg max-w-2xl">
              Design and manage data products using the Data Product Canvas framework. 
              Each canvas defines consumers, contracts, sources, architecture, and domain language.
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-cyan-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Canvases</p>
                    <p className="text-3xl font-black text-cyan-600">{stats.total}</p>
                  </div>
                  <Database className="h-8 w-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Active</p>
                    <p className="text-3xl font-black text-emerald-600">{stats.by_status ? stats.by_status.active : 0}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Source-Aligned</p>
                    <p className="text-3xl font-black text-blue-600">{stats.by_classification ? stats.by_classification.source_aligned : 0}</p>
                  </div>
                  <Layers className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Aggregate</p>
                    <p className="text-3xl font-black text-purple-600">{stats.by_classification ? stats.by_classification.aggregate : 0}</p>
                  </div>
                  <GitBranch className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Canvas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canvases && canvases.length > 0 && canvases.map(function(canvas) {
            return <CanvasCard key={canvas.id} canvas={canvas} onView={handleViewCanvas} />;
          })}
        </div>

        {/* Canvas Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-black uppercase tracking-tight">Data Product Canvas</DialogTitle>
            </DialogHeader>
            <CanvasDetailView canvas={selectedCanvas} onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Canvas Building Blocks Info */}
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Canvas Building Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800 rounded-xl">
                <Users className="h-6 w-6 text-blue-400 mb-2" />
                <h4 className="font-bold mb-1">Consumers</h4>
                <p className="text-xs text-slate-400">Who uses this data product and why</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-xl">
                <FileText className="h-6 w-6 text-purple-400 mb-2" />
                <h4 className="font-bold mb-1">Data Contract</h4>
                <p className="text-xs text-slate-400">Output ports, schema, SLAs, security</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-xl">
                <Database className="h-6 w-6 text-green-400 mb-2" />
                <h4 className="font-bold mb-1">Sources</h4>
                <p className="text-xs text-slate-400">Input ports from systems and data products</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-xl">
                <Settings className="h-6 w-6 text-orange-400 mb-2" />
                <h4 className="font-bold mb-1">Architecture</h4>
                <p className="text-xs text-slate-400">Processing, storage, transformations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default DataProductCanvas;
