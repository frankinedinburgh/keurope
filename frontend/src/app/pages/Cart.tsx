import { Link, useNavigate } from 'react-router';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="size-16 mx-auto mb-4 text-neutral-300" />
          <h2 className="text-2xl mb-4">Your cart is empty</h2>
          <p className="text-neutral-600 mb-8">Start adding some items to your cart</p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white px-8 py-3 hover:bg-neutral-800 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}`}
                className="flex gap-4 border-b pb-6"
              >
                <div className="w-24 h-32 flex-shrink-0 bg-neutral-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4 mb-2">
                    <div>
                      <Link
                        to={`/product/${item.id}`}
                        className="hover:text-neutral-600 transition-colors"
                      >
                        <h3 className="mb-1">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-neutral-600">{item.category}</p>
                      <p className="text-sm text-neutral-600">Size: {item.selectedSize}</p>
                    </div>
                    <p className="flex-shrink-0">€{item.price}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.selectedSize, item.quantity - 1)
                        }
                        className="size-8 flex items-center justify-center border hover:bg-neutral-100 transition-colors"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.selectedSize, item.quantity + 1)
                        }
                        className="size-8 flex items-center justify-center border hover:bg-neutral-100 transition-colors"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-sm text-neutral-600 hover:text-black transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border p-6 sticky top-24">
              <h2 className="text-xl mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
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

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-black text-white py-4 mb-4 hover:bg-neutral-800 transition-colors"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="block text-center text-sm text-neutral-600 hover:text-black transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
