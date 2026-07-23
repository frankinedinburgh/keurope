import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Order } from '../services/api';
import { API_BASE } from '../config/api';

export function AdminOrders() {
  const navigate = useNavigate();
  const { isAdmin, adminToken } = useAdmin();
  const { success, error: showError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      const data = await response.json();
      setOrders(data.data || []);
    } catch (err) {
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await fetch(`${API_BASE}/admin/orders/status?id=${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      success(`Order status updated to ${status}`);
      loadOrders();
    } catch (err) {
      showError('Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading orders...</p>
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
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded border p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Order ID</p>
                  <p className="font-mono text-xs">{order.id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Customer</p>
                  <p className="font-medium">{order.first_name} {order.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Total</p>
                  <p className="font-medium">€{order.total_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Date</p>
                  <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Status</p>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="text-sm px-2 py-1 border rounded focus:outline-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs text-neutral-600 mb-2">Shipping Address</p>
                <p className="text-sm">{order.address}</p>
                <p className="text-sm">{order.city}, {order.postal_code}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
