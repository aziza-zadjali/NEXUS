import React, { useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, Save, Users, Database, FileText, Settings, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function CreateCanvas() {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    owner_name: '',
    owner_email: '',
    date: new Date().toISOString().split('T')[0],
    version: '1.0.0',
    description: '',
    classification: '',
    status: 'draft',
    consumers: [],
    use_cases: [],
    output_ports: [],
    terms: '',
    data_model: [],
    quality_checks: [],
    sla: { availability: '', support_hours: '', retention_period: '', backup_frequency: 'Daily', response_time: '' },
    security: { access_level: 'internal', approval_required: false, allowed_roles: ['admin', 'editor', 'viewer'], allowed_domains: [], pii_handling: '' },
    input_ports: [],
    architecture: { processing_type: '', framework: '', storage_type: '', query_engine: '', transformation_steps: [], scheduling_tool: '', monitoring_tool: '', estimated_cost: '' },
    ubiquitous_language: {},
    follow_up_actions: [],
    follow_up_date: ''
  });

  function updateForm(field, value) {
    const newData = {};
    for (const key in formData) {
      newData[key] = formData[key];
    }
    newData[field] = value;
    setFormData(newData);
  }

  function nextStep() {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(API + '/canvas', formData, {
        headers: { Authorization: 'Bearer ' + token }
      });
      toast.success('Data Product Canvas created successfully!');
      window.location.href = '/canvas';
    } catch (error) {
      const msg = error.response && error.response.data ? error.response.data.detail : 'Unknown error';
      toast.error('Failed to create canvas: ' + msg);
      setSaving(false);
    }
  }

  function addConsumer() {
    const arr = [];
    for (let i = 0; i < formData.consumers.length; i++) {
      arr.push(formData.consumers[i]);
    }
    arr.push({ name: '', domain: '', role: 'consumer', use_cases: [] });
    updateForm('consumers', arr);
  }

  function removeConsumer(idx) {
    const arr = [];
    for (let i = 0; i < formData.consumers.length; i++) {
      if (i !== idx) arr.push(formData.consumers[i]);
    }
    updateForm('consumers', arr);
  }

  function updateConsumer(idx, field, value) {
    const arr = [];
    for (let i = 0; i < formData.consumers.length; i++) {
      if (i === idx) {
        const item = {};
        for (const key in formData.consumers[i]) {
          item[key] = formData.consumers[i][key];
        }
        item[field] = value;
        arr.push(item);
      } else {
        arr.push(formData.consumers[i]);
      }
    }
    updateForm('consumers', arr);
  }

  function addOutputPort() {
    const arr = [];
    for (let i = 0; i < formData.output_ports.length; i++) {
      arr.push(formData.output_ports[i]);
    }
    arr.push({ format: '', protocol: '', location: '', description: '' });
    updateForm('output_ports', arr);
  }

  function removeOutputPort(idx) {
    const arr = [];
    for (let i = 0; i < formData.output_ports.length; i++) {
      if (i !== idx) arr.push(formData.output_ports[i]);
    }
    updateForm('output_ports', arr);
  }

  function updateOutputPort(idx, field, value) {
    const arr = [];
    for (let i = 0; i < formData.output_ports.length; i++) {
      if (i === idx) {
        const item = {};
        for (const key in formData.output_ports[i]) {
          item[key] = formData.output_ports[i][key];
        }
        item[field] = value;
        arr.push(item);
      } else {
        arr.push(formData.output_ports[i]);
      }
    }
    updateForm('output_ports', arr);
  }

  function addInputPort() {
    const arr = [];
    for (let i = 0; i < formData.input_ports.length; i++) {
      arr.push(formData.input_ports[i]);
    }
    arr.push({ source_type: '', source_name: '', source_domain: '', format: '', protocol: '', description: '' });
    updateForm('input_ports', arr);
  }

  function removeInputPort(idx) {
    const arr = [];
    for (let i = 0; i < formData.input_ports.length; i++) {
      if (i !== idx) arr.push(formData.input_ports[i]);
    }
    updateForm('input_ports', arr);
  }

  function updateInputPort(idx, field, value) {
    const arr = [];
    for (let i = 0; i < formData.input_ports.length; i++) {
      if (i === idx) {
        const item = {};
        for (const key in formData.input_ports[i]) {
          item[key] = formData.input_ports[i][key];
        }
        item[field] = value;
        arr.push(item);
      } else {
        arr.push(formData.input_ports[i]);
      }
    }
    updateForm('input_ports', arr);
  }

  function addDataField() {
    const arr = [];
    for (let i = 0; i < formData.data_model.length; i++) {
      arr.push(formData.data_model[i]);
    }
    arr.push({ name: '', data_type: '', description: '', constraints: [], is_pii: false, is_business_key: false, is_join_key: false });
    updateForm('data_model', arr);
  }

  function removeDataField(idx) {
    const arr = [];
    for (let i = 0; i < formData.data_model.length; i++) {
      if (i !== idx) arr.push(formData.data_model[i]);
    }
    updateForm('data_model', arr);
  }

  function updateDataField(idx, field, value) {
    const arr = [];
    for (let i = 0; i < formData.data_model.length; i++) {
      if (i === idx) {
        const item = {};
        for (const key in formData.data_model[i]) {
          item[key] = formData.data_model[i][key];
        }
        item[field] = value;
        arr.push(item);
      } else {
        arr.push(formData.data_model[i]);
      }
    }
    updateForm('data_model', arr);
  }

  function updateArchitecture(field, value) {
    const newArch = {};
    for (const key in formData.architecture) {
      newArch[key] = formData.architecture[key];
    }
    newArch[field] = value;
    updateForm('architecture', newArch);
  }

  function renderConsumers() {
    const items = [];
    for (let i = 0; i < formData.consumers.length; i++) {
      const consumer = formData.consumers[i];
      const idx = i;
      items.push(
        <Card key={idx} className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-sm">Consumer {idx + 1}</span>
              <Button variant="ghost" size="sm" onClick={function() { removeConsumer(idx); }}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Consumer Name" value={consumer.name} onChange={function(e) { updateConsumer(idx, 'name', e.target.value); }} />
              <Select value={consumer.domain} onValueChange={function(v) { updateConsumer(idx, 'domain', v); }}>
                <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="port">Port</SelectItem>
                  <SelectItem value="fleet">Fleet</SelectItem>
                  <SelectItem value="epc">EPC</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );
    }
    return items;
  }

  function renderOutputPorts() {
    const items = [];
    for (let i = 0; i < formData.output_ports.length; i++) {
      const port = formData.output_ports[i];
      const idx = i;
      items.push(
        <Card key={idx} className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-sm">Output Port {idx + 1}</span>
              <Button variant="ghost" size="sm" onClick={function() { removeOutputPort(idx); }}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select value={port.format} onValueChange={function(v) { updateOutputPort(idx, 'format', v); }}>
                <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="REST API">REST API</SelectItem>
                  <SelectItem value="Parquet">Parquet Files</SelectItem>
                  <SelectItem value="Delta Lake">Delta Lake</SelectItem>
                  <SelectItem value="Database Table">Database Table</SelectItem>
                  <SelectItem value="Dashboard">Dashboard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={port.protocol} onValueChange={function(v) { updateOutputPort(idx, 'protocol', v); }}>
                <SelectTrigger><SelectValue placeholder="Protocol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HTTPS">HTTPS</SelectItem>
                  <SelectItem value="S3">S3</SelectItem>
                  <SelectItem value="JDBC">JDBC</SelectItem>
                  <SelectItem value="Kafka">Kafka</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Location/URL" value={port.location} onChange={function(e) { updateOutputPort(idx, 'location', e.target.value); }} />
              <Input placeholder="Description" value={port.description} onChange={function(e) { updateOutputPort(idx, 'description', e.target.value); }} />
            </div>
          </CardContent>
        </Card>
      );
    }
    return items;
  }

  function renderInputPorts() {
    const items = [];
    for (let i = 0; i < formData.input_ports.length; i++) {
      const port = formData.input_ports[i];
      const idx = i;
      items.push(
        <Card key={idx} className="border-l-4 border-l-cyan-500">
          <CardContent className="pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-sm">Source {idx + 1}</span>
              <Button variant="ghost" size="sm" onClick={function() { removeInputPort(idx); }}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select value={port.source_type} onValueChange={function(v) { updateInputPort(idx, 'source_type', v); }}>
                <SelectTrigger><SelectValue placeholder="Source Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational_system">Operational System</SelectItem>
                  <SelectItem value="data_product">Data Product</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Source Name" value={port.source_name} onChange={function(e) { updateInputPort(idx, 'source_name', e.target.value); }} />
              <Select value={port.source_domain} onValueChange={function(v) { updateInputPort(idx, 'source_domain', v); }}>
                <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="port">Port</SelectItem>
                  <SelectItem value="fleet">Fleet</SelectItem>
                  <SelectItem value="epc">EPC</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );
    }
    return items;
  }

  function renderDataModel() {
    const items = [];
    for (let i = 0; i < formData.data_model.length; i++) {
      const field = formData.data_model[i];
      const idx = i;
      items.push(
        <Card key={idx} className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-sm">Field {idx + 1}</span>
              <Button variant="ghost" size="sm" onClick={function() { removeDataField(idx); }}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input placeholder="Field Name" value={field.name} onChange={function(e) { updateDataField(idx, 'name', e.target.value); }} />
              <Select value={field.data_type} onValueChange={function(v) { updateDataField(idx, 'data_type', v); }}>
                <SelectTrigger><SelectValue placeholder="Data Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="integer">Integer</SelectItem>
                  <SelectItem value="float">Float</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="datetime">DateTime</SelectItem>
                  <SelectItem value="enum">Enum</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Description" value={field.description} onChange={function(e) { updateDataField(idx, 'description', e.target.value); }} />
            </div>
            <div className="flex gap-4 mt-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={field.is_business_key} onChange={function(e) { updateDataField(idx, 'is_business_key', e.target.checked); }} />
                Business Key
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={field.is_join_key} onChange={function(e) { updateDataField(idx, 'is_join_key', e.target.checked); }} />
                Join Key
              </label>
              <label className="flex items-center gap-2 text-sm text-red-600">
                <input type="checkbox" checked={field.is_pii} onChange={function(e) { updateDataField(idx, 'is_pii', e.target.checked); }} />
                Contains PII
              </label>
            </div>
          </CardContent>
        </Card>
      );
    }
    return items;
  }

  // Step 1: Domain & Basic Info
  function renderStep1() {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">Step 1: Domain & Identity</h4>
          <p className="text-sm text-blue-700">Define who owns and is accountable for this data product.</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Domain *</Label>
            <Select value={formData.domain} onValueChange={function(v) { updateForm('domain', v); }}>
              <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="port">Port</SelectItem>
                <SelectItem value="fleet">Fleet</SelectItem>
                <SelectItem value="epc">EPC</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data Product Name *</Label>
            <Input value={formData.name} onChange={function(e) { updateForm('name', e.target.value); }} placeholder="e.g., Vessel Arrival Status" />
          </div>
          <div className="space-y-2">
            <Label>Owner Name *</Label>
            <Input value={formData.owner_name} onChange={function(e) { updateForm('owner_name', e.target.value); }} placeholder="e.g., Port Authority Admin" />
          </div>
          <div className="space-y-2">
            <Label>Owner Email *</Label>
            <Input type="email" value={formData.owner_email} onChange={function(e) { updateForm('owner_email', e.target.value); }} placeholder="e.g., admin@port.om" />
          </div>
          <div className="space-y-2">
            <Label>Version</Label>
            <Input value={formData.version} onChange={function(e) { updateForm('version', e.target.value); }} placeholder="1.0.0" />
          </div>
          <div className="space-y-2">
            <Label>Classification *</Label>
            <Select value={formData.classification} onValueChange={function(v) { updateForm('classification', v); }}>
              <SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="source-aligned">Source-Aligned</SelectItem>
                <SelectItem value="aggregate">Aggregate</SelectItem>
                <SelectItem value="consumer-aligned">Consumer-Aligned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Description *</Label>
            <Textarea value={formData.description} onChange={function(e) { updateForm('description', e.target.value); }} placeholder="Describe this data product..." rows={3} />
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Consumers & Use Cases
  function renderStep2() {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-bold text-green-900 mb-2">Step 2: Consumers</h4>
          <p className="text-sm text-green-700">Who will use this data product and why?</p>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Consumers</Label>
          <Button variant="outline" size="sm" onClick={addConsumer}>
            <Plus className="h-4 w-4 mr-1" /> Add Consumer
          </Button>
        </div>
        <div className="space-y-4">{renderConsumers()}</div>
      </div>
    );
  }

  // Step 3: Data Contract
  function renderStep3() {
    return (
      <div className="space-y-6">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-bold text-orange-900 mb-2">Step 3: Data Contract</h4>
          <p className="text-sm text-orange-700">Define output ports and data model.</p>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Output Ports</Label>
          <Button variant="outline" size="sm" onClick={addOutputPort}>
            <Plus className="h-4 w-4 mr-1" /> Add Output Port
          </Button>
        </div>
        <div className="space-y-4">{renderOutputPorts()}</div>
        
        <div className="flex items-center justify-between mt-8">
          <Label className="text-lg font-bold">Data Model</Label>
          <Button variant="outline" size="sm" onClick={addDataField}>
            <Plus className="h-4 w-4 mr-1" /> Add Field
          </Button>
        </div>
        <div className="space-y-4">{renderDataModel()}</div>
      </div>
    );
  }

  // Step 4: Sources & Architecture
  function renderStep4() {
    return (
      <div className="space-y-6">
        <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
          <h4 className="font-bold text-cyan-900 mb-2">Step 4: Sources & Architecture</h4>
          <p className="text-sm text-cyan-700">Define input ports and technical architecture.</p>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Input Ports (Sources)</Label>
          <Button variant="outline" size="sm" onClick={addInputPort}>
            <Plus className="h-4 w-4 mr-1" /> Add Source
          </Button>
        </div>
        <div className="space-y-4">{renderInputPorts()}</div>
        
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Processing Type</Label>
            <Select value={formData.architecture.processing_type} onValueChange={function(v) { updateArchitecture('processing_type', v); }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="streaming">Streaming</SelectItem>
                <SelectItem value="batch">Batch</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select value={formData.architecture.framework} onValueChange={function(v) { updateArchitecture('framework', v); }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dbt">dbt</SelectItem>
                <SelectItem value="Databricks">Databricks</SelectItem>
                <SelectItem value="Apache Spark">Apache Spark</SelectItem>
                <SelectItem value="Apache Flink">Apache Flink</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Storage Type</Label>
            <Select value={formData.architecture.storage_type} onValueChange={function(v) { updateArchitecture('storage_type', v); }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tables">Database Tables</SelectItem>
                <SelectItem value="files">Files (S3)</SelectItem>
                <SelectItem value="Delta Lake">Delta Lake</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Query Engine</Label>
            <Select value={formData.architecture.query_engine} onValueChange={function(v) { updateArchitecture('query_engine', v); }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SQL">SQL</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Notebook">Notebook</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Review
  function renderStep5() {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <h4 className="font-bold text-emerald-900 mb-2">Step 5: Review & Create</h4>
          <p className="text-sm text-emerald-700">Review your data product canvas before creating.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Basic Info</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Name:</strong> {formData.name || '-'}</p>
              <p><strong>Domain:</strong> {formData.domain || '-'}</p>
              <p><strong>Classification:</strong> {formData.classification || '-'}</p>
              <p><strong>Owner:</strong> {formData.owner_name || '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Counts</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Consumers:</strong> {formData.consumers.length}</p>
              <p><strong>Output Ports:</strong> {formData.output_ports.length}</p>
              <p><strong>Input Ports:</strong> {formData.input_ports.length}</p>
              <p><strong>Data Fields:</strong> {formData.data_model.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function renderCurrentStep() {
    if (currentStep === 1) return renderStep1();
    if (currentStep === 2) return renderStep2();
    if (currentStep === 3) return renderStep3();
    if (currentStep === 4) return renderStep4();
    if (currentStep === 5) return renderStep5();
    return null;
  }

  const stepNames = ['Domain & Identity', 'Consumers', 'Data Contract', 'Sources & Architecture', 'Review'];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8" data-testid="create-canvas-page">
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl p-8 text-white">
          <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
            Data Product Canvas Workshop
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Design a New Data Product</h1>
          <p className="text-cyan-100">Follow this guided process to design your data product.</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {stepNames[0] && <div className={'px-4 py-2 rounded-full text-sm font-bold ' + (currentStep === 1 ? 'bg-cyan-500 text-white' : currentStep > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200')}>{currentStep > 1 ? <Check className="h-4 w-4 inline" /> : '1'}</div>}
          <div className={'w-12 h-1 rounded ' + (currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200')} />
          {stepNames[1] && <div className={'px-4 py-2 rounded-full text-sm font-bold ' + (currentStep === 2 ? 'bg-cyan-500 text-white' : currentStep > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200')}>{currentStep > 2 ? <Check className="h-4 w-4 inline" /> : '2'}</div>}
          <div className={'w-12 h-1 rounded ' + (currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-200')} />
          {stepNames[2] && <div className={'px-4 py-2 rounded-full text-sm font-bold ' + (currentStep === 3 ? 'bg-cyan-500 text-white' : currentStep > 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200')}>{currentStep > 3 ? <Check className="h-4 w-4 inline" /> : '3'}</div>}
          <div className={'w-12 h-1 rounded ' + (currentStep > 3 ? 'bg-emerald-500' : 'bg-slate-200')} />
          {stepNames[3] && <div className={'px-4 py-2 rounded-full text-sm font-bold ' + (currentStep === 4 ? 'bg-cyan-500 text-white' : currentStep > 4 ? 'bg-emerald-500 text-white' : 'bg-slate-200')}>{currentStep > 4 ? <Check className="h-4 w-4 inline" /> : '4'}</div>}
          <div className={'w-12 h-1 rounded ' + (currentStep > 4 ? 'bg-emerald-500' : 'bg-slate-200')} />
          {stepNames[4] && <div className={'px-4 py-2 rounded-full text-sm font-bold ' + (currentStep === 5 ? 'bg-cyan-500 text-white' : 'bg-slate-200')}>5</div>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              Step {currentStep}: {stepNames[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderCurrentStep()}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {currentStep < 5 ? (
            <Button onClick={nextStep}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-1" /> {saving ? 'Creating...' : 'Create Data Product'}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CreateCanvas;
