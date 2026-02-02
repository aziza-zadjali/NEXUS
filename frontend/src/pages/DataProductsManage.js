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
  Search, Database, ExternalLink, Users, GitBranch, Code,
  Shield, Zap, Star, ArrowRight, Plus, Settings, Eye,
  CheckCircle2, AlertTriangle, Package, Link2, Activity
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// SLA Tier Badge
function SLATierBadge({ tier }) {
  const colors = {
    'tier-1': 'bg-emerald-500',
    'tier-2': 'bg-blue-500',
    'tier-3': 'bg-amber-500'
  };
  const labels = {
    'tier-1': '99.9% SLA',
    'tier-2': '99.5% SLA',
    'tier-3': '99.0% SLA'
  };
  return (
    <Badge className={colors[tier] + ' text-white text-xs'}>
      {labels[tier] || tier}
    </Badge>
  );
}

// Quality Badge
function QualityBadge({ quality }) {
  const colors = {
    'authoritative': 'bg-purple-600',
    'curated': 'bg-blue-600',
    'raw': 'bg-slate-500'
  };
  const icons = {
    'authoritative': Star,
    'curated': CheckCircle2,
    'raw': Database
  };
  const Icon = icons[quality] || Database;
  return (
    <Badge className={colors[quality] + ' text-white text-xs flex items-center gap-1'}>
      <Icon className="h-3 w-3" />
      {quality}
    </Badge>
  );
}

// Data Product Card (Confluent-style)
function DataProductCard({ product, onView, onEdit }) {
  const domainColors = {
    'port': 'border-l-blue-500',
    'fleet': 'border-l-purple-500',
    'epc': 'border-l-green-500',
    'logistics': 'border-l-orange-500',
    'membership': 'border-l-cyan-500',
    'orders': 'border-l-pink-500'
  };
  const borderClass = domainColors[product.domain] || 'border-l-slate-500';

  return (
    <Card className={'hover:shadow-xl transition-all border-l-4 ' + borderClass}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-black">{product.name}</CardTitle>
              <p className="text-xs text-slate-500 font-mono">{product.qualifiedName}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <SLATierBadge tier={product.sla} />
            <QualityBadge quality={product.quality} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">{product.description}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Owner</p>
            <p className="font-medium text-sm text-blue-600">{product.owner}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Domain</p>
            <p className="font-medium text-sm capitalize">{product.domain}</p>
          </div>
        </div>

        {product.schema && (
          <div className="p-2 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Schema</p>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-purple-600">{product.schema.subject}</code>
              <Badge variant="outline" className="text-xs">v{product.schema.version}</Badge>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={function() { onView(product); }}>
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
          <Button size="sm" className="flex-1" onClick={function() { onEdit(product); }}>
            <Settings className="h-4 w-4 mr-1" /> Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Topic Card (can be promoted to Data Product)
function TopicCard({ topic, onPromote }) {
  return (
    <Card className="hover:shadow-lg transition-all border-dashed border-2 border-slate-300 bg-slate-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <Zap className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-700">{topic.name}</h4>
              <p className="text-xs text-slate-400 font-mono">{topic.qualifiedName}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={function() { onPromote(topic); }}>
            <Plus className="h-4 w-4 mr-1" /> Promote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Data Product Detail Dialog
function ProductDetailDialog({ product, open, onClose }) {
  if (!product) return null;

  const schemaJson = product.schema && product.schema.schema ? 
    JSON.stringify(JSON.parse(product.schema.schema), null, 2) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <SLATierBadge tier={product.sla} />
            <QualityBadge quality={product.quality} />
          </div>
          <DialogTitle className="text-2xl font-black">{product.name}</DialogTitle>
          <p className="text-slate-500 font-mono text-sm">{product.qualifiedName}</p>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="urls">URLs</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-slate-700">{product.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-bold text-slate-500">Owner</span>
                </div>
                <p className="font-bold text-blue-600">{product.owner}</p>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-bold text-slate-500">Domain</span>
                </div>
                <p className="font-bold text-purple-600 capitalize">{product.domain}</p>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-500">SLA Tier</span>
                </div>
                <p className="font-bold">{product.sla}</p>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-bold text-slate-500">Quality</span>
                </div>
                <p className="font-bold capitalize">{product.quality}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schema" className="mt-4">
            {product.schema ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Subject</p>
                    <p className="font-mono text-sm">{product.schema.subject}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Version</p>
                    <p className="font-mono text-sm">{product.schema.version}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Schema ID</p>
                    <p className="font-mono text-sm">{product.schema.id}</p>
                  </div>
                </div>
                {schemaJson && (
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-2">Avro Schema</p>
                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-sm font-mono max-h-[400px] overflow-y-auto">
                      {schemaJson}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No schema information available</p>
            )}
          </TabsContent>

          <TabsContent value="urls" className="mt-4">
            {product.urls ? (
              <div className="space-y-3">
                {product.urls.schemaUrl && (
                  <a href={product.urls.schemaUrl} target="_blank" rel="noreferrer" 
                     className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-bold">Schema Registry</p>
                        <p className="text-xs text-slate-500">View schema in registry</p>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-slate-400" />
                  </a>
                )}
                {product.urls.portUrl && (
                  <a href={product.urls.portUrl} target="_blank" rel="noreferrer"
                     className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-bold">Data Port (Topic)</p>
                        <p className="text-xs text-slate-500">Access the Kafka topic</p>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-slate-400" />
                  </a>
                )}
                {product.urls.lineageUrl && (
                  <a href={product.urls.lineageUrl} target="_blank" rel="noreferrer"
                     className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-bold">Stream Lineage</p>
                        <p className="text-xs text-slate-500">View data flow and dependencies</p>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-slate-400" />
                  </a>
                )}
                {product.urls.exportUrl && (
                  <a href={product.urls.exportUrl} target="_blank" rel="noreferrer"
                     className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Link2 className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-bold">Connectors</p>
                        <p className="text-xs text-slate-500">Export data via connectors</p>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-slate-400" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No URLs configured</p>
            )}
          </TabsContent>

          <TabsContent value="lineage" className="mt-4">
            <div className="p-8 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-4">
                <div className="p-4 bg-blue-100 rounded-xl text-center">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-blue-700">Source Topics</p>
                </div>
                <ArrowRight className="h-6 w-6 text-slate-400" />
                <div className="p-4 bg-purple-100 rounded-xl text-center border-2 border-purple-300">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-purple-700">{product.name}</p>
                  <p className="text-xs text-purple-500">Data Product</p>
                </div>
                <ArrowRight className="h-6 w-6 text-slate-400" />
                <div className="p-4 bg-green-100 rounded-xl text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-green-700">Consumers</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Promote Topic Dialog
function PromoteTopicDialog({ topic, open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    description: '',
    owner: '@logistics-team',
    domain: 'logistics',
    sla: 'tier-2',
    quality: 'curated'
  });

  const handleSave = function() {
    onSave({
      ...topic,
      '@type': 'DataProduct',
      description: formData.description,
      owner: formData.owner,
      domain: formData.domain,
      sla: formData.sla,
      quality: formData.quality
    });
    onClose();
  };

  if (!topic) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Promote to Data Product</DialogTitle>
          <p className="text-slate-500">Add metadata to promote "{topic.name}" to a data product</p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea 
              className="w-full p-3 border rounded-lg text-sm mt-1"
              rows={3}
              placeholder="Describe what this data product provides..."
              value={formData.description}
              onChange={function(e) { setFormData({...formData, description: e.target.value}); }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Owner</label>
              <Input 
                placeholder="@team-name"
                value={formData.owner}
                onChange={function(e) { setFormData({...formData, owner: e.target.value}); }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Domain</label>
              <select 
                className="w-full p-2 border rounded-lg text-sm"
                value={formData.domain}
                onChange={function(e) { setFormData({...formData, domain: e.target.value}); }}
              >
                <option value="port">Port</option>
                <option value="fleet">Fleet</option>
                <option value="epc">EPC</option>
                <option value="logistics">Logistics</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">SLA Tier</label>
              <select 
                className="w-full p-2 border rounded-lg text-sm"
                value={formData.sla}
                onChange={function(e) { setFormData({...formData, sla: e.target.value}); }}
              >
                <option value="tier-1">Tier 1 (99.9%)</option>
                <option value="tier-2">Tier 2 (99.5%)</option>
                <option value="tier-3">Tier 3 (99.0%)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Quality</label>
              <select 
                className="w-full p-2 border rounded-lg text-sm"
                value={formData.quality}
                onChange={function(e) { setFormData({...formData, quality: e.target.value}); }}
              >
                <option value="authoritative">Authoritative</option>
                <option value="curated">Curated</option>
                <option value="raw">Raw</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Promote to Data Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
function DataProductsManage() {
  const [products, setProducts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [promoteTopicData, setPromoteTopicData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showPromote, setShowPromote] = useState(false);

  useEffect(function() {
    fetchData();
  }, []);

  const fetchData = async function() {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };
      const response = await axios.get(API + '/catalog/products', { headers });
      
      // Transform to Confluent-style data products
      const transformed = [];
      const rawTopics = [];
      
      for (let i = 0; i < response.data.length; i++) {
        const p = response.data[i];
        transformed.push({
          '@type': 'DataProduct',
          name: p.name,
          qualifiedName: 'asyad-mesh:' + p.id,
          description: p.description,
          owner: '@' + p.domain + '-team',
          domain: p.domain,
          sla: i === 0 ? 'tier-1' : (i === 1 ? 'tier-2' : 'tier-3'),
          quality: i === 0 ? 'authoritative' : (i === 1 ? 'curated' : 'raw'),
          urls: {
            schemaUrl: '/schemas/' + p.id,
            portUrl: '/topics/' + p.id,
            lineageUrl: '/lineage/' + p.id,
            exportUrl: '/connectors/' + p.id
          },
          schema: {
            subject: p.id + '-value',
            version: 1,
            id: 100000 + i,
            schema: JSON.stringify({
              type: 'record',
              name: p.name.replace(/\s+/g, '_').toLowerCase(),
              namespace: 'io.asyad.datamesh',
              fields: p.schema_fields ? p.schema_fields.map(function(f) {
                return { name: typeof f === 'string' ? f : f.name, type: 'string' };
              }) : []
            })
          },
          tags: p.tags
        });
      }
      
      // Add some sample raw topics
      rawTopics.push({ '@type': 'Topic', name: 'raw_gps_events', qualifiedName: 'asyad-mesh:raw_gps_events' });
      rawTopics.push({ '@type': 'Topic', name: 'sensor_readings', qualifiedName: 'asyad-mesh:sensor_readings' });
      rawTopics.push({ '@type': 'Topic', name: 'ais_vessel_positions', qualifiedName: 'asyad-mesh:ais_vessel_positions' });
      
      setProducts(transformed);
      setTopics(rawTopics);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleViewProduct = function(product) {
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const handleEditProduct = function(product) {
    toast.info('Edit functionality - would open edit dialog');
  };

  const handlePromoteTopic = function(topic) {
    setPromoteTopicData(topic);
    setShowPromote(true);
  };

  const handleSavePromotion = function(newProduct) {
    setProducts(function(prev) { return [...prev, newProduct]; });
    setTopics(function(prev) { return prev.filter(function(t) { return t.qualifiedName !== newProduct.qualifiedName; }); });
    toast.success('Topic promoted to Data Product!');
  };

  // Filter products
  const filteredProducts = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!searchQuery || 
        p.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
        p.description.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
        p.domain.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1) {
      filteredProducts.push(p);
    }
  }

  // Build product cards
  const productCards = [];
  for (let i = 0; i < filteredProducts.length; i++) {
    productCards.push(
      <DataProductCard 
        key={filteredProducts[i].qualifiedName} 
        product={filteredProducts[i]}
        onView={handleViewProduct}
        onEdit={handleEditProduct}
      />
    );
  }

  // Build topic cards
  const topicCards = [];
  for (let i = 0; i < topics.length; i++) {
    topicCards.push(
      <TopicCard key={topics[i].qualifiedName} topic={topics[i]} onPromote={handlePromoteTopic} />
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
              Confluent-Style Data Mesh
            </Badge>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Data Products</h1>
            <p className="text-purple-200 font-medium text-lg max-w-2xl">
              Discover, manage, and promote topics to data products.
              Built on streaming data mesh principles with SLA tiers and quality levels.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Data Products</p>
                  <p className="text-3xl font-black text-purple-600">{products.length}</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Raw Topics</p>
                  <p className="text-3xl font-black text-amber-600">{topics.length}</p>
                </div>
                <Zap className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Tier-1 SLA</p>
                  <p className="text-3xl font-black text-emerald-600">
                    {products.filter(function(p) { return p.sla === 'tier-1'; }).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Authoritative</p>
                  <p className="text-3xl font-black text-blue-600">
                    {products.filter(function(p) { return p.quality === 'authoritative'; }).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
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
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="products" className="font-bold">Data Products ({products.length})</TabsTrigger>
            <TabsTrigger value="topics" className="font-bold">Raw Topics ({topics.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {productCards}
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                These topics are not yet promoted to data products. Add metadata to make them discoverable.
              </p>
            </div>
            <div className="space-y-3">
              {topicCards}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ProductDetailDialog 
          product={selectedProduct}
          open={showDetail}
          onClose={function() { setShowDetail(false); }}
        />
        <PromoteTopicDialog 
          topic={promoteTopicData}
          open={showPromote}
          onClose={function() { setShowPromote(false); }}
          onSave={handleSavePromotion}
        />
      </div>
    </Layout>
  );
}

export default DataProductsManage;
