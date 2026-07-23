import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Edit2, Trash2, Plus, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { productsAPI, Product } from '../services/api';
import { API_BASE } from '../config/api';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export function AdminProducts() {
  const navigate = useNavigate();
  const { isAdmin, adminToken } = useAdmin();

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const { success, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (err) {
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(term));
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setShowAddForm(false);
    setFormData(product);
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.title || !formData.price || !formData.category) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await fetch(`${API_BASE}/admin/products/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify(formData),
        });
        success('Product updated');
      } else {
        await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify(formData),
        });
        success('Product created');
      }
      setEditingId(null);
      setShowAddForm(false);
      loadProducts();
    } catch (err) {
      showError(editingId ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      success('Product deleted');
      loadProducts();
    } catch (err) {
      showError('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-neutral-600">Manage your products inventory</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {showAddForm || editingId ? (
          <div className="bg-white rounded-lg border p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({});
                }}
                className="text-neutral-600 hover:text-black"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Product title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <input
                    type="text"
                    placeholder="Category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Product description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-4 h-40 object-cover rounded" />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-black text-white py-2 rounded hover:bg-neutral-800 font-medium"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({});
                  }}
                  className="flex-1 bg-neutral-200 text-neutral-800 py-2 rounded hover:bg-neutral-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-neutral-800 transition-colors font-medium"
          >
            <Plus className="size-4" />
            Add New Product
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            📦 View Orders
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Products</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-neutral-600">Showing {filteredAndSorted.length} of {products.length} products</p>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-neutral-100 rounded flex-shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">No image</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{product.title}</p>
                          <p className="text-xs text-neutral-500">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium">€{product.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50 transition-colors font-medium flex items-center gap-1"
                        >
                          <Edit2 className="size-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 border border-red-600 text-red-600 rounded text-sm hover:bg-red-50 transition-colors font-medium flex items-center gap-1"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSorted.length === 0 && (
            <div className="px-6 py-12 text-center text-neutral-600">
              <p>No products found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
