import React from 'react';
import { Leaf, MapPin, BarChart3, ShieldCheck, QrCode, PlusCircle, User, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'analytics' | 'admin';
  setActiveTab: (tab: 'map' | 'analytics' | 'admin') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenSubmitModal: () => void;
  onOpenQRScanner: () => void;
  onOpenAuthModal: () => void;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenSubmitModal,
  onOpenQRScanner,
  onOpenAuthModal,
  userEmail,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-40 bg-campus-bg/90 backdrop-blur-md border-b border-campus-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-flora-600 to-flora-400 p-2 shadow-glow-emerald flex items-center justify-center text-slate-950">
              <Leaf className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">Campus<span className="text-flora-400">Flora</span></span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-flora-500/20 text-flora-300 border border-flora-500/30">
                  AI Biodiversity
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Educational Campus Plant Mapping</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-campus-card/80 p-1.5 rounded-xl border border-campus-border">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-flora-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Campus Map</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-flora-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin & RLS</span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Scan QR Code Button */}
            <button
              onClick={onOpenQRScanner}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center space-x-1.5 text-xs font-semibold"
              title="Scan physical plant QR tag"
            >
              <QrCode className="w-4 h-4 text-flora-400" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Add New Plant Button */}
            <button
              onClick={onOpenSubmitModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-flora-500 to-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-glow-emerald hover:opacity-95 transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Identify & Map</span>
            </button>

            {/* RLS Demo Role Switcher Pill */}
            <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs">
              <span className="px-2 text-[10px] text-slate-400 font-semibold uppercase">RLS Role:</span>
              <button
                onClick={() => setUserRole('user')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center space-x-1 ${
                  userRole === 'user' ? 'bg-flora-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" />
                <span>User</span>
              </button>
              <button
                onClick={() => setUserRole('admin')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center space-x-1 ${
                  userRole === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Admin</span>
              </button>
            </div>

            {/* User Auth Button */}
            {userEmail ? (
              <div className="flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-flora-400 animate-pulse" />
                <span className="text-xs text-slate-300 font-medium max-w-[120px] truncate">{userEmail}</span>
                {onSignOut && (
                  <button onClick={onSignOut} className="text-slate-400 hover:text-red-400 p-1">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
