import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, Lock, Globe, FileCheck, Award } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function StandardCard({ standard }) {
  let complianceBadge = 'bg-slate-500 text-white';
  if (standard.compliance_level === 'Full') complianceBadge = 'bg-emerald-500 text-white';
  if (standard.compliance_level === 'Partial') complianceBadge = 'bg-amber-500 text-white';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">{standard.name}</CardTitle>
              <CardDescription>Version {standard.version}</CardDescription>
            </div>
          </div>
          <Badge className={complianceBadge}>{standard.compliance_level}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">{standard.description}</p>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Supported Domains</p>
          <div className="flex flex-wrap gap-2">
            {standard.supported_domains && standard.supported_domains[0] && <Badge variant="outline" className="capitalize">{standard.supported_domains[0]}</Badge>}
            {standard.supported_domains && standard.supported_domains[1] && <Badge variant="outline" className="capitalize">{standard.supported_domains[1]}</Badge>}
            {standard.supported_domains && standard.supported_domains[2] && <Badge variant="outline" className="capitalize">{standard.supported_domains[2]}</Badge>}
          </div>
        </div>
        {standard.certification_date && (
          <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t">
            <Award className="h-4 w-4" />
            <span>Certified: {standard.certification_date}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComplianceCard({ rule }) {
  let severityBadge = 'bg-blue-500 text-white';
  if (rule.severity === 'critical') severityBadge = 'bg-red-500 text-white';
  if (rule.severity === 'high') severityBadge = 'bg-orange-500 text-white';
  if (rule.severity === 'medium') severityBadge = 'bg-amber-500 text-white';

  return (
    <div className="p-6 rounded-xl border bg-slate-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-900 text-white">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{rule.rule_name}</h4>
            <p className="text-xs text-slate-500">Standard: {rule.standard}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={severityBadge}>{rule.severity}</Badge>
          <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>{rule.status}</Badge>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-4">{rule.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {rule.applicable_domains && rule.applicable_domains[0] && <Badge variant="outline" className="capitalize text-xs">{rule.applicable_domains[0]}</Badge>}
        {rule.applicable_domains && rule.applicable_domains[1] && <Badge variant="outline" className="capitalize text-xs">{rule.applicable_domains[1]}</Badge>}
        {rule.applicable_domains && rule.applicable_domains[2] && <Badge variant="outline" className="capitalize text-xs">{rule.applicable_domains[2]}</Badge>}
      </div>
      <div className="p-3 bg-slate-900 rounded-lg">
        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Validation Logic</p>
        <code className="text-xs text-cyan-400 font-mono">{rule.validation_logic}</code>
      </div>
    </div>
  );
}

function MappingCard({ m }) {
  return (
    <div className="p-6 border rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-bold text-blue-500 uppercase mb-1">Source Domain</p>
          <Badge variant="outline" className="capitalize mb-2">{m.source_domain}</Badge>
          <code className="block text-sm bg-blue-100 px-2 py-1 rounded font-mono">{m.source_field}</code>
        </div>
        <div className="flex flex-col items-center">
          <Badge className="bg-slate-900 text-white uppercase text-xs mb-2">{m.target_standard}</Badge>
          <ArrowRightLeft className="h-6 w-6 text-slate-400" />
        </div>
        <div className="flex-1 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-xs font-bold text-emerald-500 uppercase mb-1">Target Standard</p>
          <Badge variant="outline" className="mb-2">{m.target_standard}</Badge>
          <code className="block text-sm bg-emerald-100 px-2 py-1 rounded font-mono">{m.target_field}</code>
        </div>
      </div>
      <p className="text-sm text-slate-600 italic">{m.description}</p>
    </div>
  );
}

function PolicyCard({ p }) {
  return (
    <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Lock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <Badge className="uppercase font-bold text-sm capitalize">{p.resource_domain} Domain</Badge>
            <p className="text-xs text-slate-500 mt-1">Resource Access Policy</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-bold text-blue-500 uppercase mb-2">Allowed Domains</p>
          <div className="flex flex-wrap gap-1">
            {p.allowed_domains && p.allowed_domains[0] && <Badge className="bg-blue-100 text-blue-700 capitalize">{p.allowed_domains[0]}</Badge>}
            {p.allowed_domains && p.allowed_domains[1] && <Badge className="bg-blue-100 text-blue-700 capitalize">{p.allowed_domains[1]}</Badge>}
          </div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-xs font-bold text-purple-500 uppercase mb-2">Allowed Roles</p>
          <div className="flex flex-wrap gap-1">
            {p.allowed_roles && p.allowed_roles[0] && <Badge className="bg-purple-100 text-purple-700 capitalize">{p.allowed_roles[0]}</Badge>}
            {p.allowed_roles && p.allowed_roles[1] && <Badge className="bg-purple-100 text-purple-700 capitalize">{p.allowed_roles[1]}</Badge>}
          </div>
        </div>
        <div className="p-3 bg-emerald-50 rounded-lg">
          <p className="text-xs font-bold text-emerald-500 uppercase mb-2">Visible Fields</p>
          <div className="flex flex-wrap gap-1">
            {p.data_fields_visible && p.data_fields_visible[0] && <Badge variant="outline" className="text-xs font-mono">{p.data_fields_visible[0]}</Badge>}
            {p.data_fields_visible && p.data_fields_visible[1] && <Badge variant="outline" className="text-xs font-mono">{p.data_fields_visible[1]}</Badge>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Governance() {
  const [mappings, setMappings] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [complianceRules, setComplianceRules] = useState([]);
  const [standards, setStandards] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: 'Bearer ' + token };
        
        const mappingsRes = await axios.get(API + '/governance/mappings', { headers });
        const policiesRes = await axios.get(API + '/governance/policies', { headers });
        const complianceRes = await axios.get(API + '/governance/compliance', { headers });
        const standardsRes = await axios.get(API + '/governance/standards', { headers });
        const dashboardRes = await axios.get(API + '/governance/dashboard', { headers });
        
        setMappings(mappingsRes.data);
        setPolicies(policiesRes.data);
        setComplianceRules(complianceRes.data);
        setStandards(standardsRes.data);
        setDashboardStats(dashboardRes.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch governance data');
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

  return (
    <Layout>
      <div className="space-y-8" data-testid="governance-page">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-800 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
              Federated Computational Governance
            </Badge>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Federated Governance</h1>
            <p className="text-purple-200 font-medium text-lg max-w-2xl">
              Achieve interoperability through standardization, semantic mappings, and compliance.
            </p>
          </div>
        </div>

        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Semantic Mappings</p>
                    <p className="text-3xl font-black text-blue-600">{dashboardStats.semantic_mappings}</p>
                  </div>
                  <ArrowRightLeft className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Access Policies</p>
                    <p className="text-3xl font-black text-purple-600">{dashboardStats.access_policies}</p>
                  </div>
                  <Lock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Compliance Rules</p>
                    <p className="text-3xl font-black text-orange-600">{dashboardStats.compliance_rules}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Standards</p>
                    <p className="text-3xl font-black text-emerald-600">{dashboardStats.interoperability_standards}</p>
                  </div>
                  <Globe className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="standards" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
            <TabsTrigger value="standards" className="font-bold uppercase text-xs">Standards</TabsTrigger>
            <TabsTrigger value="compliance" className="font-bold uppercase text-xs">Compliance</TabsTrigger>
            <TabsTrigger value="mappings" className="font-bold uppercase text-xs">Mappings</TabsTrigger>
            <TabsTrigger value="policies" className="font-bold uppercase text-xs">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="standards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {standards && standards.length > 0 && standards.map(function(standard) {
                return <StandardCard key={standard.id} standard={standard} />;
              })}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-black uppercase tracking-tighter">Compliance Rules</CardTitle>
                <CardDescription>Organizational rules enforced across the mesh</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceRules && complianceRules.length > 0 && complianceRules.map(function(rule) {
                    return <ComplianceCard key={rule.id} rule={rule} />;
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mappings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-black uppercase tracking-tighter">Semantic Mappings</CardTitle>
                <CardDescription>Field translation rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mappings && mappings.length > 0 && mappings.map(function(m) {
                    return <MappingCard key={m.id} m={m} />;
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-black uppercase tracking-tighter">Access Policies (ABAC)</CardTitle>
                <CardDescription>Attribute-Based Access Control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies && policies.length > 0 && policies.map(function(p) {
                    return <PolicyCard key={p.id} p={p} />;
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default Governance;
