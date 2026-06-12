import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  if (cart.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderComplete(true);
    clearCart();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="size-8 text-green-600" />
          </div>
          <h1 className="text-3xl mb-4">Order Confirmed!</h1>
          <p className="text-neutral-600 mb-8">
            Thank you for your purchase. We've sent a confirmation email with your order details.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white px-8 py-3 hover:bg-neutral-800 transition-colors mb-4"
          >
            Continue Shopping
          </Link>
          <p className="text-sm text-neutral-600">
            Your order will be shipped from Ireland within 2-3 business days.
          </p>
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
                    <input
                      type="text"
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                      placeholder="Ireland, France, Germany, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h2 className="text-lg mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      required
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className="block text-sm mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        required
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="cardCvc" className="block text-sm mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cardCvc"
                        name="cardCvc"
                        required
                        value={formData.cardCvc}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 hover:bg-neutral-800 transition-colors"
              >
                Complete Order
              </button>

              <p className="text-xs text-neutral-500 text-center">
                This is a demo checkout. No actual payment will be processed.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white p-8 sticky top-24">
              <h2 className="text-xl mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
                    className="flex gap-4"
                  >
                    <div className="w-20 h-24 flex-shrink-0 bg-neutral-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-neutral-600">Size: {item.selectedSize}</p>
                      <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                      <p className="text-sm mt-2">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span>Total</span>
                  <span className="text-xl">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
