import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { isAdmin, login, loading, error } = useAdmin();
  const { error: showError } = useToast();
  const [password, setPassword] = useState('');

  if (isAdmin) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(password);
      navigate('/admin/dashboard');
    } catch (err) {
      showError(error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-lg border p-8">
          <div className="flex justify-center mb-6">
            <div className="size-12 rounded-full bg-black flex items-center justify-center">
              <Lock className="size-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Admin Panel</h1>
          <p className="text-sm text-neutral-600 text-center mb-6">Enter admin password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-neutral-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded hover:bg-neutral-800 disabled:bg-gray-400 transition-colors font-medium"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
