import React from 'react';
import { useAuth } from '../context/AuthContext';
import { KrishiLogo } from './KrishiLogo';
import {
  Mic,
  ShoppingCart,
  Globe,
  LogOut,
  LayoutDashboard,
  Store,
  Layers,
  FileCheck2,
  Shield,
  Truck,
  Calculator,
} from 'lucide-react';
import { Locale } from '../services/i18n';

interface NavbarProps {
  onOpenListingModal?: () => void;
  onOpenProfitModal?: () => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenListingModal, onOpenProfitModal, onOpenAuthModal }) => {
  const {
    user,
    locale,
    setLocale,
    t,
    logout,
    activeTab,
    setActiveTab,
    cart,
    setIsCartOpen,
    setIsVoiceOpen,
  } = useAuth();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { id: 'home', label: 'Home', icon: Store, show: true },
    { id: 'marketplace', label: t.navMarketplace, icon: Store, show: true },
    {
      id: 'farmer-dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard,
      show: user?.role === 'farmer' || user?.role === 'admin',
    },
    {
      id: 'orders',
      label: t.navOrders,
      icon: FileCheck2,
      show: !!user,
    },
    {
      id: 'pooling',
      label: t.navPooling,
      icon: Layers,
      show: true,
    },
    {
      id: 'agent-dashboard',
      label: 'Agent Desk',
      icon: LayoutDashboard,
      show: user?.role === 'agent' || user?.role === 'admin',
    },
    {
      id: 'transporter-dashboard',
      label: 'Logistics Fleet',
      icon: Truck,
      show: user?.role === 'transporter' || user?.role === 'admin',
    },
    {
      id: 'admin-dashboard',
      label: t.navAdmin,
      icon: Shield,
      show: user?.role === 'admin',
    },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#F7F5EC]/95 backdrop-blur-md border-b border-[#DCE8D7] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
            <KrishiLogo size="md" />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#153D2B] text-[#C7F36B] shadow-sm'
                        : 'text-[#202820]/80 hover:bg-[#DCE8D7]/60 hover:text-[#153D2B]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Krishi Voice Prominent Trigger */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="relative group flex items-center gap-2 bg-[#286443] hover:bg-[#153D2B] text-[#C7F36B] px-3.5 py-2 rounded-full font-medium text-xs shadow-md transition-all transform hover:scale-105"
              title="Launch Krishi Voice Assistant"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C7F36B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C7F36B]"></span>
              </span>
              <Mic className="w-4 h-4 text-[#C7F36B]" />
              <span className="hidden sm:inline font-semibold">{t.voiceAssistant}</span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center bg-[#DCE8D7]/60 rounded-lg p-1 text-xs font-semibold text-[#153D2B]">
              <Globe className="w-3.5 h-3.5 mx-1.5 text-[#286443]" />
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  locale === 'en' ? 'bg-[#153D2B] text-[#F7F5EC]' : 'hover:bg-black/5'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('hi')}
                className={`px-2 py-1 rounded transition-colors ${
                  locale === 'hi' ? 'bg-[#153D2B] text-[#F7F5EC]' : 'hover:bg-black/5'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLocale('te')}
                className={`px-2 py-1 rounded transition-colors ${
                  locale === 'te' ? 'bg-[#153D2B] text-[#F7F5EC]' : 'hover:bg-black/5'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-lg text-[#153D2B] bg-[#DCE8D7]/60 hover:bg-[#DCE8D7] transition-colors"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#153D2B] text-[#C7F36B] text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#F7F5EC] animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile / Login / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#DCE8D7]">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#153D2B]">{user.full_name}</span>
                  <span className="text-[10px] capitalize text-[#286443] font-semibold">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out / Switch Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                className="px-3 py-1.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 bg-[#DCE8D7]/40 border-t border-[#DCE8D7] gap-2">
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                activeTab === item.id
                  ? 'bg-[#153D2B] text-[#C7F36B]'
                  : 'bg-white/80 text-[#202820]'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
      </div>
    </nav>
  );
};
