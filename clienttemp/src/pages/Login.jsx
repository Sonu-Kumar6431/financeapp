import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IndianRupee, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary-600 text-white p-2 rounded-xl">
            <IndianRupee size={22} />
          </div>
          <span className="text-2xl font-bold text-gray-900">FinTrack</span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-1">Sign in to your account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">Create one</Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} className="input-field pr-10"
                placeholder="••••••••"
                value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Demo account hint */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Demo: demo@fintrack.com / password123
        </p>
      </div>
    </div>
  );
}
