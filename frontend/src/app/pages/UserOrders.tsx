import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

export function UserOrders() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, token, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data = await response.json();
      setOrders(data.data || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Shop
          </button>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-600 mt-2">{orders.length} total orders</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border">
            <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
            <button
              onClick={() => navigate('/shop')}
              className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-6 border">
                {/* Order Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6 border-b">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order ID</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {order.id}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="font-medium">€{order.total_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="py-6 border-b">
                  <h3 className="font-medium mb-3">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      {order.first_name} {order.last_name}
                    </p>
                    <p>{order.address}</p>
                    <p>
                      {order.city}, {order.postal_code}
                    </p>
                    <p>{order.country}</p>
                    <p className="mt-2">{order.email}</p>
                  </div>
                </div>

                {/* Order Summary (basic) */}
                <div className="py-6">
                  <h3 className="font-medium mb-3">Order Summary</h3>
                  <div className="text-sm text-gray-600">
                    <p className="flex justify-between">
                      <span>Subtotal</span>
                      <span>€{order.total_price.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between mt-2 border-t pt-2 font-medium">
                      <span>Total</span>
                      <span>€{order.total_price.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
