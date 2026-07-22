import { useState } from 'react';
import { useNavigate } from 'react-router';
import { STORAGE_KEYS } from '../config/constants';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get admin password from environment variable
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple password check
    if (password === ADMIN_PASSWORD) {
      // Store admin session in localStorage
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Incorrect password');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">K-Europe Admin</h1>
          <p className="text-gray-600">Manage your products</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Contact Frank for the password
        </p>
      </div>
    </div>
  );
}
