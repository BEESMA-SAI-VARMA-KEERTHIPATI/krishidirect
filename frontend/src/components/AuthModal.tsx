import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Sprout,
  ShoppingBag,
  Building2,
  Truck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { KrishiLogo } from './KrishiLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, demoAccounts } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'farmer' | 'buyer' | 'agent' | 'transporter'>('farmer');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Warangal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  if (!isOpen) return null;

  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleFillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Client-side validations
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }
    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const user = await login(cleanEmail, password);
        setSuccessMsg(`Welcome back, ${user.full_name}! Redirecting to your dashboard...`);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        const user = await register({
          full_name: fullName.trim(),
          email: cleanEmail,
          password,
          role,
          phone: phone.trim() || undefined,
          village: village.trim() || undefined,
          district: district.trim() || undefined,
          state: 'Telangana',
        });
        setSuccessMsg(`Account created successfully for ${user.full_name}! Redirecting to your dashboard...`);
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      let message = err.message || 'Authentication failed. Please check your credentials.';
      if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Load failed')) {
        message = 'Unable to connect to the authentication server. Please verify the backend is running.';
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-left">
      <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#153D2B] text-white p-5 flex items-center justify-between">
          <KrishiLogo size="sm" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-[#DCE8D7] bg-white">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'text-[#153D2B] border-b-2 border-[#153D2B] bg-[#F7F5EC]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'register'
                ? 'text-[#153D2B] border-b-2 border-[#153D2B] bg-[#F7F5EC]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block font-bold text-[#153D2B] mb-1">Select Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs transition-all ${
                        role === 'farmer'
                          ? 'bg-[#153D2B] text-[#C7F36B] border-[#153D2B]'
                          : 'bg-[#F7F5EC] text-[#202820] border-[#DCE8D7]'
                      }`}
                    >
                      <Sprout className="w-4 h-4 text-[#C7F36B]" />
                      <span>Farmer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs transition-all ${
                        role === 'buyer'
                          ? 'bg-[#153D2B] text-[#C7F36B] border-[#153D2B]'
                          : 'bg-[#F7F5EC] text-[#202820] border-[#DCE8D7]'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      <span>Buyer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('agent')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs transition-all ${
                        role === 'agent'
                          ? 'bg-[#153D2B] text-[#C7F36B] border-[#153D2B]'
                          : 'bg-[#F7F5EC] text-[#202820] border-[#DCE8D7]'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Village Agent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('transporter')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs transition-all ${
                        role === 'transporter'
                          ? 'bg-[#153D2B] text-[#C7F36B] border-[#153D2B]'
                          : 'bg-[#F7F5EC] text-[#202820] border-[#DCE8D7]'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-purple-400" />
                      <span>Transporter</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#153D2B] mb-1">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl font-medium focus:ring-1 focus:ring-[#286443] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#153D2B] mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98..."
                        className="w-full pl-8 pr-2.5 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#153D2B] mb-1">Village / Town</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder="e.g. Jangaon"
                        className="w-full pl-8 pr-2.5 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-[#153D2B] mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@krishidirect.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl font-medium focus:ring-1 focus:ring-[#286443] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#153D2B] mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl font-medium focus:ring-1 focus:ring-[#286443] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create KrishiDirect Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Safe Development Demo Seed Credentials Reference */}
          <div className="pt-3 border-t border-[#DCE8D7]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-[#286443]" />
                <span>Documented Development Seed Accounts</span>
              </span>
              <button
                type="button"
                onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                className="text-[10px] text-[#286443] font-bold hover:underline"
              >
                {showDemoCredentials ? 'Hide' : 'Show'}
              </button>
            </div>

            {showDemoCredentials && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-stone-500 leading-tight">
                  Click <strong>Autofill</strong> to test authentic authentication through the backend:
                </p>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
                  {(demoAccounts.length > 0
                    ? demoAccounts
                    : [
                        { role: 'farmer', email: 'farmer@demo.com', password: 'demo1234', name: 'Demo Farmer' },
                        { role: 'buyer', email: 'buyer@demo.com', password: 'demo1234', name: 'Demo Buyer' },
                        { role: 'agent', email: 'agent@demo.com', password: 'demo1234', name: 'Demo Village Agent' },
                        { role: 'transporter', email: 'transporter@demo.com', password: 'demo1234', name: 'Demo Transporter' },
                        { role: 'admin', email: 'admin@demo.com', password: 'demo1234', name: 'Demo Admin' },
                      ]
                  ).map((acc) => (
                    <div
                      key={acc.role}
                      className="p-2 bg-[#F7F5EC] border border-[#DCE8D7] rounded-lg flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#153D2B] capitalize">{acc.role}</span>
                          <span className="text-[10px] text-stone-500 font-mono">({acc.email})</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block">{acc.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          handleFillCredentials(acc.email, acc.password);
                        }}
                        className="px-2 py-1 bg-white hover:bg-[#DCE8D7] text-[#153D2B] border border-[#DCE8D7] rounded text-[10px] font-bold transition-colors"
                      >
                        Autofill
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
