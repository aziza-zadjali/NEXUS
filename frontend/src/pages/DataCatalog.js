import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Database, Tag, Filter, ExternalLink, Users, Mail,
  CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight,
  Globe, FileText, Shield, Zap, BookOpen, Link2, Copy
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// Tag Template Component
function TagTemplateCard({ template }) {
  const templateColors = {
    data_product: 'from-blue-500 to-blue-600',
    data_quality: 'from-emerald-500 to-emerald-600',
    access_control: 'from-purple-500 to-purple-600',
    streaming_topic: 'from-orange-500 to-orange-600'
  };
  
  const colorClass = templateColors[template.template_type] || 'from-slate-500 to-slate-600';

  return (
    <Card className="hover:shadow-lg transition-all">
      <div className={'h-2 rounded-t-lg bg-gradient-to-r ' + colorClass}></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{template.display_name}</CardTitle>
          <Badge variant="outline">{template.template_type}</Badge>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase">Fields ({template.fields.length})</p>
          <div className="flex flex-wrap gap-1">
            {template.fields.map(function(field, idx) {
              return (
                <Badge key={idx} variant="outline" className="text-xs">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Search Result Card
function SearchResultCard({ result, onRequestAccess, onViewDetails }) {
  const statusColors = {
    RELEASED: 'bg-emerald-500',
    DRAFT: 'bg-amber-500',
    DEPRECATED: 'bg-red-500'
  };
  
  const typeIcons = {
    BIGQUERY_TABLE: Database,
    PUBSUB_TOPIC: Zap,
    API_ENDPOINT: Globe,
    FILE_SET: FileText
  };
  
  const Icon = typeIcons[result.resource_type] || Database;

  return (
    <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{result.product_name}</h3>
                <p className="text-sm text-slate-500">{result.data_domain} Domain</p>
              </div>
              <Badge className={statusColors[result.status] + ' text-white'}>{result.status}</Badge>
            </div>
            <p className="text-sm text-slate-600 mb-3">{result.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500">Business Owner</p>
                <p className="text-sm font-medium">{result.business_owner}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Technical Owner</p>
                <p className="text-sm font-medium">{result.technical_owner}</p>
              </div>
            </div>

            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {result.tags.map(function(tag, idx) {
                  return <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>;
                })}
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={function() { onViewDetails(result); }}>
                <BookOpen className="h-4 w-4 mr-1" /> View Details
              </Button>
              <Button size="sm" onClick={function() { onRequestAccess(result); }}>
                <Shield className="h-4 w-4 mr-1" /> Request Access
              </Button>
              {result.documentation_link && (
                <Button size="sm" variant="ghost" onClick={function() { window.open(result.documentation_link, '_blank'); }}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Access Request Dialog
function AccessRequestDialog({ product, open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    requester_name: '',
    requester_email: '',
    team: '',
    use_case: '',
    justification: ''
  });

  const handleSubmit = function() {
    onSubmit({
      ...formData,
      product_id: product.id,
      product_name: product.product_name,
      requested_at: new Date().toISOString(),
      status: 'pending'
    });
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase">Request Access</DialogTitle>
          <p className="text-slate-500">Request access to: {product.product_name}</p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Your Name</label>
              <Input 
                placeholder="Full name"
                value={formData.requester_name}
                onChange={function(e) { setFormData({...formData, requester_name: e.target.value}); }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input 
                type="email"
                placeholder="email@company.com"
                value={formData.requester_email}
                onChange={function(e) { setFormData({...formData, requester_email: e.target.value}); }}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Team / Project</label>
            <Input 
              placeholder="e.g., Fleet Operations"
              value={formData.team}
              onChange={function(e) { setFormData({...formData, team: e.target.value}); }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Use Case</label>
            <Input 
              placeholder="e.g., Real-time vessel tracking dashboard"
              value={formData.use_case}
              onChange={function(e) { setFormData({...formData, use_case: e.target.value}); }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Business Justification</label>
            <textarea 
              className="w-full p-3 border rounded-lg text-sm"
              rows={3}
              placeholder="Explain why you need access to this data product..."
              value={formData.justification}
              onChange={function(e) { setFormData({...formData, justification: e.target.value}); }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Product Details Dialog
function ProductDetailsDialog({ product, open, onClose }) {
  if (!product) return null;

  const copyResourcePath = function() {
    navigator.clipboard.writeText(product.linked_resource || product.endpoint);
    toast.success('Resource path copied!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <Badge className={product.status === 'RELEASED' ? 'bg-emerald-500 w-fit' : 'bg-amber-500 w-fit'}>
            {product.status}
          </Badge>
          <DialogTitle className="text-2xl font-black">{product.product_name}</DialogTitle>
          <p className="text-slate-500">{product.data_domain} Domain • {product.resource_type}</p>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600">{product.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Business Owner</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{product.business_owner}</span>
                </div>
                <a href={'mailto:' + product.business_owner} className="text-xs text-blue-500 hover:underline">
                  Contact via email
                </a>
              </div>
              <div className="p-4 border rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Technical Owner</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{product.technical_owner}</span>
                </div>
                <a href={'mailto:' + product.technical_owner} className="text-xs text-purple-500 hover:underline">
                  Contact via email
                </a>
              </div>
            </div>

            <div className="p-4 border rounded-xl">
              <p className="text-xs text-slate-500 mb-2">Resource Location</p>
              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded font-mono text-sm">
                <code className="flex-1 truncate">{product.linked_resource || product.endpoint}</code>
                <Button size="sm" variant="ghost" onClick={copyResourcePath}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {product.documentation_link && (
              <div className="p-4 border rounded-xl">
                <p className="text-xs text-slate-500 mb-2">Documentation</p>
                <a href={product.documentation_link} target="_blank" rel="noreferrer" 
                   className="text-blue-500 hover:underline flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" /> View Documentation
                </a>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schema" className="mt-4">
            {product.schema_fields && product.schema_fields.length > 0 ? (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-bold">Field</th>
                      <th className="text-left py-2 px-3 font-bold">Type</th>
                      <th className="text-left py-2 px-3 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.schema_fields.map(function(field, idx) {
                      return (
                        <tr key={idx} className="border-t">
                          <td className="py-2 px-3 font-mono text-blue-600">{field.name || field}</td>
                          <td className="py-2 px-3">{field.type || 'string'}</td>
                          <td className="py-2 px-3 text-slate-600">{field.description || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No schema information available</p>
            )}
          </TabsContent>

          <TabsContent value="tags" className="mt-4">
            <div className="space-y-3">
              {product.catalog_tags && product.catalog_tags.map(function(tag, idx) {
                return (
                  <div key={idx} className="p-4 border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-blue-500" />
                      <span className="font-bold">{tag.template_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(tag.fields || {}).map(function(entry) {
                        const key = entry[0];
                        const value = entry[1];
                        return (
                          <div key={key} className="text-sm">
                            <span className="text-slate-500">{key}: </span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {(!product.catalog_tags || product.catalog_tags.length === 0) && (
                <p className="text-slate-500 text-center py-8">No catalog tags defined</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="access" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Access Request Process</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Submit access request with business justification</li>
                  <li>2. Request reviewed by data product owner</li>
                  <li>3. Upon approval, access granted via IAM policy</li>
                  <li>4. Service account credentials provided</li>
                </ol>
              </div>
              {product.access_request_link && (
                <div className="p-4 border rounded-xl">
                  <p className="text-xs text-slate-500 mb-2">Access Request Portal</p>
                  <a href={product.access_request_link} target="_blank" rel="noreferrer"
                     className="text-blue-500 hover:underline flex items-center gap-1">
                    <Link2 className="h-4 w-4" /> Request Access
                  </a>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Main Data Catalog Page
function DataCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [tagTemplates, setTagTemplates] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [accessRequestProduct, setAccessRequestProduct] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);

  useEffect(function() {
    fetchData();
  }, []);

  const fetchData = async function() {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };
      
      const results = await Promise.all([
        axios.get(API + '/catalog/products', { headers }),
        axios.get(API + '/catalog/tag-templates', { headers })
      ]);
      
      // Transform products to search results format
      const transformedProducts = results[0].data.map(function(p) {
        return {
          id: p.id,
          product_name: p.name,
          description: p.description,
          data_domain: p.domain,
          status: 'RELEASED',
          resource_type: 'API_ENDPOINT',
          business_owner: p.owner_email,
          technical_owner: p.owner_email,
          linked_resource: p.endpoint,
          schema_fields: p.schema_fields,
          tags: p.tags,
          documentation_link: null,
          access_request_link: null,
          catalog_tags: []
        };
      });
      
      setProducts(transformedProducts);
      setSearchResults(transformedProducts);
      setTagTemplates(results[1].data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use mock data for tag templates
      setTagTemplates([
        {
          id: 'tt1',
          template_type: 'data_product',
          display_name: 'Data Product',
          description: 'Core metadata for data products in the mesh',
          fields: [
            { name: 'product_name', type: 'string', required: true },
            { name: 'description', type: 'string', required: true },
            { name: 'status', type: 'enum', required: true },
            { name: 'business_owner', type: 'string', required: true },
            { name: 'technical_owner', type: 'string', required: true },
            { name: 'data_domain', type: 'enum', required: true },
            { name: 'documentation_link', type: 'string', required: false },
            { name: 'access_request_link', type: 'string', required: false }
          ]
        },
        {
          id: 'tt2',
          template_type: 'data_quality',
          display_name: 'Data Quality',
          description: 'Quality metrics and SLAs for data products',
          fields: [
            { name: 'freshness_sla', type: 'string', required: true },
            { name: 'completeness_threshold', type: 'number', required: true },
            { name: 'accuracy_threshold', type: 'number', required: true },
            { name: 'validation_rules', type: 'string', required: false }
          ]
        },
        {
          id: 'tt3',
          template_type: 'streaming_topic',
          display_name: 'Streaming Topic Details',
          description: 'Metadata for Pub/Sub streaming data products',
          fields: [
            { name: 'schema_ref', type: 'string', required: true },
            { name: 'message_format', type: 'enum', required: true },
            { name: 'throughput', type: 'string', required: false },
            { name: 'retention_period', type: 'string', required: false }
          ]
        },
        {
          id: 'tt4',
          template_type: 'access_control',
          display_name: 'Access Control',
          description: 'Access policies and permissions for data products',
          fields: [
            { name: 'classification', type: 'enum', required: true },
            { name: 'allowed_consumers', type: 'string', required: false },
            { name: 'column_level_security', type: 'boolean', required: false },
            { name: 'row_level_security', type: 'boolean', required: false }
          ]
        }
      ]);
      setLoading(false);
    }
  };

  const handleSearch = function() {
    let results = products;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(function(p) {
        return p.product_name.toLowerCase().includes(query) ||
               p.description.toLowerCase().includes(query) ||
               p.data_domain.toLowerCase().includes(query);
      });
    }
    
    if (selectedDomain !== 'all') {
      results = results.filter(function(p) { return p.data_domain === selectedDomain; });
    }
    
    if (selectedStatus !== 'all') {
      results = results.filter(function(p) { return p.status === selectedStatus; });
    }
    
    setSearchResults(results);
  };

  useEffect(function() {
    handleSearch();
  }, [searchQuery, selectedDomain, selectedStatus, products]);

  const handleViewDetails = function(product) {
    setSelectedProduct(product);
    setShowDetailsDialog(true);
  };

  const handleRequestAccess = function(product) {
    setAccessRequestProduct(product);
    setShowAccessDialog(true);
  };

  const handleAccessSubmit = function(request) {
    toast.success('Access request submitted! You will be notified via email.');
    console.log('Access request:', request);
  };

  const domains = ['all', 'port', 'fleet', 'epc', 'logistics'];
  const statuses = ['all', 'RELEASED', 'DRAFT', 'DEPRECATED'];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
              Central Data Catalog
            </Badge>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Data Product Discovery</h1>
            <p className="text-blue-200 font-medium text-lg max-w-2xl">
              Search, discover, and request access to data products across the Asyad ecosystem.
              Tag-based metadata enables self-service data discovery.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  className="pl-10 text-lg"
                  placeholder="Search data products (e.g., 'vessel status', 'shipment tracking')"
                  value={searchQuery}
                  onChange={function(e) { setSearchQuery(e.target.value); }}
                />
              </div>
              <select 
                className="px-4 py-2 border rounded-lg text-sm font-medium"
                value={selectedDomain}
                onChange={function(e) { setSelectedDomain(e.target.value); }}
              >
                {domains.map(function(d) {
                  return <option key={d} value={d}>{d === 'all' ? 'All Domains' : d.toUpperCase()}</option>;
                })}
              </select>
              <select 
                className="px-4 py-2 border rounded-lg text-sm font-medium"
                value={selectedStatus}
                onChange={function(e) { setSelectedStatus(e.target.value); }}
              >
                {statuses.map(function(s) {
                  return <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>;
                })}
              </select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="search" className="font-bold">Search Results</TabsTrigger>
            <TabsTrigger value="templates" className="font-bold">Tag Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Found <span className="font-bold text-slate-900">{searchResults.length}</span> data products
              </p>
            </div>
            <div className="space-y-4">
              {searchResults.map(function(result) {
                return (
                  <SearchResultCard 
                    key={result.id} 
                    result={result}
                    onViewDetails={handleViewDetails}
                    onRequestAccess={handleRequestAccess}
                  />
                );
              })}
              {searchResults.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data products found matching your search criteria</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-1">Data Catalog Tag Templates</h3>
              <p className="text-sm text-slate-500">
                Standardized tag templates used to annotate data products for discovery and governance.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tagTemplates.map(function(template) {
                return <TagTemplateCard key={template.id} template={template} />;
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ProductDetailsDialog 
          product={selectedProduct}
          open={showDetailsDialog}
          onClose={function() { setShowDetailsDialog(false); }}
        />
        <AccessRequestDialog 
          product={accessRequestProduct}
          open={showAccessDialog}
          onClose={function() { setShowAccessDialog(false); }}
          onSubmit={handleAccessSubmit}
        />
      </div>
    </Layout>
  );
}

export default DataCatalog;
