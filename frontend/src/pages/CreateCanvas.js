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
import { 
  ChevronLeft, ChevronRight, Check, Plus, Trash2, 
  Users, Database, FileText, Settings, BookOpen, Layers,
  Save, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

const STEPS = [
  { id: 1, name: 'Domain', icon: Users, description: 'Define ownership and accountability' },
  { id: 2, name: 'Data Product', icon: Database, description: 'Name and classify your data product' },
  { id: 3, name: 'Consumers', icon: Users, description: 'Who will use this data product?' },
  { id: 4, name: 'Data Contract', icon: FileText, description: 'Define output ports and data model' },
  { id: 5, name: 'Sources', icon: Database, description: 'Define input ports and sources' },
  { id: 6, name: 'Architecture', icon: Settings, description: 'Technical implementation details' },
  { id: 7, name: 'Language', icon: BookOpen, description: 'Define ubiquitous language' },
  { id: 8, name: 'Review', icon: Check, description: 'Review and create' }
];

function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map(function(step, idx) {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isComplete = currentStep > step.id;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={
                'w-10 h-10 rounded-full flex items-center justify-center transition-all ' +
                (isComplete ? 'bg-emerald-500 text-white' : 
                 isActive ? 'bg-cyan-500 text-white ring-4 ring-cyan-200' : 
                 'bg-slate-200 text-slate-500')
              }>
                {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={'text-xs mt-2 font-medium ' + (isActive ? 'text-cyan-600' : 'text-slate-500')}>
                {step.name}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={'flex-1 h-1 mx-2 rounded ' + (currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Step1Domain({ formData, updateForm }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-2">About Domain Ownership</h4>
        <p className="text-sm text-blue-700">
          Each data product should be implemented, evolved, and maintained by one domain team only. 
          Define who is accountable, who specifies requirements, and who fixes it when it breaks.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="domain">Domain *</Label>
          <Select value={formData.domain} onValueChange={function(v) { updateForm('domain', v); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="port">Port</SelectItem>
              <SelectItem value="fleet">Fleet</SelectItem>
              <SelectItem value="epc">EPC</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="owner_name">Data Product Owner *</Label>
          <Input 
            id="owner_name" 
            value={formData.owner_name} 
            onChange={function(e) { updateForm('owner_name', e.target.value); }}
            placeholder="e.g., Port Authority Admin"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="owner_email">Owner Email *</Label>
          <Input 
            id="owner_email" 
            type="email"
            value={formData.owner_email} 
            onChange={function(e) { updateForm('owner_email', e.target.value); }}
            placeholder="e.g., admin@port.om"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            type="date"
            value={formData.date} 
            onChange={function(e) { updateForm('date', e.target.value); }}
          />
        </div>
      </div>
    </div>
  );
}

function Step2DataProduct({ formData, updateForm }) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h4 className="font-bold text-purple-900 mb-2">About Data Product Identity</h4>
        <p className="text-sm text-purple-700">
          Each data product has a unique name and classification. Classification determines the nature of exposed data:
          <strong> source-aligned</strong> (raw operational data), <strong>aggregate</strong> (combined from multiple sources), 
          or <strong>consumer-aligned</strong> (optimized for specific use cases).
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">Data Product Name *</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={function(e) { updateForm('name', e.target.value); }}
            placeholder="e.g., Vessel Arrival Status"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input 
            id="version" 
            value={formData.version} 
            onChange={function(e) { updateForm('version', e.target.value); }}
            placeholder="e.g., 1.0.0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="classification">Classification *</Label>
          <Select value={formData.classification} onValueChange={function(v) { updateForm('classification', v); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="source-aligned">Source-Aligned (Raw operational data)</SelectItem>
              <SelectItem value="aggregate">Aggregate (Combined from multiple sources)</SelectItem>
              <SelectItem value="consumer-aligned">Consumer-Aligned (Optimized for use cases)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea 
            id="description" 
            value={formData.description} 
            onChange={function(e) { updateForm('description', e.target.value); }}
            placeholder="Describe the purpose and content of this data product..."
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={function(v) { updateForm('status', v); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function Step3Consumers({ formData, updateForm }) {
  const addConsumer = function() {
    const newConsumers = formData.consumers.slice();
    newConsumers.push({ name: '', domain: '', role: 'consumer', use_cases: [] });
    updateForm('consumers', newConsumers);
  };
  
  const removeConsumer = function(idx) {
    const newConsumers = formData.consumers.slice();
    newConsumers.splice(idx, 1);
    updateForm('consumers', newConsumers);
  };
  
  const updateConsumer = function(idx, field, value) {
    const newConsumers = formData.consumers.slice();
    newConsumers[idx][field] = value;
    updateForm('consumers', newConsumers);
  };
  
  const addUseCase = function() {
    const newUseCases = formData.use_cases.slice();
    newUseCases.push({ name: '', description: '', business_objective: '', success_metrics: [] });
    updateForm('use_cases', newUseCases);
  };
  
  const removeUseCase = function(idx) {
    const newUseCases = formData.use_cases.slice();
    newUseCases.splice(idx, 1);
    updateForm('use_cases', newUseCases);
  };
  
  const updateUseCase = function(idx, field, value) {
    const newUseCases = formData.use_cases.slice();
    newUseCases[idx][field] = value;
    updateForm('use_cases', newUseCases);
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-bold text-green-900 mb-2">About Consumers and Use Cases</h4>
        <p className="text-sm text-green-700">
          Data product design follows "Product Thinking" - we always start with consumer needs. 
          Identify who will use this data and what analytical use cases they need to implement.
        </p>
      </div>

      {/* Consumers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Consumers</Label>
          <Button variant="outline" size="sm" onClick={addConsumer}>
            <Plus className="h-4 w-4 mr-1" /> Add Consumer
          </Button>
        </div>
        
        {formData.consumers.map(function(consumer, idx) {
          return (
            <Card key={idx} className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-sm">Consumer {idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={function() { removeConsumer(idx); }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input 
                    placeholder="Consumer Name" 
                    value={consumer.name}
                    onChange={function(e) { updateConsumer(idx, 'name', e.target.value); }}
                  />
                  <Select value={consumer.domain} onValueChange={function(v) { updateConsumer(idx, 'domain', v); }}>
                    <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="port">Port</SelectItem>
                      <SelectItem value="fleet">Fleet</SelectItem>
                      <SelectItem value="epc">EPC</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Use Cases (comma separated)" 
                    value={consumer.use_cases.join(', ')}
                    onChange={function(e) { 
                      const cases = e.target.value.split(',').map(function(s) { return s.trim(); });
                      updateConsumer(idx, 'use_cases', cases); 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Use Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Use Cases</Label>
          <Button variant="outline" size="sm" onClick={addUseCase}>
            <Plus className="h-4 w-4 mr-1" /> Add Use Case
          </Button>
        </div>
        
        {formData.use_cases.map(function(useCase, idx) {
          return (
            <Card key={idx} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-sm">Use Case {idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={function() { removeUseCase(idx); }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Use Case Name" 
                    value={useCase.name}
                    onChange={function(e) { updateUseCase(idx, 'name', e.target.value); }}
                  />
                  <Input 
                    placeholder="Business Objective" 
                    value={useCase.business_objective}
                    onChange={function(e) { updateUseCase(idx, 'business_objective', e.target.value); }}
                  />
                  <Textarea 
                    placeholder="Description" 
                    value={useCase.description}
                    onChange={function(e) { updateUseCase(idx, 'description', e.target.value); }}
                    className="col-span-2"
                    rows={2}
                  />
                  <Input 
                    placeholder="Success Metrics (comma separated)" 
                    value={useCase.success_metrics.join(', ')}
                    onChange={function(e) { 
                      const metrics = e.target.value.split(',').map(function(s) { return s.trim(); });
                      updateUseCase(idx, 'success_metrics', metrics); 
                    }}
                    className="col-span-2"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Step4DataContract({ formData, updateForm }) {
  const addOutputPort = function() {
    const newPorts = formData.output_ports.slice();
    newPorts.push({ format: '', protocol: '', location: '', description: '' });
    updateForm('output_ports', newPorts);
  };
  
  const removeOutputPort = function(idx) {
    const newPorts = formData.output_ports.slice();
    newPorts.splice(idx, 1);
    updateForm('output_ports', newPorts);
  };
  
  const updateOutputPort = function(idx, field, value) {
    const newPorts = formData.output_ports.slice();
    newPorts[idx][field] = value;
    updateForm('output_ports', newPorts);
  };
  
  const addDataField = function() {
    const newFields = formData.data_model.slice();
    newFields.push({ name: '', data_type: '', description: '', constraints: [], is_pii: false, is_business_key: false, is_join_key: false });
    updateForm('data_model', newFields);
  };
  
  const removeDataField = function(idx) {
    const newFields = formData.data_model.slice();
    newFields.splice(idx, 1);
    updateForm('data_model', newFields);
  };
  
  const updateDataField = function(idx, field, value) {
    const newFields = formData.data_model.slice();
    newFields[idx][field] = value;
    updateForm('data_model', newFields);
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <h4 className="font-bold text-orange-900 mb-2">About Data Contract</h4>
        <p className="text-sm text-orange-700">
          The data contract defines the interface and metadata. Output ports specify how data is exposed 
          (API, files, tables). The data model describes attributes, types, and constraints.
        </p>
      </div>

      {/* Output Ports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Output Ports</Label>
          <Button variant="outline" size="sm" onClick={addOutputPort}>
            <Plus className="h-4 w-4 mr-1" /> Add Output Port
          </Button>
        </div>
        
        {formData.output_ports.map(function(port, idx) {
          return (
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
                      <SelectItem value="CSV">CSV Files</SelectItem>
                      <SelectItem value="Dashboard">Dashboard</SelectItem>
                      <SelectItem value="Kafka Topic">Kafka Topic</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={port.protocol} onValueChange={function(v) { updateOutputPort(idx, 'protocol', v); }}>
                    <SelectTrigger><SelectValue placeholder="Protocol" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HTTPS">HTTPS</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                      <SelectItem value="JDBC">JDBC</SelectItem>
                      <SelectItem value="Kafka">Kafka</SelectItem>
                      <SelectItem value="gRPC">gRPC</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Location/URL" 
                    value={port.location}
                    onChange={function(e) { updateOutputPort(idx, 'location', e.target.value); }}
                  />
                  <Input 
                    placeholder="Description" 
                    value={port.description}
                    onChange={function(e) { updateOutputPort(idx, 'description', e.target.value); }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Model */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Data Model</Label>
          <Button variant="outline" size="sm" onClick={addDataField}>
            <Plus className="h-4 w-4 mr-1" /> Add Field
          </Button>
        </div>
        
        {formData.data_model.map(function(field, idx) {
          return (
            <Card key={idx} className="border-l-4 border-l-purple-500">
              <CardContent className="pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-sm">Field {idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={function() { removeDataField(idx); }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input 
                    placeholder="Field Name" 
                    value={field.name}
                    onChange={function(e) { updateDataField(idx, 'name', e.target.value); }}
                  />
                  <Select value={field.data_type} onValueChange={function(v) { updateDataField(idx, 'data_type', v); }}>
                    <SelectTrigger><SelectValue placeholder="Data Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="integer">Integer</SelectItem>
                      <SelectItem value="float">Float</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="datetime">DateTime</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="enum">Enum</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Description" 
                    value={field.description}
                    onChange={function(e) { updateDataField(idx, 'description', e.target.value); }}
                  />
                </div>
                <div className="flex gap-4 mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={field.is_business_key}
                      onChange={function(e) { updateDataField(idx, 'is_business_key', e.target.checked); }}
                    />
                    Business Key
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={field.is_join_key}
                      onChange={function(e) { updateDataField(idx, 'is_join_key', e.target.checked); }}
                    />
                    Join Key
                  </label>
                  <label className="flex items-center gap-2 text-sm text-red-600">
                    <input 
                      type="checkbox" 
                      checked={field.is_pii}
                      onChange={function(e) { updateDataField(idx, 'is_pii', e.target.checked); }}
                    />
                    Contains PII
                  </label>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Terms */}
      <div className="space-y-2">
        <Label htmlFor="terms">Terms of Use</Label>
        <Textarea 
          id="terms" 
          value={formData.terms} 
          onChange={function(e) { updateForm('terms', e.target.value); }}
          placeholder="Describe how data can be used, limitations, pricing..."
          rows={3}
        />
      </div>
    </div>
  );
}

function Step5Sources({ formData, updateForm }) {
  const addInputPort = function() {
    const newPorts = formData.input_ports.slice();
    newPorts.push({ source_type: '', source_name: '', source_domain: '', format: '', protocol: '', description: '' });
    updateForm('input_ports', newPorts);
  };
  
  const removeInputPort = function(idx) {
    const newPorts = formData.input_ports.slice();
    newPorts.splice(idx, 1);
    updateForm('input_ports', newPorts);
  };
  
  const updateInputPort = function(idx, field, value) {
    const newPorts = formData.input_ports.slice();
    newPorts[idx][field] = value;
    updateForm('input_ports', newPorts);
  };

  return (
    <div className="space-y-6">
      <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
        <h4 className="font-bold text-cyan-900 mb-2">About Sources</h4>
        <p className="text-sm text-cyan-700">
          Input ports define where data comes from. Sources can be operational systems (databases, APIs) 
          or other data products (internal or from other domains).
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Input Ports (Sources)</Label>
          <Button variant="outline" size="sm" onClick={addInputPort}>
            <Plus className="h-4 w-4 mr-1" /> Add Source
          </Button>
        </div>
        
        {formData.input_ports.map(function(port, idx) {
          return (
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
                  <Input 
                    placeholder="Source Name" 
                    value={port.source_name}
                    onChange={function(e) { updateInputPort(idx, 'source_name', e.target.value); }}
                  />
                  <Select value={port.source_domain} onValueChange={function(v) { updateInputPort(idx, 'source_domain', v); }}>
                    <SelectTrigger><SelectValue placeholder="Source Domain" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="port">Port</SelectItem>
                      <SelectItem value="fleet">Fleet</SelectItem>
                      <SelectItem value="epc">EPC</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={port.format} onValueChange={function(v) { updateInputPort(idx, 'format', v); }}>
                    <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                      <SelectItem value="REST API">REST API</SelectItem>
                      <SelectItem value="Stream">Stream</SelectItem>
                      <SelectItem value="Files">Files</SelectItem>
                      <SelectItem value="Kafka">Kafka</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={port.protocol} onValueChange={function(v) { updateInputPort(idx, 'protocol', v); }}>
                    <SelectTrigger><SelectValue placeholder="Protocol" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDC">CDC</SelectItem>
                      <SelectItem value="HTTPS">HTTPS</SelectItem>
                      <SelectItem value="JDBC">JDBC</SelectItem>
                      <SelectItem value="Kafka">Kafka</SelectItem>
                      <SelectItem value="MQTT">MQTT</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Description" 
                    value={port.description}
                    onChange={function(e) { updateInputPort(idx, 'description', e.target.value); }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Step6Architecture({ formData, updateForm }) {
  const updateArchitecture = function(field, value) {
    const newArch = Object.assign({}, formData.architecture);
    newArch[field] = value;
    updateForm('architecture', newArch);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <h4 className="font-bold text-indigo-900 mb-2">About Architecture</h4>
        <p className="text-sm text-indigo-700">
          Design the internals of the data product. Specify processing type, framework, storage, 
          transformations, scheduling, and monitoring.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Processing Type *</Label>
          <Select value={formData.architecture.processing_type} onValueChange={function(v) { updateArchitecture('processing_type', v); }}>
            <SelectTrigger><SelectValue placeholder="Select processing type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="streaming">Streaming (Real-time)</SelectItem>
              <SelectItem value="batch">Batch (Scheduled)</SelectItem>
              <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Framework *</Label>
          <Select value={formData.architecture.framework} onValueChange={function(v) { updateArchitecture('framework', v); }}>
            <SelectTrigger><SelectValue placeholder="Select framework" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dbt">dbt</SelectItem>
              <SelectItem value="Databricks">Databricks</SelectItem>
              <SelectItem value="Apache Spark">Apache Spark</SelectItem>
              <SelectItem value="Apache Flink">Apache Flink</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Java">Java</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Storage Type *</Label>
          <Select value={formData.architecture.storage_type} onValueChange={function(v) { updateArchitecture('storage_type', v); }}>
            <SelectTrigger><SelectValue placeholder="Select storage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tables">Database Tables</SelectItem>
              <SelectItem value="files">Files (S3/GCS)</SelectItem>
              <SelectItem value="Delta Lake">Delta Lake</SelectItem>
              <SelectItem value="topic">Kafka Topics</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Query Engine *</Label>
          <Select value={formData.architecture.query_engine} onValueChange={function(v) { updateArchitecture('query_engine', v); }}>
            <SelectTrigger><SelectValue placeholder="Select query engine" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SQL">SQL</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Notebook">Notebook</SelectItem>
              <SelectItem value="Presto">Presto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Scheduling Tool</Label>
          <Select value={formData.architecture.scheduling_tool} onValueChange={function(v) { updateArchitecture('scheduling_tool', v); }}>
            <SelectTrigger><SelectValue placeholder="Select scheduler" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Airflow">Apache Airflow</SelectItem>
              <SelectItem value="Databricks Workflows">Databricks Workflows</SelectItem>
              <SelectItem value="CI/CD">CI/CD Pipeline</SelectItem>
              <SelectItem value="Cron">Cron</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Monitoring Tool</Label>
          <Select value={formData.architecture.monitoring_tool} onValueChange={function(v) { updateArchitecture('monitoring_tool', v); }}>
            <SelectTrigger><SelectValue placeholder="Select monitoring" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Grafana">Grafana</SelectItem>
              <SelectItem value="Soda">Soda</SelectItem>
              <SelectItem value="Great Expectations">Great Expectations</SelectItem>
              <SelectItem value="Datadog">Datadog</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 col-span-2">
          <Label>Transformation Steps</Label>
          <Input 
            placeholder="e.g., Ingestion, Cleaning, Aggregation, Join (comma separated)"
            value={formData.architecture.transformation_steps.join(', ')}
            onChange={function(e) { 
              const steps = e.target.value.split(',').map(function(s) { return s.trim(); });
              updateArchitecture('transformation_steps', steps); 
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Estimated Cost</Label>
          <Input 
            placeholder="e.g., $2,500/month"
            value={formData.architecture.estimated_cost}
            onChange={function(e) { updateArchitecture('estimated_cost', e.target.value); }}
          />
        </div>
      </div>
    </div>
  );
}

function Step7Language({ formData, updateForm }) {
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  
  const addTerm = function() {
    if (newTerm && newDefinition) {
      const newLanguage = Object.assign({}, formData.ubiquitous_language);
      newLanguage[newTerm] = newDefinition;
      updateForm('ubiquitous_language', newLanguage);
      setNewTerm('');
      setNewDefinition('');
    }
  };
  
  const removeTerm = function(term) {
    const newLanguage = Object.assign({}, formData.ubiquitous_language);
    delete newLanguage[term];
    updateForm('ubiquitous_language', newLanguage);
  };

  const terms = [];
  for (const key in formData.ubiquitous_language) {
    terms.push({ term: key, definition: formData.ubiquitous_language[key] });
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h4 className="font-bold text-amber-900 mb-2">About Ubiquitous Language</h4>
        <p className="text-sm text-amber-700">
          Define a common language shared between everyone involved in the project. 
          This context-specific domain terminology is relevant for operational systems and data products.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-bold">Domain Terminology</Label>
        
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4">
              <Input 
                placeholder="Term" 
                value={newTerm}
                onChange={function(e) { setNewTerm(e.target.value); }}
              />
              <Input 
                placeholder="Definition" 
                value={newDefinition}
                onChange={function(e) { setNewDefinition(e.target.value); }}
                className="col-span-1"
              />
              <Button onClick={addTerm} disabled={!newTerm || !newDefinition}>
                <Plus className="h-4 w-4 mr-1" /> Add Term
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {terms.map(function(item, idx) {
          return (
            <div key={idx} className="flex items-start justify-between p-4 border rounded-lg bg-slate-50">
              <div>
                <dt className="font-bold text-slate-900">{item.term}</dt>
                <dd className="text-sm text-slate-600 mt-1">{item.definition}</dd>
              </div>
              <Button variant="ghost" size="sm" onClick={function() { removeTerm(item.term); }}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* SLA Section */}
      <div className="space-y-4 mt-8">
        <Label className="text-lg font-bold">Service Level Agreements (SLA)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Availability</Label>
            <Input 
              placeholder="e.g., 99.5%"
              value={formData.sla.availability}
              onChange={function(e) { 
                const newSla = Object.assign({}, formData.sla);
                newSla.availability = e.target.value;
                updateForm('sla', newSla);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Support Hours</Label>
            <Input 
              placeholder="e.g., 24/7"
              value={formData.sla.support_hours}
              onChange={function(e) { 
                const newSla = Object.assign({}, formData.sla);
                newSla.support_hours = e.target.value;
                updateForm('sla', newSla);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Retention Period</Label>
            <Input 
              placeholder="e.g., 2 years"
              value={formData.sla.retention_period}
              onChange={function(e) { 
                const newSla = Object.assign({}, formData.sla);
                newSla.retention_period = e.target.value;
                updateForm('sla', newSla);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Response Time</Label>
            <Input 
              placeholder="e.g., < 500ms"
              value={formData.sla.response_time}
              onChange={function(e) { 
                const newSla = Object.assign({}, formData.sla);
                newSla.response_time = e.target.value;
                updateForm('sla', newSla);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step8Review({ formData }) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
        <h4 className="font-bold text-emerald-900 mb-2">Review Your Data Product Canvas</h4>
        <p className="text-sm text-emerald-700">
          Please review all the information below before creating your data product. 
          You can go back to any step to make changes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Name:</strong> {formData.name || '-'}</p>
            <p><strong>Domain:</strong> {formData.domain || '-'}</p>
            <p><strong>Classification:</strong> {formData.classification || '-'}</p>
            <p><strong>Version:</strong> {formData.version || '-'}</p>
            <p><strong>Owner:</strong> {formData.owner_name || '-'}</p>
          </CardContent>
        </Card>

        {/* Consumers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Consumers ({formData.consumers.length})</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {formData.consumers.length > 0 ? (
              formData.consumers.map(function(c, i) {
                return <p key={i}>{c.name} ({c.domain})</p>;
              })
            ) : <p className="text-slate-500">No consumers defined</p>}
          </CardContent>
        </Card>

        {/* Output Ports */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Output Ports ({formData.output_ports.length})</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {formData.output_ports.length > 0 ? (
              formData.output_ports.map(function(p, i) {
                return <p key={i}>{p.format} via {p.protocol}</p>;
              })
            ) : <p className="text-slate-500">No output ports defined</p>}
          </CardContent>
        </Card>

        {/* Input Ports */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Input Ports ({formData.input_ports.length})</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {formData.input_ports.length > 0 ? (
              formData.input_ports.map(function(p, i) {
                return <p key={i}>{p.source_name} ({p.source_type})</p>;
              })
            ) : <p className="text-slate-500">No input ports defined</p>}
          </CardContent>
        </Card>

        {/* Data Model */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Data Model ({formData.data_model.length} fields)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {formData.data_model.length > 0 ? (
              formData.data_model.map(function(f, i) {
                return <p key={i}>{f.name}: {f.data_type}</p>;
              })
            ) : <p className="text-slate-500">No fields defined</p>}
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Architecture</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Processing:</strong> {formData.architecture.processing_type || '-'}</p>
            <p><strong>Framework:</strong> {formData.architecture.framework || '-'}</p>
            <p><strong>Storage:</strong> {formData.architecture.storage_type || '-'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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

  const updateForm = function(field, value) {
    const newData = Object.assign({}, formData);
    newData[field] = value;
    setFormData(newData);
  };

  const nextStep = function() {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const prevStep = function() {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async function() {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(API + '/canvas', formData, {
        headers: { Authorization: 'Bearer ' + token }
      });
      toast.success('Data Product Canvas created successfully!');
      window.location.href = '/canvas';
    } catch (error) {
      toast.error('Failed to create canvas: ' + (error.response?.data?.detail || 'Unknown error'));
      setSaving(false);
    }
  };

  const renderStep = function() {
    switch(currentStep) {
      case 1: return <Step1Domain formData={formData} updateForm={updateForm} />;
      case 2: return <Step2DataProduct formData={formData} updateForm={updateForm} />;
      case 3: return <Step3Consumers formData={formData} updateForm={updateForm} />;
      case 4: return <Step4DataContract formData={formData} updateForm={updateForm} />;
      case 5: return <Step5Sources formData={formData} updateForm={updateForm} />;
      case 6: return <Step6Architecture formData={formData} updateForm={updateForm} />;
      case 7: return <Step7Language formData={formData} updateForm={updateForm} />;
      case 8: return <Step8Review formData={formData} />;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8" data-testid="create-canvas-page">
        {/* Header */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl p-8 text-white">
          <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
            Data Product Canvas Workshop
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Design a New Data Product</h1>
          <p className="text-cyan-100">
            Follow this guided process to design your data product collaboratively.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              Step {currentStep}: {STEPS[currentStep - 1].name}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          {currentStep < 8 ? (
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
