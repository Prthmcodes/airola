import React, { useState } from 'react';
import { Page, User } from '../types';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, User as UserIcon, Phone, MailCheck } from 'lucide-react';
import { db } from '../db';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (password.length < 8) {
          setError('Please choose a password of at least 8 characters.');
          return;
        }
        const { needsConfirmation: confirm } = await db.signUp(name, email, phone, password);
        if (confirm) {
          setNeedsConfirmation(true);
        } else {
          const user = await db.getSession();
          if (user) onLogin(user);
        }
      } else {
        const user = await db.signIn(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      const message = err?.message || 'An error occurred during authentication.';
      setError(
        message.includes('Invalid login credentials')
          ? 'Invalid email or password.'
          : message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/50">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-6 bg-[rgb(235,247,244)] text-[rgb(61,141,122)]">
            <MailCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Check Your Inbox</h2>
          <p className="text-slate-500 font-medium mb-8">
            We've sent a confirmation link to <span className="font-bold text-slate-900">{email}</span>.
            Click it to activate your account, then log in here.
          </p>
          <button
            onClick={() => { setNeedsConfirmation(false); setIsSignUp(false); }}
            className="w-full py-4 bg-[rgb(61,141,122)] text-white rounded-2xl font-bold hover:bg-[rgb(45,110,95)] transition-all"
          >
            Back to Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-6 bg-[rgb(235,247,244)] text-[rgb(61,141,122)]">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {isSignUp ? 'Join Airola' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Start automating your turnover management' : 'Log in to manage your portfolio'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 7700 900000"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium tracking-widest"
                  required
                  minLength={isSignUp ? 8 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[rgb(61,141,122)] transition-colors focus:outline-none p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center bg-[rgb(61,141,122)] text-white hover:bg-[rgb(45,110,95)] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Please wait…' : isSignUp ? 'Create Account' : 'Log In'}
              {!isSubmitting && <ArrowRight className="ml-3 w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Already a Host?' : 'New to Airola?'}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="ml-2 font-black text-[rgb(61,141,122)] hover:text-[rgb(45,110,95)] uppercase tracking-widest text-xs"
              >
                {isSignUp ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center space-x-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted authentication &amp; UK-hosted data</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
