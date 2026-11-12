import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Plus, 
  ArrowLeftRight, 
  Eye, 
  EyeOff, 
  Cloud, 
  RefreshCw, 
  CheckCircle,
  LogIn,
  User,
  ShieldCheck
} from 'lucide-react';
import GlobalSearch from '../search/GlobalSearch';
import { View } from '../../App';
import { useAppContext } from '../../context/AppContext';
import AuthModal from '../auth/AuthModal';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  setView: (view: View) => void;
  onOpenAddModal: () => void;
  onOpenTransferModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  toggleSidebar, 
  isSidebarOpen, 
  setView,
  onOpenAddModal,
  onOpenTransferModal
}) => {
  const { settings, toggleHideAmounts, syncToCloud, isSyncing, syncStatus, currentUser } = useAppContext();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <header className="flex-shrink-0 bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left Side: Hamburger & Global Search */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleSidebar} 
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none md:hidden"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <div className="hidden sm:block">
            <GlobalSearch setView={setView} />
          </div>
        </div>

        {/* Right Side: Quick Action buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Privacy Toggle */}
          <button
            onClick={toggleHideAmounts}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              settings.hideAmounts 
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={settings.hideAmounts ? "Amounts are hidden. Click to show." : "Hide sensitive amounts for privacy"}
          >
            {settings.hideAmounts ? <EyeOff size={15} /> : <Eye size={15} />}
            <span className="hidden md:inline">{settings.hideAmounts ? 'Masked' : 'Privacy'}</span>
          </button>

          {/* Currency Indicator (PKR only) */}
          <div 
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
            title="Currency locked to Pakistani Rupee (PKR)"
          >
            <span>Rs (PKR)</span>
          </div>

          {/* Cloud Sync Status / Trigger */}
          <button
            onClick={() => syncToCloud()}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all disabled:opacity-50"
            title="Sync with Firebase database"
          >
            <Cloud size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">
              {isSyncing ? "Syncing..." : "Sync Cloud"}
            </span>
            {isSyncing && <RefreshCw size={12} className="animate-spin ml-1 text-emerald-600" />}
          </button>

          {/* Quick Transfer Button */}
          <button
            onClick={onOpenTransferModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-lg transition-colors border border-slate-200"
            title="Transfer funds between accounts"
          >
            <ArrowLeftRight size={15} className="text-slate-600" />
            <span className="hidden sm:inline">Transfer</span>
          </button>

          {/* Quick Add Transaction Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-all shadow-emerald-600/20 active:scale-95"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>

          {/* Login / User Profile Button */}
          {currentUser ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center space-x-1.5 pl-2 pr-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-semibold text-slate-800 transition-colors border border-slate-200"
              title={`Logged in as ${currentUser.email}`}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email?.[0].toUpperCase() || 'U'}
              </div>
              <span className="hidden lg:inline max-w-[100px] truncate">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync notification toast bar if active */}
      {syncStatus.message && (
        <div className={`px-4 py-1.5 text-xs flex items-center justify-between transition-colors ${
          syncStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-t border-emerald-100' :
          syncStatus.type === 'error' ? 'bg-red-50 text-red-800 border-t border-red-100' :
          'bg-blue-50 text-blue-800 border-t border-blue-100'
        }`}>
          <div className="flex items-center space-x-2 truncate">
            {syncStatus.type === 'success' && <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />}
            <span className="truncate">{syncStatus.message}</span>
          </div>
          {!currentUser && (
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="text-xs font-bold underline ml-2 whitespace-nowrap text-emerald-700"
            >
              Sign In to Save
            </button>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
};

export default Header;