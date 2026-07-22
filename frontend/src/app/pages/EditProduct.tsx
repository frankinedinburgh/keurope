import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { API_BASE } from '../config/api';

const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Dresses', 'Sets'];

export function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Tops',
    description: '',
    imageFile: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_BASE}/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      const product = data.data;
      setFormData({
        title: product.title,
        price: product.price.toString(),
        category: product.category,
        description: product.description || '',
        imageFile: null,
      });
      setImagePreview(product.image_url);
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let imageData = imagePreview;
      if (formData.imageFile) {
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(formData.imageFile);
        });
      }

      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          price: parseFloat(formData.price),
          category: formData.category,
          description: formData.description,
          image_url: imageData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg p-8 border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Product Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                placeholder="e.g., Premium Cotton Shirt - Seoul Designer"
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                placeholder="Tell customers about this product..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
              />
              <p className="text-sm text-gray-500 mt-2">Leave empty to keep current image</p>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Current/Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs h-auto rounded border"
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Updating...' : 'Update Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="flex-1 bg-gray-200 text-black py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
