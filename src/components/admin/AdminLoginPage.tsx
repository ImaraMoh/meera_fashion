import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import LogoImage from '../../assets/logo.png';
import { BrandSettings } from '../../types';

interface AdminLoginPageProps {
  settings: BrandSettings;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  settings,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const demoEmail = 'admin@meerafashion.com';
      const demoPassword = 'admin123';

      if (email.trim().toLowerCase() === demoEmail && password === demoPassword) {
        sessionStorage.setItem('meera_admin_authenticated', 'true');
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Invalid administrator credentials. Please try again.');
      }
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-[#FFF9FA] to-rose-100/40 text-[#241B20] flex items-center justify-center p-4 overflow-hidden relative">

      {/* Ambient Decorative Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-200/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Single-Column Centered Atelier Card (Fixed, No Scrolling) */}
      <div className="relative w-full max-w-[440px] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_90px_rgba(158,49,90,0.12)] border border-rose-100/80 p-6 sm:p-8 flex flex-col justify-center">

        {/* Top Header / Logo Section */}
        <div className="text-center flex flex-col items-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#9E315A] text-[9px] uppercase tracking-[0.2em] font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3 h-3" />
            Atelier Workspace
          </div>

          <div className="mb-2 flex flex-col items-center">
            {/* Translucent Card to Make Pink Logo Fully Visible */}
            <div className="relative w-14 h-14 rounded-2xl bg-white shadow-md border border-rose-100 flex items-center justify-center overflow-hidden p-1 mb-1.5">
              <img
                src={settings.customLogoUrl || LogoImage}
                alt={settings.brandName || "Meera Fashion"}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-serif text-base font-bold tracking-wide text-[#241B20]">
              {settings.brandName || "Meera's Fashion"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#241B20] tracking-tight">
            Administrator Access
          </h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50/90 border border-red-200/60 text-red-700 text-xs shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[10px] uppercase tracking-wider font-bold text-[#5A4550] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-300 group-focus-within:text-[#9E315A] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@meerafashion.com"
                autoComplete="email"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-rose-200/80 bg-[#FFFDFD] text-xs sm:text-sm text-[#241B20] outline-none transition-all duration-200 hover:border-rose-300 focus:border-[#9E315A] focus:bg-white focus:ring-4 focus:ring-rose-100/60 placeholder:text-rose-300/80 shadow-2xs"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[10px] uppercase tracking-wider font-bold text-[#5A4550] mb-1.5"
            >
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-300 group-focus-within:text-[#9E315A] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-rose-200/80 bg-[#FFFDFD] text-xs sm:text-sm text-[#241B20] outline-none transition-all duration-200 hover:border-rose-300 focus:border-[#9E315A] focus:bg-white focus:ring-4 focus:ring-rose-100/60 placeholder:text-rose-300/80 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-rose-300 hover:text-[#9E315A] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-[#9E315A] to-[#C94F7C] hover:from-[#88284C] hover:to-[#B63E69] text-white text-xs sm:text-sm font-semibold shadow-[0_8px_20px_rgba(158,49,90,0.25)] hover:shadow-[0_12px_25px_rgba(158,49,90,0.35)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Entering Portal...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note & Navigation */}
        <div className="mt-5 pt-4 border-t border-rose-100/80 flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C94F7C]" />
            <span className="text-[10px] font-medium tracking-wide">Secure Atelier Management Portal</span>
          </div>

          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-[11px] font-semibold text-[#7A6470] hover:text-[#9E315A] transition-colors cursor-pointer"
          >
            ← Back to Storefront
          </button>
        </div>

      </div>
    </div>
  );
};