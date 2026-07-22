import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

export function Checkout() {
  const { items, total, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderID, setOrderID] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Ireland',
  });

  if (items.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!token) {
        throw new Error('Please login to place an order');
      }

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          country: formData.country,
          items: items,
          total_price: total,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to create order');
      }

      const data = await response.json();
      setOrderID(data.data.order_id);

      try {
        await clearCart();
      } catch (cartErr) {
        console.error('Cart clearing failed:', cartErr);
        throw new Error('Order created but cart failed to clear. Please refresh the page.');
      }

      setOrderComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="size-8 text-green-600" />
          </div>
          <h1 className="text-3xl mb-4">Order Confirmed!</h1>
          <p className="text-neutral-600 mb-2">
            Thank you for your purchase. Your order has been created successfully.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            Order ID: <span className="font-mono font-semibold">{orderID}</span>
          </p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white px-8 py-3 hover:bg-neutral-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/cart"
          className="flex items-center gap-2 mb-8 text-sm hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="bg-white p-8">
            <h1 className="text-2xl mb-8">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-lg mb-4">Contact Information</h2>
                <div>
                  <label htmlFor="email" className="block text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-lg mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm mb-2">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    >
                      <option value="Ireland">Ireland</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Spain">Spain</option>
                      <option value="Italy">Italy</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 hover:bg-neutral-800 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-neutral-500 text-center">
                Order will be created and stored securely in our system.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white p-8 sticky top-24">
              <h2 className="text-xl mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b pb-4"
                  >
                    <div className="w-16 h-20 flex-shrink-0 bg-neutral-100 rounded">
                      {item.product?.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product?.title}
                          loading="lazy"
                          className="size-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium mb-1">{item.product?.title}</h3>
                      <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                      <p className="text-sm mt-2 font-medium">€{((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className={total > 150 ? 'text-green-600' : ''}>{total > 150 ? 'Free' : '€10.00'}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-xl">€{(total + (total > 150 ? 0 : 10)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
