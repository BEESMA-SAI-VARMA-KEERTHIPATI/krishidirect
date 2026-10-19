import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-[#153D2B] text-[#F7F5EC] text-xs py-1.5 px-4 border-b border-[#286443]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C7F36B]" />
          <span className="font-semibold text-[#C7F36B] tracking-wide uppercase text-[10px]">
            KrishiDirect Role Security Active
          </span>
          <span className="text-white/70">|</span>
          <span className="text-white/90">
            Authenticated User: <strong className="text-white">{user.full_name}</strong> (
            <span className="capitalize text-[#E7B85C] font-semibold">{user.role}</span>)
          </span>
        </div>
      </div>
    </div>
  );
};
