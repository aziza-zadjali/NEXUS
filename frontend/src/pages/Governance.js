import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRightLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Governance() {
  const [mappings, setMappings] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [mappingsRes, policiesRes] = await Promise.all([
        axios.get(`${API}/governance/mappings`, { headers }),
        axios.get(`${API}/governance/policies`, { headers })
      ]);
      
      setMappings(mappingsRes.data);
      setPolicies(policiesRes.data);
    } catch (error) {
      toast.error('Failed to fetch governance data');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="governance-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10 text-amber-600" />
            Federated Governance
          </h1>
          <p className="text-slate-600">Semantic mappings, access policies, and data contracts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Semantic Mappings
              </CardTitle>
              <CardDescription>
                Automatic mapping between domain-specific fields and national standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mappings.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No mappings configured</p>
                ) : (
                  mappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      data-testid="mapping-item"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {mapping.source_domain}
                          </Badge>
                          <code className="text-sm bg-blue-50 px-2 py-1 rounded">
                            {mapping.source_field}
                          </code>
                          <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                          <code className="text-sm bg-green-50 px-2 py-1 rounded">
                            {mapping.target_field}
                          </code>
                          <Badge variant="outline" className="font-mono text-xs">
                            {mapping.target_standard}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{mapping.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Access Control Policies (ABAC)
              </CardTitle>
              <CardDescription>
                Domain-based attribute access control and data sovereignty rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policies.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No policies configured</p>
                ) : (
                  policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      data-testid="policy-item"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-slate-900">Resource Domain</h3>
                          <Badge className="mt-1 bg-blue-100 text-blue-700">
                            {policy.resource_domain}
                          </Badge>
                        </div>
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-slate-500 mb-1">Allowed Domains:</p>
                          <div className="flex flex-wrap gap-1">
                            {policy.allowed_domains.map((domain, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {domain}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-slate-500 mb-1">Allowed Roles:</p>
                          <div className="flex flex-wrap gap-1">
                            {policy.allowed_roles.map((role, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-slate-500 mb-1">Visible Fields:</p>
                          <div className="flex flex-wrap gap-1">
                            {policy.data_fields_visible.map((field, idx) => (
                              <code key={idx} className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                                {field}
                              </code>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default Governance;
