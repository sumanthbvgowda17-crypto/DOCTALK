import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { BrandLogo } from '../components/common/BrandLogo';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const { signInWithEmail, signUpWithEmail, signInDemo, isConfigured, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after authentication
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const validateForm = (): boolean => {
    setValidationError(null);
    clearAuthError();

    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return false;
    }

    if (!password) {
      setValidationError('Please enter your password.');
      return false;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return false;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setValidationError('Please enter your full name.');
        return false;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessNotice(null);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (isSignUp) {
        const result = await signUpWithEmail(email, password, fullName);
        if (result.success) {
          if (result.requiresEmailConfirmation) {
            setSuccessNotice('Account created! A confirmation link has been sent to your email. Please verify to sign in.');
            setIsSignUp(false);
          } else {
            // Immediate sign-in session
            navigate(from, { replace: true });
          }
        }
      } else {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          navigate(from, { replace: true });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentError = validationError || authError;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-slate-50 via-cyan-50/20 to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* DocTalk Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo variant="full" size="xl" className="mb-2" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Telemedicine That Never Drops • Secure Portal
          </p>
        </div>

        {/* Configuration Notice if VITE_SUPABASE_URL is missing */}
        {!isConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs sm:text-sm leading-relaxed backdrop-blur-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100">
                  Supabase Project URL Required
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Your publishable key is saved. Please add your project URL to <code className="px-1.5 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/40 font-mono text-[11px]">.env</code>:
                </p>
                <code className="block mt-2 p-2 rounded bg-white/70 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-800 font-mono text-[11px] select-all break-all text-slate-800 dark:text-slate-200">
                  VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/5 dark:shadow-black/40">
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                clearAuthError();
                setValidationError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                !isSignUp
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                clearAuthError();
                setValidationError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                isSignUp
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {currentError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex flex-col gap-1.5 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{currentError}</span>
              </div>
              {currentError.toLowerCase().includes('rate limit') && (
                <div className="pl-6 text-[11px] text-rose-600 dark:text-rose-400 space-y-1">
                  <p>
                    Supabase's default email service has a strict rate limit (3–4 verification emails/hour).
                  </p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    💡 <strong>Quick Fix:</strong> In your Supabase Dashboard → <strong>Authentication</strong> → <strong>Providers</strong> → <strong>Email</strong>, turn <strong>OFF</strong> <em>"Confirm email"</em> and click <strong>Save</strong>. You will be able to sign up immediately without email rate limits!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field on Sign Up */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    disabled={submitting}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={submitting}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  disabled={submitting}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  At least 6 characters required.
                </p>
              )}
            </div>

            {/* Confirm Password Field on Sign Up */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={submitting}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {/* Role Transparency Note */}
            {isSignUp && (
              <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-900/50 text-[11px] text-cyan-800 dark:text-cyan-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-600 mt-0.5" />
                <span>
                  <strong>Patient Account:</strong> All public accounts receive patient privileges. Doctor clinical access requires institutional accreditation.
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isSignUp ? 'Creating Patient Account...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Complete Registration' : 'Sign In to DocTalk'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Mode Access */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Or Test Instantly
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    signInDemo('patient');
                    navigate(from, { replace: true });
                  }}
                  className="py-2.5 px-3 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/60 dark:bg-cyan-950/20 hover:bg-cyan-100/60 dark:hover:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Patient Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    signInDemo('doctor');
                    navigate('/doctor', { replace: true });
                  }}
                  className="py-2.5 px-3 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/60 dark:bg-teal-950/20 hover:bg-teal-100/60 dark:hover:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Doctor Workspace</span>
                </button>
              </div>
            </div>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted with Supabase Auth & Row Level Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
