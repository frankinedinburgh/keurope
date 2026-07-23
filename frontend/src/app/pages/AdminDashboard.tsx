import { useNavigate, Link } from 'react-router';
import { Package, ShoppingCart, LogOut } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdmin();

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/products"
            className="bg-white rounded-lg border p-8 hover:border-black transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="size-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Products</h2>
                <p className="text-sm text-neutral-600">Manage products inventory</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white rounded-lg border p-8 hover:border-black transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingCart className="size-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Orders</h2>
                <p className="text-sm text-neutral-600">View and manage orders</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
