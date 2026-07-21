import { useState } from 'react';
import { useNavigate, Link } from 'react-router';

const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api'
  : 'https://api.k-europe.com/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to request password reset');
      }

      const data = await response.json();
      setToken(data.token);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Reset Token Generated
            </h2>
            <p className="mt-4 text-center text-sm text-gray-600">
              Copy this token and use it to reset your password
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-8">
            <p className="text-sm font-mono break-all text-gray-900">{token}</p>
            <button
              onClick={() => navigator.clipboard.writeText(token)}
              className="mt-3 w-full text-sm bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Copy Token
            </button>
          </div>

          <button
            onClick={() => navigate('/reset-password')}
            className="w-full rounded-md bg-black py-2 px-4 text-white font-medium hover:bg-gray-800"
          >
            Go to Reset Password
          </button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-black hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600">
            Enter your email and we'll generate a reset token
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-2 px-4 text-white font-medium hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Sending...' : 'Send Reset Token'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-black hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
