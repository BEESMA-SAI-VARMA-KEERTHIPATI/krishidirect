import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
  const { login, loginAsDemo, demoAccounts } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'farmer' | 'buyer' | 'agent' | 'transporter'>('farmer');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Warangal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('Logged in successfully!');
        setTimeout(onClose, 600);
      } else {
        const res = await api.register({
          full_name: fullName,
          email,
          password,
          role,
          phone: phone || undefined,
          village: village || undefined,
          district: district || undefined,
          state: 'Telangana',
        });
        localStorage.setItem('krishi_token', res.access_token);
        setSuccessMsg('Account registered successfully! Welcome to KrishiDirect.');
        setTimeout(onClose, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-left">
      <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#153D2B] text-white p-6 flex items-center justify-between">
          <KrishiLogo size="sm" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-[#DCE8D7] bg-white">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'text-[#153D2B] border-b-2 border-[#153D2B] bg-[#F7F5EC]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In to Existing Account
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'register'
                ? 'text-[#153D2B] border-b-2 border-[#153D2B] bg-[#F7F5EC]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Register New Account
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block font-bold text-[#153D2B] mb-1">Select Your Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all ${
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
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all ${
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
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all ${
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
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all ${
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
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl font-medium focus:ring-1 focus:ring-[#286443]"
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
                        className="w-full pl-8 pr-2.5 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl"
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
                        className="w-full pl-8 pr-2.5 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl font-medium focus:ring-1 focus:ring-[#286443]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#153D2B] mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl font-medium focus:ring-1 focus:ring-[#286443]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create KrishiDirect Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-[#DCE8D7]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Or 1-Click Sign In as Demo User:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => {
                    loginAsDemo(acc);
                    onClose();
                  }}
                  className="p-2 bg-[#F7F5EC] hover:bg-[#DCE8D7] border border-[#DCE8D7] rounded-lg text-left text-[11px] transition-colors"
                >
                  <strong className="block text-[#153D2B] capitalize">{acc.role}</strong>
                  <span className="text-stone-500 text-[10px] truncate block">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
