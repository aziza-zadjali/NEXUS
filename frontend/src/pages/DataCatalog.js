import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, Search, Plus, Tag, Clock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DataCatalog() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    domain: 'port',
    description: '',
    data_type: 'operational',
    endpoint: '',
    schema_fields: '',
    update_frequency: '15min',
    owner_email: '',
    tags: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/catalog/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch data products');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/catalog/products`, {
        ...newProduct,
        schema_fields: newProduct.schema_fields.split(',').map(f => f.trim()),
        tags: newProduct.tags.split(',').map(t => t.trim())
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Data product created successfully!');
      fetchProducts();
      setNewProduct({
        name: '',
        domain: 'port',
        description: '',
        data_type: 'operational',
        endpoint: '',
        schema_fields: '',
        update_frequency: '15min',
        owner_email: '',
        tags: ''
      });
    } catch (error) {
      toast.error('Failed to create data product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDomainColor = (domain) => {
    switch(domain) {
      case 'port': return 'bg-blue-100 text-blue-700';
      case 'fleet': return 'bg-purple-100 text-purple-700';
      case 'epc': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in" data-testid="data-catalog-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Data Catalog</h1>
            <p className="text-slate-600">Discover and consume data products across domains</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-product-button">
                <Plus className="h-4 w-4 mr-2" />
                Publish Data Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Publish Data Product</DialogTitle>
                <DialogDescription>Create a new data product for the mesh</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    <select
                      id="domain"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      value={newProduct.domain}
                      onChange={(e) => setNewProduct({...newProduct, domain: e.target.value})}
                    >
                      <option value="port">Port Authority</option>
                      <option value="fleet">Fleet Operations</option>
                      <option value="epc">EPC Sites</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    rows="3"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">API Endpoint</Label>
                    <Input
                      id="endpoint"
                      placeholder="/api/port/vessels"
                      value={newProduct.endpoint}
                      onChange={(e) => setNewProduct({...newProduct, endpoint: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="update_frequency">Update Frequency</Label>
                    <Input
                      id="update_frequency"
                      placeholder="15min"
                      value={newProduct.update_frequency}
                      onChange={(e) => setNewProduct({...newProduct, update_frequency: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schema_fields">Schema Fields (comma-separated)</Label>
                  <Input
                    id="schema_fields"
                    placeholder="vessel_id, vessel_name, status"
                    value={newProduct.schema_fields}
                    onChange={(e) => setNewProduct({...newProduct, schema_fields: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner_email">Owner Email</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={newProduct.owner_email}
                      onChange={(e) => setNewProduct({...newProduct, owner_email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="logistics, real-time"
                      value={newProduct.tags}
                      onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Publish Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search data products by name, description, or tags..."
            className="pl-10 py-6 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-products-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Database className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No data products found</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow" data-testid="product-card">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge className={getDomainColor(product.domain)}>
                      {product.domain}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Endpoint</p>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{product.endpoint}</code>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Schema Fields</p>
                      <div className="flex flex-wrap gap-1">
                        {product.schema_fields.slice(0, 3).map((field, idx) => (
                          <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            {field}
                          </span>
                        ))}
                        {product.schema_fields.length > 3 && (
                          <span className="text-xs text-slate-500">+{product.schema_fields.length - 3}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {product.update_frequency}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DataCatalog;
