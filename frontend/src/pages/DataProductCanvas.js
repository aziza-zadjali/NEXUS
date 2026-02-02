import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Database, Users, FileText, Settings, Shield, Layers, CheckCircle2, Eye, ArrowRight, Server, Code, User, Plus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function CanvasCard({ canvas, onView }) {
  let classColor = 'bg-slate-100 text-slate-700';
  if (canvas.classification === 'source-aligned') classColor = 'bg-blue-100 text-blue-700';
  if (canvas.classification === 'aggregate') classColor = 'bg-purple-100 text-purple-700';
  if (canvas.classification === 'consumer-aligned') classColor = 'bg-green-100 text-green-700';

  let statusColor = 'bg-slate-500 text-white';
  if (canvas.status === 'active') statusColor = 'bg-emerald-500 text-white';
  if (canvas.status === 'draft') statusColor = 'bg-amber-500 text-white';

  let domainBorder = 'border-t-slate-500';
  if (canvas.domain === 'port') domainBorder = 'border-t-blue-500';
  if (canvas.domain === 'fleet') domainBorder = 'border-t-purple-500';
  if (canvas.domain === 'epc') domainBorder = 'border-t-green-500';

  const consumerCount = canvas.consumers ? canvas.consumers.length : 0;
  const outputCount = canvas.output_ports ? canvas.output_ports.length : 0;
  const fieldCount = canvas.data_model ? canvas.data_model.length : 0;

  return (
    <Card className={'hover:shadow-lg transition-all border-t-4 ' + domainBorder}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">{canvas.name}</CardTitle>
            <CardDescription className="capitalize">{canvas.domain} Domain • v{canvas.version}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={classColor}>{canvas.classification}</Badge>
            <Badge className={statusColor}>{canvas.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">{canvas.description}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{consumerCount}</p>
            <p className="text-xs text-slate-500">Consumers</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{outputCount}</p>
            <p className="text-xs text-slate-500">Output Ports</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{fieldCount}</p>
            <p className="text-xs text-slate-500">Fields</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User className="h-4 w-4" />
            <span>{canvas.owner_name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={function() { onView(canvas); }}>
            <Eye className="h-4 w-4 mr-1" /> View Canvas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OutputPortsList({ ports }) {
  if (!ports || ports.length === 0) return <p className="text-sm text-slate-500">No output ports</p>;
  
  const items = [];
  for (let i = 0; i < ports.length; i++) {
    items.push(
      <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <Badge variant="outline" className="mr-2">{ports[i].format}</Badge>
          <span className="text-sm font-medium">{ports[i].description}</span>
        </div>
        <code className="text-xs bg-slate-100 px-2 py-1 rounded">{ports[i].location}</code>
      </div>
    );
  }
  return <div className="space-y-2">{items}</div>;
}

function DataModelTable({ fields }) {
  if (!fields || fields.length === 0) return <p className="text-sm text-slate-500">No data model</p>;

  const rows = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    rows.push(
      <tr key={i} className="border-b hover:bg-slate-50">
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
  }

  return (
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
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

function QualityChecksList({ checks }) {
  if (!checks || checks.length === 0) return <p className="text-sm text-slate-500">No quality checks</p>;

  const items = [];
  for (let i = 0; i < checks.length; i++) {
    items.push(
      <div key={i} className="p-2 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="font-medium text-sm">{checks[i].check_name}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{checks[i].description}</p>
      </div>
    );
  }
  return <div className="space-y-2">{items}</div>;
}

function ConsumersList({ consumers }) {
  if (!consumers || consumers.length === 0) return <p className="text-sm text-slate-500">No consumers</p>;

  const items = [];
  for (let i = 0; i < consumers.length; i++) {
    const consumer = consumers[i];
    const useCases = [];
    if (consumer.use_cases) {
      for (let j = 0; j < consumer.use_cases.length; j++) {
        useCases.push(<Badge key={j} variant="outline" className="text-xs">{consumer.use_cases[j]}</Badge>);
      }
    }
    items.push(
      <div key={i} className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">{consumer.name}</span>
          <Badge variant="outline" className="capitalize">{consumer.domain}</Badge>
        </div>
        <p className="text-sm text-slate-500">Role: {consumer.role}</p>
        <div className="mt-2 flex flex-wrap gap-1">{useCases}</div>
      </div>
    );
  }
  return <div className="space-y-3">{items}</div>;
}

function InputPortsList({ ports }) {
  if (!ports || ports.length === 0) return <p className="text-sm text-slate-500">No input ports</p>;

  const items = [];
  for (let i = 0; i < ports.length; i++) {
    const port = ports[i];
    const iconClass = port.source_type === 'data_product' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600';
    items.push(
      <div key={i} className="p-4 border rounded-lg flex items-start gap-4">
        <div className={'w-10 h-10 rounded-lg flex items-center justify-center ' + iconClass}>
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
  }
  return <div className="space-y-3">{items}</div>;
}

function TransformationPipeline({ steps }) {
  if (!steps || steps.length === 0) return <p className="text-sm text-slate-500">No transformation steps</p>;

  const items = [];
  for (let i = 0; i < steps.length; i++) {
    items.push(
      <React.Fragment key={i}>
        <div className="flex-shrink-0 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium">{steps[i]}</div>
        {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
      </React.Fragment>
    );
  }
  return <div className="flex items-center gap-2 overflow-x-auto py-2">{items}</div>;
}

function CanvasDetailView({ canvas }) {
  if (!canvas) return null;

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-2">{canvas.classification}</Badge>
            <h2 className="text-2xl font-black uppercase tracking-tight">{canvas.name}</h2>
            <p className="text-slate-300 capitalize">{canvas.domain} Domain • v{canvas.version}</p>
          </div>
          <Badge className={canvas.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}>{canvas.status}</Badge>
        </div>
        <p className="mt-4 text-slate-300">{canvas.description}</p>
        <div className="flex gap-6 mt-4 text-sm">
          <span><strong>Owner:</strong> {canvas.owner_name}</span>
          <span><strong>Date:</strong> {canvas.date}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Output Ports</CardTitle>
          </CardHeader>
          <CardContent>
            <OutputPortsList ports={canvas.output_ports} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Input Ports</CardTitle>
          </CardHeader>
          <CardContent>
            <InputPortsList ports={canvas.input_ports} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase">Data Model</CardTitle>
        </CardHeader>
        <CardContent>
          <DataModelTable fields={canvas.data_model} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Quality Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <QualityChecksList checks={canvas.quality_checks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Consumers</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsumersList consumers={canvas.consumers} />
          </CardContent>
        </Card>
      </div>

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
              <TransformationPipeline steps={canvas.architecture.transformation_steps} />
            </CardContent>
          </Card>
        </>
      )}

      {canvas.sla && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">SLAs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div><span className="text-slate-500">Availability:</span> <strong>{canvas.sla.availability}</strong></div>
              <div><span className="text-slate-500">Support:</span> <strong>{canvas.sla.support_hours}</strong></div>
              <div><span className="text-slate-500">Retention:</span> <strong>{canvas.sla.retention_period}</strong></div>
              <div><span className="text-slate-500">Response:</span> <strong>{canvas.sla.response_time}</strong></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DataProductCanvas() {
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCanvas, setSelectedCanvas] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(function() {
    const fetchData = async function() {
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
    fetchData();
  }, []);

  const handleViewCanvas = function(canvas) {
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

  const canvasItems = [];
  for (let i = 0; i < canvases.length; i++) {
    canvasItems.push(<CanvasCard key={canvases[i].id} canvas={canvases[i]} onView={handleViewCanvas} />);
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="data-product-canvas-page">
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
                Data Product Canvas
              </Badge>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Data Products</h1>
              <p className="text-cyan-100 font-medium text-lg max-w-2xl">
                Design and manage data products using the Data Product Canvas framework.
              </p>
            </div>
            <Button 
              onClick={function() { navigate('/canvas/create'); }} 
              className="bg-white text-cyan-600 hover:bg-cyan-50 font-bold"
            >
              <Plus className="h-5 w-5 mr-2" /> Design New Data Product
            </Button>
          </div>
        </div>

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
                  <Layers className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canvasItems}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-black uppercase tracking-tight">Data Product Canvas</DialogTitle>
            </DialogHeader>
            <CanvasDetailView canvas={selectedCanvas} />
          </DialogContent>
        </Dialog>

        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Canvas Building Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800 rounded-xl">
                <Users className="h-6 w-6 text-blue-400 mb-2" />
                <h4 className="font-bold mb-1">Consumers</h4>
                <p className="text-xs text-slate-400">Who uses this data product</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-xl">
                <FileText className="h-6 w-6 text-purple-400 mb-2" />
                <h4 className="font-bold mb-1">Data Contract</h4>
                <p className="text-xs text-slate-400">Schema, SLAs, security</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-xl">
                <Database className="h-6 w-6 text-green-400 mb-2" />
                <h4 className="font-bold mb-1">Sources</h4>
                <p className="text-xs text-slate-400">Input ports from systems</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-xl">
                <Settings className="h-6 w-6 text-orange-400 mb-2" />
                <h4 className="font-bold mb-1">Architecture</h4>
                <p className="text-xs text-slate-400">Processing & storage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default DataProductCanvas;
