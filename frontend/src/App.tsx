import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { BuyerMarketplace } from './pages/BuyerMarketplace';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { OrdersPage } from './pages/OrdersPage';
import { PoolingPage } from './pages/PoolingPage';
import { AgentDashboard } from './pages/AgentDashboard';
import { TransporterDashboard } from './pages/TransporterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { CartDrawer } from './components/CartDrawer';
import { ProduceListingModal } from './components/ProduceListingModal';
import { ProfitCalculatorModal } from './components/ProfitCalculatorModal';
import { FairPriceModal } from './components/FairPriceModal';
import { AuthModal } from './components/AuthModal';
import { KrishiLogo } from './components/KrishiLogo';
import { Heart, ShieldCheck, Leaf, Globe } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isVoiceOpen, setIsVoiceOpen } = useAuth();

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EC] text-[#202820]">
      {/* 1-Click Role Switcher Demo Bar */}
      <DemoBanner />

      {/* Main Navigation */}
      <Navbar
        onOpenListingModal={() => setIsListingModalOpen(true)}
        onOpenProfitModal={() => setIsProfitModalOpen(true)}
        onOpenAuthModal={openAuth}
      />

      {/* Active Tab Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            onOpenListingModal={() => setIsListingModalOpen(true)}
            onOpenProfitModal={() => setIsProfitModalOpen(true)}
            onOpenFairPriceModal={() => setIsFairPriceModalOpen(true)}
          />
        )}
        {activeTab === 'marketplace' && <BuyerMarketplace />}
        {activeTab === 'farmer-dashboard' && (
          <FarmerDashboard
            onOpenListingModal={() => setIsListingModalOpen(true)}
            onOpenProfitModal={() => setIsProfitModalOpen(true)}
            onOpenFairPriceModal={() => setIsFairPriceModalOpen(true)}
          />
        )}
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'pooling' && <PoolingPage />}
        {activeTab === 'agent-dashboard' && <AgentDashboard />}
        {activeTab === 'transporter-dashboard' && <TransporterDashboard />}
        {activeTab === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Persistent Global Modals */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExecuteAction={handleVoiceAction}
      />

      <CartDrawer />

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
              <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('marketplace')}>
                Direct Produce Marketplace
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setIsFairPriceModalOpen(true)}>
                AI Fair-Price Advisory Engine
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('pooling')}>
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
              <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('farmer-dashboard')}>
                Farmer Command Center
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('marketplace')}>
                Buyer Sourcing Terminal
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('agent-dashboard')}>
                Village Agent Desk
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('transporter-dashboard')}>
                Logistics Fleet Management
              </li>
              <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('admin-dashboard')}>
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
              KrishiDirect Prototype v1.0.0 • SQLite/FastAPI/React
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <div>
            © 2026 KrishiDirect. Designed with Living Harvest identity for Indian smallholder farmers.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('home')}>Home</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('orders')}>Trust Passports</span>
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
