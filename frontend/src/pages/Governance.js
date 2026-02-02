import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ArrowRightLeft, Lock, Globe, FileCheck, Award } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Governance() {
  const [mappings, setMappings] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [complianceRules, setComplianceRules] = useState([]);
  const [standards, setStandards] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const mappingsRes = await axios.get(`${API}/governance/mappings`, { headers });
      const policiesRes = await axios.get(`${API}/governance/policies`, { headers });
      const complianceRes = await axios.get(`${API}/governance/compliance`, { headers });
      const standardsRes = await axios.get(`${API}/governance/standards`, { headers });
      const dashboardRes = await axios.get(`${API}/governance/dashboard`, { headers });
      
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

  const getSeverityBadge = (severity) => {
    if (severity === 'critical') return 'bg-red-500 text-white';
    if (severity === 'high') return 'bg-orange-500 text-white';
    if (severity === 'medium') return 'bg-amber-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getComplianceBadge = (level) => {
    if (level === 'Full') return 'bg-emerald-500 text-white';
    if (level === 'Partial') return 'bg-amber-500 text-white';
    return 'bg-red-500 text-white';
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
      <div className="space-y-8" data-testid="governance-page">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-800 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
              Federated Computational Governance
            </Badge>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Federated Governance</h1>
            <p className="text-purple-200 font-medium text-lg max-w-2xl">
              Achieve interoperability through standardization, semantic mappings, and compliance 
              with organizational rules and industry regulations across the entire data mesh.
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
              {standards.map((standard) => (
                <Card key={standard.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                          <Globe className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-black uppercase tracking-tight">
                            {standard.name}
                          </CardTitle>
                          <CardDescription>Version {standard.version}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getComplianceBadge(standard.compliance_level)}>
                        {standard.compliance_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">{standard.description}</p>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Supported Domains</p>
                      <div className="flex flex-wrap gap-2">
                        {standard.supported_domains.map((domain, idx) => (
                          <Badge key={idx} variant="outline" className="capitalize">{domain}</Badge>
                        ))}
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-black uppercase tracking-tighter">Compliance Rules</CardTitle>
                <CardDescription>Organizational rules and industry regulations enforced across the mesh</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceRules.map((rule) => (
                    <div key={rule.id} className="p-6 rounded-xl border bg-slate-50">
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
                          <Badge className={getSeverityBadge(rule.severity)}>
                            {rule.severity}
                          </Badge>
                          <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                            {rule.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{rule.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {rule.applicable_domains.map((domain, idx) => (
                          <Badge key={idx} variant="outline" className="capitalize text-xs">{domain}</Badge>
                        ))}
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Validation Logic</p>
                        <code className="text-xs text-cyan-400 font-mono">{rule.validation_logic}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mappings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-black uppercase tracking-tighter">Semantic Mappings</CardTitle>
                <CardDescription>Field translation rules between domain-specific fields and national standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mappings.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No mappings configured</p>
                  ) : (
                    mappings.map((m) => (
                      <div key={m.id} className="p-6 border rounded-xl hover:bg-slate-50 transition-colors">
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-black uppercase tracking-tighter">Access Policies (ABAC)</CardTitle>
                <CardDescription>Attribute-Based Access Control ensuring data sovereignty across domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No policies configured</p>
                  ) : (
                    policies.map((p) => (
                      <div key={p.id} className="p-6 border rounded-xl hover:shadow-md transition-shadow">
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
                              {p.allowed_domains.map((domain, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-700 capitalize">{domain}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs font-bold text-purple-500 uppercase mb-2">Allowed Roles</p>
                            <div className="flex flex-wrap gap-1">
                              {p.allowed_roles.map((role, idx) => (
                                <Badge key={idx} className="bg-purple-100 text-purple-700 capitalize">{role}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-3 bg-emerald-50 rounded-lg">
                            <p className="text-xs font-bold text-emerald-500 uppercase mb-2">Visible Fields</p>
                            <div className="flex flex-wrap gap-1">
                              {p.data_fields_visible.slice(0, 3).map((field, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs font-mono">{field}</Badge>
                              ))}
                              {p.data_fields_visible.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{p.data_fields_visible.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Federated Governance Principle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              The federated governance principle achieves interoperability of all data products through 
              standardization, which is promoted through the whole data mesh by the governance group. 
              The main goal is to create a data ecosystem with adherence to organizational rules and 
              industry regulations.
            </p>
            <div className="flex gap-4 mt-6">
              <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/30">Interoperability</Badge>
              <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/30">Standardization</Badge>
              <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/30">Policy Automation</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default Governance;
