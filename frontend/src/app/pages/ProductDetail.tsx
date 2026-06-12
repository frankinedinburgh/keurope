import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../context/CartContext';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        if (data.status === 'success') {
          setProduct(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [addedToCart, setAddedToCart] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <Link to="/shop" className="text-sm underline">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-[3/4] bg-neutral-100">
            <img
              src={product.image_url}
              alt={product.title}
              className="size-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 self-start">
            <p className="text-sm text-neutral-600 mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl mb-4">{product.title}</h1>
            <p className="text-2xl mb-8">€{product.price}</p>

            <div className="mb-8">
              <p className="text-neutral-600 leading-relaxed">{product.description || 'Premium quality fashion item'}</p>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <label className="block text-sm mb-4">
                Select Size {!selectedSize && <span className="text-neutral-500">*</span>}
              </label>
              <div className="flex flex-wrap gap-3">
                {(product.sizes || ['XS', 'S', 'M', 'L', 'XL']).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-neutral-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full py-4 mb-4 transition-all ${
                !selectedSize
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {addedToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="size-5" />
                  Added to Cart
                </span>
              ) : (
                'Add to Cart'
              )}
            </button>

            {!selectedSize && (
              <p className="text-sm text-neutral-500 text-center">Please select a size</p>
            )}

            {/* Product Details */}
            <div className="mt-12 border-t pt-8 space-y-6">
              <div>
                <h3 className="mb-2">Details</h3>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Premium quality materials</li>
                  <li>• Designed in Korea</li>
                  <li>• Shipped from Ireland</li>
                  <li>• Free returns within 30 days</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2">Care Instructions</h3>
                <p className="text-sm text-neutral-600">
                  Machine wash cold, gentle cycle. Hang to dry. Iron on low heat if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
