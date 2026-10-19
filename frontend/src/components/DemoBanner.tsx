import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, Sprout, ShoppingBag, Truck, Building2 } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user, demoAccounts, loginAsDemo, t } = useAuth();

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return <Sprout className="w-3.5 h-3.5 text-[#286443]" />;
      case 'buyer':
        return <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />;
      case 'agent':
        return <Building2 className="w-3.5 h-3.5 text-amber-600" />;
      case 'transporter':
        return <Truck className="w-3.5 h-3.5 text-purple-600" />;
      case 'admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-red-600" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return 'bg-[#C7F36B]/40 text-[#153D2B] border-[#286443]/30';
      case 'buyer':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'agent':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'transporter':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'admin':
        return 'bg-red-100 text-red-900 border-red-300';
    }
  };

  return (
    <div className="bg-[#153D2B] text-[#F7F5EC] text-xs py-2 px-4 border-b border-[#286443]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C7F36B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C7F36B]"></span>
          </span>
          <span className="font-semibold text-[#C7F36B] tracking-wide uppercase text-[10px]">
            Demo Sandbox
          </span>
          <span className="hidden md:inline text-white/70">|</span>
          <span className="hidden md:inline text-white/90">
            Current Session: <strong className="text-white">{user?.full_name || 'Guest'}</strong> (
            <span className="capitalize text-[#E7B85C] font-semibold">{user?.role || 'None'}</span>)
          </span>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-white/70 mr-1 hidden sm:inline">Switch Role:</span>
          {demoAccounts.map((acc) => {
            const isCurrent = user?.email === acc.email;
            return (
              <button
                key={acc.role}
                onClick={() => loginAsDemo(acc)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isCurrent
                    ? `${getRoleBadgeColor(acc.role as UserRole)} border font-bold shadow-sm ring-1 ring-white/30`
                    : 'bg-[#286443]/60 hover:bg-[#286443] text-white/90 border border-transparent'
                }`}
                title={`Switch to ${acc.name} (${acc.email})`}
              >
                {getRoleIcon(acc.role as UserRole)}
                <span className="capitalize">{acc.role}</span>
                {isCurrent && <UserCheck className="w-3 h-3 ml-0.5 text-current" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
