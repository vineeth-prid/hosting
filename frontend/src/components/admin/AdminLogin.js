import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      localStorage.setItem('admin_token', res.data.token);
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-light flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-semibold text-deep-teal">Hosting</h1>
          <p className="font-body text-sm text-body-text mt-2">Admin Panel</p>
        </div>
        <form
          data-testid="admin-login-form"
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-border-sand p-8 shadow-sm space-y-5"
        >
          <h2 className="font-heading text-2xl font-medium text-heading text-center">Sign In</h2>
          <div>
            <label className="font-body text-sm text-body-text block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-text/40" />
              <input
                data-testid="admin-email-input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@hosting.com"
                className="w-full bg-sand-light border border-border-sand rounded-xl pl-10 pr-4 py-3 font-body text-sm text-heading placeholder:text-body-text/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
              />
            </div>
          </div>
          <div>
            <label className="font-body text-sm text-body-text block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-text/40" />
              <input
                data-testid="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                className="w-full bg-sand-light border border-border-sand rounded-xl pl-10 pr-4 py-3 font-body text-sm text-heading placeholder:text-body-text/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
              />
            </div>
          </div>
          {error && (
            <div data-testid="admin-login-error" className="flex items-center gap-2 text-red-500 font-body text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button
            data-testid="admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-deep-teal text-white font-body py-3 rounded-full hover:bg-teal-hover transition-all duration-300 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
