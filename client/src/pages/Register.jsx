import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'INR' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(form);
    if (res.success) {
      toast.success('Account created!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary-600 text-white p-2 rounded-xl">
            <IndianRupee size={22} />
          </div>
          <span className="text-2xl font-bold text-gray-900">FinTrack</span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input-field" placeholder="Rahul Sharma"
              value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input-field" placeholder="Min 6 characters"
              value={form.password} onChange={(e) => set('password', e.target.value)}
              minLength={6} required />
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input-field" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="GBP">£ British Pound (GBP)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
