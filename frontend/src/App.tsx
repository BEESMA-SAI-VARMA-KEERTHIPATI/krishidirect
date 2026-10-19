import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { BuyerMarketplace } from './pages/BuyerMarketplace';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { OrdersPage } from './pages/OrdersPage';
import { PoolingPage } from './pages/PoolingPage';
import { AgentDashboard } from './pages/AgentDashboard';
import { TransporterDashboard } from './pages/TransporterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { FarmerLandingPage } from './pages/FarmerLandingPage';
import { BuyerLandingPage } from './pages/BuyerLandingPage';
import { AgentLandingPage } from './pages/AgentLandingPage';
import { TransporterLandingPage } from './pages/TransporterLandingPage';
import { AdminLandingPage } from './pages/AdminLandingPage';
import { AccessDenied } from './components/AccessDenied';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { CartDrawer } from './components/CartDrawer';
import { ProduceListingModal } from './components/ProduceListingModal';
import { ProfitCalculatorModal } from './components/ProfitCalculatorModal';
import { FairPriceModal } from './components/FairPriceModal';
import { AuthModal } from './components/AuthModal';
import { KrishiLogo } from './components/KrishiLogo';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { getRoleDashboardPath } from './types';

const AppContent: React.FC = () => {
  const {
    user,
    isLoadingAuth,
    currentPath,
    navigate,
    isVoiceOpen,
    setIsVoiceOpen,
  } = useAuth();

  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isFairPriceModalOpen, setIsFairPriceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [advisorProduce, setAdvisorProduce] = useState('Fresh Hybrid Red Tomatoes');
  const [advisorPrice, setAdvisorPrice] = useState(32.0);
  const [advisorGrade, setAdvisorGrade] = useState('Grade A');

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const openFairPriceAdvisor = (name: string, price: number, grade: string) => {
    setAdvisorProduce(name || 'Fresh Hybrid Red Tomatoes');
    setAdvisorPrice(price || 32.0);
    setAdvisorGrade(grade || 'Grade A');
    setIsFairPriceModalOpen(true);
  };

  const handleVoiceAction = (payload: any) => {
    if (payload.action === 'open_listing_modal') {
      setIsListingModalOpen(true);
    } else if (payload.action === 'open_profit_calculator') {
      setIsProfitModalOpen(true);
    } else if (payload.action === 'open_pricing') {
      setIsFairPriceModalOpen(true);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EC] text-[#153D2B]">
        <div className="flex flex-col items-center gap-3">
          <KrishiLogo size="lg" />
          <div className="flex items-center gap-2 text-xs font-bold text-stone-600 mt-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#286443]" />
            <span>Restoring secure session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Path normalization
  const cleanPath = currentPath.replace(/\/$/, '') || '/';

  // Role-based Router matching
  const renderCurrentRoute = () => {
    // 1. Farmer Dashboard Route → FarmerLandingPage
    if (cleanPath === '/farmer/dashboard') {
      if (user?.role === 'farmer' || user?.role === 'admin') {
        return (
          <FarmerLandingPage
            onOpenListingModal={() => setIsListingModalOpen(true)}
            onOpenProfitModal={() => setIsProfitModalOpen(true)}
            onOpenFairPriceModal={() => setIsFairPriceModalOpen(true)}
          />
        );
      }
      return <AccessDenied requiredRole="farmer" onOpenAuthModal={() => openAuth('login')} />;
    }

    // 2. Buyer Dashboard Route → BuyerLandingPage
    if (cleanPath === '/buyer/dashboard') {
      if (user?.role === 'buyer' || user?.role === 'admin') {
        return <BuyerLandingPage />;
      }
      return <AccessDenied requiredRole="buyer" onOpenAuthModal={() => openAuth('login')} />;
    }

    // 3. Village Agent Dashboard Route → AgentLandingPage
    if (cleanPath === '/agent/dashboard') {
      if (user?.role === 'agent' || user?.role === 'admin') {
        return <AgentLandingPage />;
      }
      return <AccessDenied requiredRole="agent" onOpenAuthModal={() => openAuth('login')} />;
    }

    // 4. Transporter Dashboard Route → TransporterLandingPage
    if (cleanPath === '/transporter/dashboard') {
      if (user?.role === 'transporter' || user?.role === 'admin') {
        return <TransporterLandingPage />;
      }
      return <AccessDenied requiredRole="transporter" onOpenAuthModal={() => openAuth('login')} />;
    }

    // 5. Admin Dashboard Route → AdminLandingPage
    if (cleanPath === '/admin/dashboard') {
      if (user?.role === 'admin') {
        return <AdminLandingPage />;
      }
      return <AccessDenied requiredRole="admin" onOpenAuthModal={() => openAuth('login')} />;
    }

    // 6. Marketplace Route
    if (cleanPath === '/marketplace') {
      // Farmers must not see buyer shopping interface
      if (user?.role === 'farmer') {
        return (
          <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-[#DCE8D7] rounded-3xl shadow-sm text-center space-y-4">
            <h2 className="font-editorial text-2xl font-bold text-[#153D2B]">
              Farmer Sell Terminal
            </h2>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              As a registered Farmer, your harvest listings are displayed on the public marketplace for buyers.
              To manage your inventory, review prices, or confirm buyer orders, please return to your Farmer Command Center.
            </p>
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="px-6 py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Go to Farmer Dashboard
            </button>
          </div>
        );
      }
      return <BuyerMarketplace isDashboardView={false} />;
    }

    // 7. Orders Page
    if (cleanPath === '/orders') {
      if (!user) {
        return <AccessDenied onOpenAuthModal={() => openAuth('login')} />;
      }
      return <OrdersPage />;
    }

    // 8. Pooling Page
    if (cleanPath === '/pooling') {
      return <PoolingPage />;
    }

    // 9. Root Landing Page (Default)
    return (
      <LandingPage
        onOpenListingModal={() => setIsListingModalOpen(true)}
        onOpenProfitModal={() => setIsProfitModalOpen(true)}
        onOpenFairPriceModal={() => setIsFairPriceModalOpen(true)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EC] text-[#202820]">
      {/* Main Navigation (Role-segregated, NO switch roles) */}
      <Navbar
        onOpenListingModal={() => setIsListingModalOpen(true)}
        onOpenProfitModal={() => setIsProfitModalOpen(true)}
        onOpenAuthModal={openAuth}
      />

      {/* Active Role Dashboard / Page Route */}
      <main className="flex-1">
        {renderCurrentRoute()}
      </main>

      {/* Persistent Global Modals */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExecuteAction={handleVoiceAction}
      />

      {/* Cart Drawer: only accessible to buyer role */}
      {user?.role === 'buyer' && <CartDrawer />}

      <ProduceListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onOpenFairPriceAdvisor={openFairPriceAdvisor}
      />

      <ProfitCalculatorModal
        isOpen={isProfitModalOpen}
        onClose={() => setIsProfitModalOpen(false)}
      />

      <FairPriceModal
        isOpen={isFairPriceModalOpen}
        onClose={() => setIsFairPriceModalOpen(false)}
        initialProduceName={advisorProduce}
        initialAskingPrice={advisorPrice}
        initialQualityGrade={advisorGrade}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Living Harvest Agricultural Footer */}
      <footer className="bg-[#153D2B] text-[#F7F5EC] border-t-4 border-[#286443] pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-left mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          <div className="space-y-3">
            <KrishiLogo size="md" />
            <p className="text-xs text-white/70 leading-relaxed font-light">
              KrishiDirect is a functional AI-powered agricultural marketplace connecting Indian
              smallholders directly with buyers, reducing intermediary loss, and cutting rural freight costs.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C7F36B] mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-light">
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => {
                  if (user?.role === 'farmer') navigate('/farmer/dashboard');
                  else navigate('/marketplace');
                }}
              >
                Direct Produce Marketplace
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setIsFairPriceModalOpen(true)}>
                AI Fair-Price Advisory Engine
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => navigate('/pooling')}>
                Smart Village Harvest Pooling
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setIsProfitModalOpen(true)}>
                Farmer Net Profit Calculator
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setIsVoiceOpen(true)}>
                Multilingual Krishi Voice Assistant
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C7F36B] mb-3">
              Role Workspaces
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-light">
              <li className="hover:text-white cursor-pointer" onClick={() => navigate('/farmer/dashboard')}>
                Farmer Command Center
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => navigate('/buyer/dashboard')}>
                Buyer Sourcing Terminal
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => navigate('/agent/dashboard')}>
                Village Agent Desk
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => navigate('/transporter/dashboard')}>
                Logistics Fleet Management
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                Platform Administration
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C7F36B]">
              Escrow & Security
            </h4>
            <div className="p-3 bg-[#286443] rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#C7F36B]">
                <ShieldCheck className="w-4 h-4" />
                <span>Delivery OTP Verification</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed font-light">
                Funds remain held in escrow until buyer confirms cargo inspection via unique 4-digit code.
              </p>
            </div>
            <span className="text-[10px] text-white/50 block font-mono">
              KrishiDirect Prototype • Verified Role Architecture
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <div>
            © 2026 KrishiDirect. Designed with Living Harvest identity for Indian smallholder farmers.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/orders')}>Trust Passports</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setIsVoiceOpen(true)}>Krishi Voice</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
