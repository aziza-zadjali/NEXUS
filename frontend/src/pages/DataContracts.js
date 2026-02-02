import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, CheckCircle2, AlertTriangle, XCircle, 
  Clock, Shield, ArrowRight, Activity, TrendingUp, TrendingDown,
  Users, Database, Eye, Copy, Download,
  DollarSign, Lock, Zap, Target, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// Contract Card Component
function ContractCard({ contract, onView }) {
  let statusColor = 'bg-slate-500 text-white';
  if (contract.status === 'active') statusColor = 'bg-emerald-500 text-white';
  if (contract.status === 'draft') statusColor = 'bg-amber-500 text-white';
  if (contract.status === 'deprecated') statusColor = 'bg-red-500 text-white';

  let domainColor = 'border-l-slate-500';
  const domain = contract.dataset ? contract.dataset.domain : null;
  if (domain === 'port') domainColor = 'border-l-blue-500';
  if (domain === 'fleet') domainColor = 'border-l-purple-500';
  if (domain === 'epc') domainColor = 'border-l-green-500';

  const schemaCount = contract.schema_fields ? contract.schema_fields.length : 0;
  const consumerCount = contract.consumers ? contract.consumers.length : 0;
  const availability = contract.slo ? contract.slo.availability : 'N/A';
  const freshness = contract.quality ? contract.quality.freshness_slo : 'N/A';
  const retention = contract.terms ? contract.terms.retention_period : 'N/A';
  const providerName = contract.provider ? contract.provider.name : 'Unknown';
  const providerTeam = contract.provider ? contract.provider.team : '';
  const description = contract.dataset ? contract.dataset.description : contract.description;
  const domainLabel = contract.dataset ? contract.dataset.domain : 'unknown';

  return (
    <Card className={'hover:shadow-lg transition-all border-l-4 ' + domainColor}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">
              {contract.contract_name}
            </CardTitle>
            <CardDescription className="capitalize">
              {domainLabel} Domain • v{contract.version}
            </CardDescription>
          </div>
          <Badge className={statusColor}>{contract.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
        
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase">Provider</span>
          </div>
          <p className="font-medium text-sm">{providerName}</p>
          <p className="text-xs text-slate-500">{providerTeam}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <p className="text-lg font-black text-blue-900">{schemaCount}</p>
            <p className="text-xs text-blue-600">Fields</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <p className="text-lg font-black text-purple-900">{consumerCount}</p>
            <p className="text-xs text-purple-600">Consumers</p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-black text-green-900">{availability}</p>
            <p className="text-xs text-green-600">SLO</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Freshness: {freshness}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Retention: {retention}</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={function() { onView(contract); }}>
          <Eye className="h-4 w-4 mr-2" /> View Contract Details
        </Button>
      </CardContent>
    </Card>
  );
}

// Schema Table Component
function SchemaTable({ fields }) {
  if (!fields || fields.length === 0) return <p className="text-sm text-slate-500">No schema defined</p>;

  const rows = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const flags = [];
    if (field.required) flags.push(<Badge key="req" className="bg-red-100 text-red-700 text-xs mr-1">Required</Badge>);
    if (field.unique) flags.push(<Badge key="uniq" className="bg-blue-100 text-blue-700 text-xs mr-1">Unique</Badge>);
    if (field.is_pii) flags.push(<Badge key="pii" className="bg-orange-100 text-orange-700 text-xs mr-1">PII</Badge>);
    if (field.sensitive) flags.push(<Badge key="sens" className="bg-purple-100 text-purple-700 text-xs">Sensitive</Badge>);
    
    rows.push(
      <tr key={i} className="border-b hover:bg-slate-50">
        <td className="py-2 px-3">
          <code className="text-blue-600 font-mono text-xs">{field.name}</code>
          {field.business_term && <p className="text-xs text-slate-400 mt-1">{field.business_term}</p>}
        </td>
        <td className="py-2 px-3">
          <Badge variant="outline" className="font-mono text-xs">{field.data_type}</Badge>
        </td>
        <td className="py-2 px-3 text-slate-600 text-xs">{field.description}</td>
        <td className="py-2 px-3"><div className="flex flex-wrap gap-1">{flags}</div></td>
      </tr>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left py-2 px-3 font-bold">Field</th>
            <th className="text-left py-2 px-3 font-bold">Type</th>
            <th className="text-left py-2 px-3 font-bold">Description</th>
            <th className="text-left py-2 px-3 font-bold">Flags</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

// Quality Section Component
function QualitySection({ quality }) {
  if (!quality) return <p className="text-sm text-slate-500">No quality attributes defined</p>;

  const validityItems = [];
  if (quality.validity_rules) {
    for (let i = 0; i < quality.validity_rules.length; i++) {
      validityItems.push(
        <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-slate-600">{quality.validity_rules[i]}</span>
        </div>
      );
    }
  }

  const checkItems = [];
  if (quality.data_quality_checks) {
    for (let i = 0; i < quality.data_quality_checks.length; i++) {
      checkItems.push(
        <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-blue-700">{quality.data_quality_checks[i]}</span>
        </div>
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">Freshness SLO</span>
          </div>
          <p className="text-2xl font-black text-emerald-800">{quality.freshness_slo}</p>
          <p className="text-xs text-emerald-600 mt-1">{quality.freshness_description}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-700">Accuracy</span>
          </div>
          <p className="text-2xl font-black text-blue-800">{quality.accuracy_threshold}%</p>
          <p className="text-xs text-blue-600 mt-1">Completeness: {quality.completeness_threshold}%</p>
        </div>
      </div>

      {quality.expected_row_count_min && (
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-bold text-slate-500 uppercase">Expected Row Count</span>
          <p className="font-medium">{quality.expected_row_count_min} - {quality.expected_row_count_max} rows</p>
        </div>
      )}

      {validityItems.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-2">Validity Rules</h4>
          <div className="space-y-1">{validityItems}</div>
        </div>
      )}

      {checkItems.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-2">Automated Quality Checks</h4>
          <div className="grid grid-cols-2 gap-2">{checkItems}</div>
        </div>
      )}
    </div>
  );
}

// SLO Section Component
function SLOSection({ slo }) {
  if (!slo) return <p className="text-sm text-slate-500">No SLOs defined</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white">
          <p className="text-xs font-bold uppercase opacity-80">Availability</p>
          <p className="text-2xl font-black">{slo.availability}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
          <p className="text-xs font-bold uppercase opacity-80">Latency P95</p>
          <p className="text-2xl font-black">{slo.latency_p95 || 'N/A'}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
          <p className="text-xs font-bold uppercase opacity-80">Latency P99</p>
          <p className="text-2xl font-black">{slo.latency_p99 || 'N/A'}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
          <p className="text-xs font-bold uppercase opacity-80">Throughput</p>
          <p className="text-2xl font-black">{slo.throughput || 'N/A'}</p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl">
        <p className="text-sm text-slate-600">{slo.availability_description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Support</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Support Hours:</span>
              <span className="font-medium">{slo.support_hours}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Critical Response:</span>
              <span className="font-medium text-red-600">{slo.response_time_critical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Normal Response:</span>
              <span className="font-medium">{slo.response_time_normal}</span>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-xl">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Maintenance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Window:</span>
              <span className="font-medium">{slo.maintenance_window || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Notification:</span>
              <span className="font-medium">{slo.incident_notification}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Billing Section Component
function BillingSection({ billing }) {
  if (!billing) return <p className="text-sm text-slate-500">No billing details defined</p>;

  const pricingBadge = billing.pricing_model === 'free' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-bold text-green-700">Pricing Model</span>
          </div>
          <Badge className={pricingBadge}>{billing.pricing_model.toUpperCase()}</Badge>
        </div>
        {billing.monthly_subscription && (
          <p className="text-2xl font-black text-green-800">{billing.monthly_subscription}/month</p>
        )}
        {billing.cost_per_query && (
          <p className="text-lg font-bold text-green-700">{billing.cost_per_query} per query</p>
        )}
        {billing.free_tier_limit && (
          <p className="text-sm text-green-600 mt-2">{billing.free_tier_limit}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-bold text-slate-500 uppercase">Billing Contact</span>
          <p className="font-medium text-sm">{billing.billing_contact}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-bold text-slate-500 uppercase">Billing Cycle</span>
          <p className="font-medium text-sm capitalize">{billing.billing_cycle}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-bold text-slate-500 uppercase">Currency</span>
          <p className="font-medium text-sm">{billing.currency}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-bold text-slate-500 uppercase">Cost Center</span>
          <p className="font-medium text-sm">{billing.cost_center || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

// Terms Section Component
function TermsSection({ terms }) {
  if (!terms) return <p className="text-sm text-slate-500">No terms defined</p>;

  const restrictionItems = [];
  if (terms.usage_restrictions) {
    for (let i = 0; i < terms.usage_restrictions.length; i++) {
      restrictionItems.push(
        <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded">
          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-700">{terms.usage_restrictions[i]}</span>
        </div>
      );
    }
  }

  const purposeItems = [];
  if (terms.allowed_purposes) {
    for (let i = 0; i < terms.allowed_purposes.length; i++) {
      purposeItems.push(
        <div key={i} className="flex items-start gap-2 p-2 bg-green-50 rounded">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-green-700">{terms.allowed_purposes[i]}</span>
        </div>
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4" /> Usage Restrictions
          </h4>
          <div className="space-y-2">{restrictionItems}</div>
        </div>
        <div className="p-4 border rounded-xl">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Allowed Purposes
          </h4>
          <div className="space-y-2">{purposeItems}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-bold text-slate-500 uppercase">Retention Period</span>
          <p className="font-medium">{terms.retention_period}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-bold text-slate-500 uppercase">Data Residency</span>
          <p className="font-medium">{terms.data_residency || 'N/A'}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-bold text-slate-500 uppercase">Change Notice</span>
          <p className="font-medium">{terms.change_notice_period}</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="text-sm font-bold text-blue-700 mb-2">Licensing</h4>
        <p className="text-sm text-blue-600">{terms.licensing}</p>
        <div className="flex gap-4 mt-3">
          <Badge className={terms.attribution_required ? 'bg-blue-500' : 'bg-slate-400'}>
            Attribution {terms.attribution_required ? 'Required' : 'Not Required'}
          </Badge>
          <Badge className={terms.redistribution_allowed ? 'bg-green-500' : 'bg-red-500'}>
            Redistribution {terms.redistribution_allowed ? 'Allowed' : 'Not Allowed'}
          </Badge>
          <Badge className={terms.modification_allowed ? 'bg-green-500' : 'bg-red-500'}>
            Modification {terms.modification_allowed ? 'Allowed' : 'Not Allowed'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl">
          <h4 className="text-sm font-bold text-slate-700 mb-2">Breaking Change Policy</h4>
          <p className="text-sm text-slate-600">{terms.breaking_change_policy}</p>
        </div>
        <div className="p-4 border rounded-xl">
          <h4 className="text-sm font-bold text-slate-700 mb-2">Deprecation Policy</h4>
          <p className="text-sm text-slate-600">{terms.deprecation_policy}</p>
        </div>
      </div>
    </div>
  );
}

// Consumers Section Component
function ConsumersSection({ consumers }) {
  if (!consumers || consumers.length === 0) return <p className="text-sm text-slate-500">No consumers registered</p>;

  const items = [];
  for (let i = 0; i < consumers.length; i++) {
    const consumer = consumers[i];
    const accessBadge = consumer.access_level === 'admin' ? 'bg-purple-500' : (consumer.access_level === 'write' ? 'bg-blue-500' : 'bg-slate-500');
    
    const useCaseBadges = [];
    if (consumer.use_cases) {
      for (let j = 0; j < consumer.use_cases.length; j++) {
        useCaseBadges.push(
          <Badge key={j} variant="outline" className="text-xs bg-slate-50">{consumer.use_cases[j]}</Badge>
        );
      }
    }

    items.push(
      <div key={i} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-slate-900">{consumer.name}</h4>
            <p className="text-sm text-slate-500">{consumer.team}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="capitalize">{consumer.domain}</Badge>
            <Badge className={accessBadge}>{consumer.access_level}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span>{consumer.email}</span>
          <span>•</span>
          <span>Approved: {consumer.approved_date}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">{useCaseBadges}</div>
      </div>
    );
  }

  return <div className="space-y-3">{items}</div>;
}

// YAML Preview Component
function YAMLPreview({ contractId }) {
  const [yaml, setYaml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    const fetchYaml = async function() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(API + '/contracts/' + contractId + '/yaml', {
          headers: { Authorization: 'Bearer ' + token }
        });
        setYaml(response.data.yaml);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch YAML');
        setLoading(false);
      }
    };
    fetchYaml();
  }, [contractId]);

  const copyToClipboard = function() {
    navigator.clipboard.writeText(yaml);
    toast.success('YAML copied to clipboard');
  };

  const downloadYaml = function() {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-contract-' + contractId + '.yaml';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-1" /> Copy
        </Button>
        <Button variant="outline" size="sm" onClick={downloadYaml}>
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
      <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-sm font-mono max-h-[500px] overflow-y-auto">
        {yaml}
      </pre>
    </div>
  );
}

// Contract Detail Modal
function ContractDetailModal({ contract, open, onClose }) {
  if (!contract) return null;

  const statusBadge = contract.status === 'active' ? 'bg-emerald-500' : (contract.status === 'draft' ? 'bg-amber-500' : 'bg-red-500');
  const providerName = contract.provider ? contract.provider.name : 'Unknown';
  const providerTeam = contract.provider ? contract.provider.team : '';
  const description = contract.dataset ? contract.dataset.description : contract.description;
  const domainLabel = contract.dataset ? contract.dataset.domain : 'unknown';
  const outputPort = contract.provider ? contract.provider.output_port : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge className={statusBadge}>{contract.status}</Badge>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight mt-2">
                {contract.contract_name}
              </DialogTitle>
              <p className="text-slate-500 mt-1">
                Version {contract.version} • {domainLabel} Domain
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl p-4 text-white my-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-bold">{providerName}</span>
            </div>
            <Badge className="bg-white/20 text-white">{providerTeam}</Badge>
          </div>
          <p className="text-sm text-slate-300">{description}</p>
          <div className="mt-3">
            <code className="text-xs bg-white/10 px-2 py-1 rounded">{outputPort}</code>
          </div>
        </div>

        <Tabs defaultValue="schema" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="schema" className="text-xs">Schema</TabsTrigger>
            <TabsTrigger value="quality" className="text-xs">Quality</TabsTrigger>
            <TabsTrigger value="slo" className="text-xs">SLOs</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs">Billing</TabsTrigger>
            <TabsTrigger value="terms" className="text-xs">Terms</TabsTrigger>
            <TabsTrigger value="consumers" className="text-xs">Consumers</TabsTrigger>
            <TabsTrigger value="yaml" className="text-xs">YAML</TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="mt-4">
            <SchemaTable fields={contract.schema_fields} />
          </TabsContent>

          <TabsContent value="quality" className="mt-4">
            <QualitySection quality={contract.quality} />
          </TabsContent>

          <TabsContent value="slo" className="mt-4">
            <SLOSection slo={contract.slo} />
          </TabsContent>

          <TabsContent value="billing" className="mt-4">
            <BillingSection billing={contract.billing} />
          </TabsContent>

          <TabsContent value="terms" className="mt-4">
            <TermsSection terms={contract.terms} />
          </TabsContent>

          <TabsContent value="consumers" className="mt-4">
            <ConsumersSection consumers={contract.consumers} />
          </TabsContent>

          <TabsContent value="yaml" className="mt-4">
            <YAMLPreview contractId={contract.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Main DataContracts Component
function DataContracts() {
  const [contracts, setContracts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [lineages, setLineages] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(function() {
    fetchData();
  }, []);

  const fetchData = async function() {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };
      
      const results = await Promise.all([
        axios.get(API + '/contracts', { headers }),
        axios.get(API + '/quality/metrics', { headers }),
        axios.get(API + '/lineage', { headers }),
        axios.get(API + '/catalog/products', { headers }),
        axios.get(API + '/contracts/stats/summary', { headers })
      ]);
      
      setContracts(results[0].data);
      setMetrics(results[1].data);
      setLineages(results[2].data);
      setProducts(results[3].data);
      setStats(results[4].data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const getProductName = function(productId) {
    for (let i = 0; i < products.length; i++) {
      if (products[i].id === productId) return products[i].name;
    }
    return productId;
  };

  const getStatusIcon = function(status) {
    if (status === 'healthy') return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (status === 'critical') return <XCircle className="h-5 w-5 text-red-500" />;
    return <Activity className="h-5 w-5 text-slate-400" />;
  };

  const handleViewContract = function(contract) {
    setSelectedContract(contract);
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

  // Build contract cards
  const contractCards = [];
  for (let i = 0; i < contracts.length; i++) {
    contractCards.push(
      <ContractCard key={contracts[i].id} contract={contracts[i]} onView={handleViewContract} />
    );
  }

  // Build metric rows
  const metricRows = [];
  for (let i = 0; i < metrics.length; i++) {
    const metric = metrics[i];
    const isHealthy = metric.value >= metric.threshold;
    metricRows.push(
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
            <p className={'text-lg font-black ' + (isHealthy ? 'text-emerald-600' : 'text-amber-600')}>
              {metric.value}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-500">Threshold</p>
            <p className="text-lg font-black text-slate-700">{metric.threshold}%</p>
          </div>
          <div className="flex items-center gap-1">
            {isHealthy ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-amber-500" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Build lineage rows
  const lineageRows = [];
  for (let i = 0; i < lineages.length; i++) {
    const lineage = lineages[i];
    lineageRows.push(
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
    );
  }

  // Count metrics by status
  let healthyCount = 0;
  let warningCount = 0;
  let criticalCount = 0;
  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].status === 'healthy') healthyCount++;
    else if (metrics[i].status === 'warning') warningCount++;
    else if (metrics[i].status === 'critical') criticalCount++;
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
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-3 leading-none">Data Contracts</h1>
            <p className="text-orange-100 font-medium text-lg max-w-2xl">
              Formal agreements defining structure, format, semantics, quality, and terms of use 
              for exchanging data between providers and consumers.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Contracts</p>
                    <p className="text-3xl font-black text-blue-600">{stats.total_contracts}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Active</p>
                    <p className="text-3xl font-black text-emerald-600">{stats.by_status.active}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Consumers</p>
                    <p className="text-3xl font-black text-purple-600">{stats.total_consumers}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Avg Fields</p>
                    <p className="text-3xl font-black text-amber-600">{stats.avg_schema_fields}</p>
                  </div>
                  <Database className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">With Billing</p>
                    <p className="text-3xl font-black text-green-600">{stats.with_billing}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
            <TabsTrigger value="contracts" className="font-bold uppercase text-xs">Contracts</TabsTrigger>
            <TabsTrigger value="quality" className="font-bold uppercase text-xs">Quality</TabsTrigger>
            <TabsTrigger value="lineage" className="font-bold uppercase text-xs">Lineage</TabsTrigger>
          </TabsList>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {contractCards}
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
                      <p className="text-3xl font-black text-emerald-600">{healthyCount}</p>
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
                      <p className="text-3xl font-black text-amber-600">{warningCount}</p>
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
                      <p className="text-3xl font-black text-red-600">{criticalCount}</p>
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
                <div className="space-y-3">{metricRows}</div>
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
                <div className="space-y-4">{lineageRows}</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Contract Specification Info */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <BookOpen className="h-6 w-6" />
              Data Contract Specification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              A <strong className="text-white">data contract</strong> is a document that defines the structure, format, 
              semantics, quality, and terms of use for exchanging data between a data provider and their consumers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-white/10 rounded-xl">
                <h4 className="font-bold text-white mb-2">Provider &amp; Output Port</h4>
                <p className="text-sm text-slate-300">Owner information and the output port to access data</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl">
                <h4 className="font-bold text-white mb-2">Schema &amp; Semantics</h4>
                <p className="text-sm text-slate-300">Data attributes with descriptions, formats, and business terms</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl">
                <h4 className="font-bold text-white mb-2">Quality &amp; SLOs</h4>
                <p className="text-sm text-slate-300">Freshness, accuracy, availability, and support commitments</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">YAML Format</Badge>
              <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">Schema Validation</Badge>
              <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">Quality Checks</Badge>
              <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">Code Generation</Badge>
              <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">Governance Policies</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Contract Detail Modal */}
        <ContractDetailModal 
          contract={selectedContract} 
          open={dialogOpen} 
          onClose={function() { setDialogOpen(false); }} 
        />
      </div>
    </Layout>
  );
}

export default DataContracts;
