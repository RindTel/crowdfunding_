import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Eye, EyeOff, Mail, Lock, User, ChevronRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';

// ── Login ─────────────────────────────────────
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0f1117] to-indigo-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 border-r border-white/5">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Flame size={17} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FundForge</span>
        </Link>

        <div>
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={10} /> Trusted by 1,800+ creators
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Fund the ideas<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">that matter most.</span>
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            FundForge connects visionary creators with passionate supporters to bring ambitious projects to life.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['$2.4M+', 'Total raised'], ['3,200+', 'Donations'], ['156', 'Campaigns']].map(([val, label]) => (
              <div key={label} className="bg-white/10 border border-white/15 rounded-2xl p-4">
                <p className="text-xl font-bold text-white">{val}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs">© 2025 FundForge, Inc. · Privacy · Terms</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Flame size={15} className="text-white" />
            </div>
            <span className="text-white font-bold text-base">FundForge</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.email ? 'border-red-500' : 'border-white/20'}`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-200">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.password ? 'border-red-500' : 'border-white/20'}`}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-60 mt-2"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Sign in
              {!isLoading && <ChevronRight size={15} />}
            </button>
          </form>

          <p className="text-center text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Create one</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 border border-white/5 rounded-2xl p-4/3">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {[
                { role: 'Admin', email: 'admin@fundforge.io' },
                { role: 'Creator', email: 'creator@fundforge.io' },
                { role: 'Donor', email: 'donor@fundforge.io' },
              ].map(({ role, email: e }) => (
                <button
                  key={role}
                  onClick={() => { setEmail(e); setPassword('Admin123!'); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left border border-white/10"
                >
                  <span className="text-xs font-semibold text-slate-200">{role}</span>
                  <span className="text-xs font-mono">{e}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────
type Role = 'CREATOR' | 'DONOR';

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'DONOR' as Role });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = 'Required';
    if (!form.lastName) e.lastName = 'Required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Needs an uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Needs a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await registerUser(form);
      toast.success('Account created! Welcome to FundForge.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0f1117] to-indigo-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Flame size={15} className="text-white" />
            </div>
            <span className="text-white font-bold text-base">FundForge</span>
          </Link>
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1">
            ← Back to home
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
        <p className="text-slate-500 text-sm mb-8">Join thousands of creators and supporters</p>

        {/* Role selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {([['CREATOR', 'I want to create campaigns', '🚀'], ['DONOR', 'I want to support projects', '❤️']] as [Role, string, string][]).map(([r, desc, emoji]) => (
            <button
              key={r}
              type="button"
              onClick={() => set('role', r)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all ${form.role === r ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20'}`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-semibold text-white">{r === 'CREATOR' ? 'Creator' : 'Donor'}</span>
              <span className="text-[10px] leading-tight">{desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            {[['firstName', 'First name'], ['lastName', 'Last name']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form[k as keyof typeof form]}
                    onChange={e => set(k, e.target.value)}
                    placeholder={k === 'firstName' ? 'Jane' : 'Doe'}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors[k] ? 'border-red-500' : 'border-white/20'}`}
                  />
                </div>
                {errors[k] && <p className="mt-1 text-xs text-red-400">{errors[k]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.email ? 'border-red-500' : 'border-white/20'}`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.password ? 'border-red-500' : 'border-white/20'}`}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-slate-300">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-60 mt-2"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Create account
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
