import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, ArrowRight, Home, LogOut } from 'lucide-react';
import { getRoleDashboardPath } from '../types';

interface AccessDeniedProps {
  requiredRole?: string;
  onOpenAuthModal?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole,
  onOpenAuthModal,
}) => {
  const { user, navigate, logout } = useAuth();

  const roleNameMap: Record<string, string> = {
    farmer: 'Farmer',
    buyer: 'Buyer',
    agent: 'Village Agent',
    transporter: 'Transporter',
    admin: 'Platform Administrator',
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-[#DCE8D7] rounded-3xl shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-editorial text-2xl font-bold text-[#153D2B]">
            Authentication Required
          </h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            This dashboard is protected by KrishiDirect role-based security. Please sign in with your authorized credentials to access this workspace.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuthModal && onOpenAuthModal()}
            className="px-6 py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span>Sign In Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-[#F7F5EC] hover:bg-[#DCE8D7] text-[#153D2B] rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    );
  }

  const userRoleDisplay = roleNameMap[user.role] || user.role;
  const requiredRoleDisplay = requiredRole ? (roleNameMap[requiredRole] || requiredRole) : 'a different role';
  const myDashboard = getRoleDashboardPath(user.role);

  return (
    <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-red-200 rounded-3xl shadow-sm text-center space-y-5">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
          403 Forbidden • Access Denied
        </span>
        <h2 className="font-editorial text-2xl font-bold text-[#153D2B] mt-2">
          Unauthorized Workspace Access
        </h2>
        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
          You are authenticated as <strong>{user.full_name}</strong> (<span className="capitalize font-semibold text-[#153D2B]">{userRoleDisplay}</span>).
          This interface is strictly reserved for <strong>{requiredRoleDisplay}</strong> accounts.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => navigate(myDashboard)}
          className="px-6 py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <span>Go to My {userRoleDisplay} Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={logout}
          className="px-4 py-2.5 bg-[#F7F5EC] hover:bg-red-50 hover:text-red-700 text-stone-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
