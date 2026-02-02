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
  Search, Database, Tag, ExternalLink, Users,
  Globe, FileText, Shield, Zap, BookOpen, Copy
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// Tag Template Card
function TagTemplateCard({ template }) {
  const colorMap = {
    data_product: 'from-blue-500 to-blue-600',
    data_quality: 'from-emerald-500 to-emerald-600',
    access_control: 'from-purple-500 to-purple-600',
    streaming_topic: 'from-orange-500 to-orange-600',
    lineage: 'from-cyan-500 to-cyan-600'
  };
  
  const colorClass = colorMap[template.template_type] || 'from-slate-500 to-slate-600';
  
  const fieldBadges = [];
  for (let i = 0; i < template.fields.length; i++) {
    const field = template.fields[i];
    fieldBadges.push(
      <Badge key={i} variant="outline" className="text-xs">
        {field.name || field.display_name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Badge>
    );
  }

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
        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Fields ({template.fields.length})</p>
        <div className="flex flex-wrap gap-1">{fieldBadges}</div>
      </CardContent>
    </Card>
  );
}

// Search Result Card
function SearchResultCard({ result, onView, onAccess }) {
  const statusMap = { RELEASED: 'bg-emerald-500', DRAFT: 'bg-amber-500', DEPRECATED: 'bg-red-500' };
  const statusColor = statusMap[result.status] || 'bg-slate-500';
  
  const tagBadges = [];
  if (result.tags) {
    for (let i = 0; i < result.tags.length && i < 5; i++) {
      tagBadges.push(<Badge key={i} variant="outline" className="text-xs">{result.tags[i]}</Badge>);
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{result.product_name}</h3>
                <p className="text-sm text-slate-500">{result.data_domain} Domain</p>
              </div>
              <Badge className={statusColor + ' text-white'}>{result.status}</Badge>
            </div>
            <p className="text-sm text-slate-600 mb-3">{result.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-500">Business Owner</p>
                <p className="text-sm font-medium">{result.business_owner}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Technical Owner</p>
                <p className="text-sm font-medium">{result.technical_owner}</p>
              </div>
            </div>
            {tagBadges.length > 0 && <div className="flex flex-wrap gap-1 mb-3">{tagBadges}</div>}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={function() { onView(result); }}>
                <BookOpen className="h-4 w-4 mr-1" /> Details
              </Button>
              <Button size="sm" onClick={function() { onAccess(result); }}>
                <Shield className="h-4 w-4 mr-1" /> Request Access
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
function DataCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [tagTemplates, setTagTemplates] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(function() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchData = async function() {
      try {
        const headers = { Authorization: 'Bearer ' + token };
        const results = await Promise.all([
          axios.get(API + '/catalog/products', { headers }),
          axios.get(API + '/catalog/tag-templates', { headers })
        ]);
        
        const transformed = [];
        for (let i = 0; i < results[0].data.length; i++) {
          const p = results[0].data[i];
          transformed.push({
            id: p.id,
            product_name: p.name,
            description: p.description,
            data_domain: p.domain,
            status: 'RELEASED',
            business_owner: p.owner_email || 'admin@asyad.om',
            technical_owner: p.owner_email || 'admin@asyad.om',
            tags: p.tags || [],
            endpoint: p.endpoint
          });
        }
        
        setProducts(transformed);
        setSearchResults(transformed);
        setTagTemplates(results[1].data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(function() {
    let filtered = products;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = [];
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        if (p.product_name.toLowerCase().indexOf(query) !== -1 ||
            p.description.toLowerCase().indexOf(query) !== -1) {
          results.push(p);
        }
      }
      filtered = results;
    }
    if (selectedDomain !== 'all') {
      const domainFiltered = [];
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].data_domain === selectedDomain) {
          domainFiltered.push(filtered[i]);
        }
      }
      filtered = domainFiltered;
    }
    setSearchResults(filtered);
  }, [searchQuery, selectedDomain, products]);

  const handleView = function(product) { setSelectedProduct(product); setShowDetails(true); };
  const handleAccess = function(product) { setSelectedProduct(product); setShowAccess(true); };
  const handleSubmitAccess = function() { toast.success('Access request submitted!'); setShowAccess(false); };

  const searchCards = [];
  for (let i = 0; i < searchResults.length; i++) {
    searchCards.push(
      <SearchResultCard key={searchResults[i].id} result={searchResults[i]} onView={handleView} onAccess={handleAccess} />
    );
  }

  const templateCards = [];
  for (let i = 0; i < tagTemplates.length; i++) {
    templateCards.push(<TagTemplateCard key={tagTemplates[i].id} template={tagTemplates[i]} />);
  }

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

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  className="pl-10 text-lg"
                  placeholder="Search data products..."
                  value={searchQuery}
                  onChange={function(e) { setSearchQuery(e.target.value); }}
                />
              </div>
              <select 
                className="px-4 py-2 border rounded-lg text-sm font-medium"
                value={selectedDomain}
                onChange={function(e) { setSelectedDomain(e.target.value); }}
              >
                <option value="all">All Domains</option>
                <option value="port">PORT</option>
                <option value="fleet">FLEET</option>
                <option value="epc">EPC</option>
                <option value="logistics">LOGISTICS</option>
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
            <p className="text-sm text-slate-500">Found <span className="font-bold text-slate-900">{searchResults.length}</span> data products</p>
            <div className="space-y-4">{searchCards}</div>
            {searchResults.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data products found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-1">Data Catalog Tag Templates</h3>
              <p className="text-sm text-slate-500">Standardized templates based on Google Cloud Data Mesh patterns</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{templateCards}</div>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <Badge className="bg-emerald-500 w-fit">RELEASED</Badge>
              <DialogTitle className="text-2xl font-black">{selectedProduct && selectedProduct.product_name}</DialogTitle>
              <p className="text-slate-500">{selectedProduct && selectedProduct.data_domain} Domain</p>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600">{selectedProduct && selectedProduct.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Business Owner</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{selectedProduct && selectedProduct.business_owner}</span>
                  </div>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Technical Owner</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{selectedProduct && selectedProduct.technical_owner}</span>
                  </div>
                </div>
              </div>
              {selectedProduct && selectedProduct.endpoint && (
                <div className="p-4 border rounded-xl">
                  <p className="text-xs text-slate-500 mb-2">Endpoint</p>
                  <code className="text-sm font-mono bg-slate-100 p-2 rounded block">{selectedProduct.endpoint}</code>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Access Dialog */}
        <Dialog open={showAccess} onOpenChange={setShowAccess}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">Request Access</DialogTitle>
              <p className="text-slate-500">Request access to: {selectedProduct && selectedProduct.product_name}</p>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Your Name</label>
                <Input placeholder="Full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input type="email" placeholder="email@asyad.om" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Use Case</label>
                <Input placeholder="e.g., Real-time tracking dashboard" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Justification</label>
                <textarea className="w-full p-3 border rounded-lg text-sm" rows={3} placeholder="Why do you need access?"></textarea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={function() { setShowAccess(false); }}>Cancel</Button>
              <Button onClick={handleSubmitAccess}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default DataCatalog;
