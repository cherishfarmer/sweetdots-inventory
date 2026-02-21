'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
            style={{ backgroundColor: '#f97316' }}>
            <span className="text-5xl">🍩</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ 
            fontFamily: 'Georgia, serif',
            color: '#9a3412'
          }}>
            Sweet Dots
          </h1>
          <p className="text-lg" style={{ color: '#c2410c' }}>
            Inventory Management
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none text-lg"
                style={{
                  borderColor: '#fed7aa',
                  backgroundColor: '#fff7ed'
                }}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none text-lg"
                style={{
                  borderColor: '#fed7aa',
                  backgroundColor: '#fff7ed'
                }}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg text-white font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? '#9a3412' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#9a3412' }}>
            <p>Demo credentials:</p>
            <p className="font-mono mt-1">admin@sweetdots.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
