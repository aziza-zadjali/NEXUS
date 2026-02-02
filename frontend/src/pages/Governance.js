import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRightLeft, Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Governance() {
  const [mappings, setMappings] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    
    axios.get(`${API}/governance/mappings`, { headers })
      .then(res => setMappings(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API}/governance/policies`, { headers })
      .then(res => setPolicies(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Layout>
      <div className="space-y-6" data-testid="governance-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Federated Governance</h1>
          <p className="text-slate-600">Semantic mappings and access policies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Semantic Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mappings.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">No mappings</p>
                ) : (
                  mappings.map((m) => (
                    <div key={m.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{m.source_domain}</Badge>
                        <code className="text-sm bg-blue-50 px-2 py-1 rounded">{m.source_field}</code>
                        <ArrowRightLeft className="h-4 w-4" />
                        <code className="text-sm bg-green-50 px-2 py-1 rounded">{m.target_field}</code>
                      </div>
                      <p className="text-xs text-slate-600">{m.description}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policies.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">No policies</p>
                ) : (
                  policies.map((p) => (
                    <div key={p.id} className="p-4 border rounded-lg">
                      <div className="mb-2">
                        <Badge>{p.resource_domain}</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-slate-500">Domains: </span>
                          {p.allowed_domains.join(', ')}
                        </div>
                        <div>
                          <span className="text-slate-500">Roles: </span>
                          {p.allowed_roles.join(', ')}
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
