import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { username, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('carboniq_token', data.token);
        onAuthSuccess(data.token, data.user);
      } else {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMsg('');
          setPassword('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pulse-slow pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
          >
            <span className="text-3xl">🌱</span>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">CarbonIQ AI</h1>
          <p className="text-gray-400 mt-2 text-sm">Your Digital Carbon Twin for a Sustainable Future</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div role="tablist" className="flex border-b border-white/10 mb-8 pb-1">
            <button
              role="tab"
              aria-selected={isLogin}
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 pb-3 text-center font-semibold text-lg transition-colors relative ${
                isLogin ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
              {isLogin && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
            <button
              role="tab"
              aria-selected={!isLogin}
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 pb-3 text-center font-semibold text-lg transition-colors relative ${
                !isLogin ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
              {!isLogin && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {error && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                  <ShieldAlert size={18} />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
                  <CheckCircle size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label htmlFor="auth-username" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      id="auth-username"
                      type="text"
                      required
                      placeholder="alex_green"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-label={isLogin ? 'Sign In' : 'Create Account'}
                className="w-full cursor-pointer py-3.5 bg-gradient-to-r from-primary to-secondary text-background font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 text-sm mt-8 shadow-lg shadow-primary/10"
              >
                <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
