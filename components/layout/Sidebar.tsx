import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Target, 
  BarChart3, 
  Bot, 
  Settings, 
  ShieldCheck, 
  Cloud, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  LogIn,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { View } from '../../App';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings } from '../../utils/helpers';
import AuthModal from '../auth/AuthModal';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  closeSidebar: () => void;
  onOpenAddModal: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  isActive: boolean;
  isDark: boolean;
  onClick: () => void;
}> = ({ icon, label, badge, isActive, isDark, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
        isActive
          ? 'bg-emerald-600 text-white shadow-sm font-semibold'
          : isDark 
            ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className={isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          isActive 
            ? 'bg-emerald-700 text-white' 
            : isDark 
              ? 'bg-slate-800 text-slate-300' 
              : 'bg-slate-100 text-slate-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, closeSidebar, onOpenAddModal }) => {
  const { transactions, accounts, getTotalBalance, settings, updateSettings, toggleHideAmounts, currentUser } = useAppContext();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const totalBalance = getTotalBalance();
  const isDark = settings.theme === 'dark';

  const handleSetView = (view: View) => {
    setView(view);
    closeSidebar();
  };

  return (
    <div className={`flex flex-col h-full select-none transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-900 border-r border-slate-800 text-slate-200' 
        : 'bg-white border-r border-slate-200/90 text-slate-800'
    }`}>
      {/* Brand & App Title */}
      <div className={`flex items-center justify-between px-5 h-20 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                PocketTracker Pro
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Expense & Budget Hub</p>
          </div>
        </div>
      </div>

      {/* Clean Balance Card */}
      <div className={`mx-4 mt-5 p-4 rounded-2xl border shadow-xs transition-all ${
        isDark 
          ? 'bg-slate-800/80 border-slate-700/80 text-white' 
          : 'bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/50 border-emerald-100/90 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Net Balance
          </span>
          <button 
            onClick={toggleHideAmounts} 
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
            title={settings.hideAmounts ? 'Show Balances' : 'Hide Balances (Privacy)'}
          >
            {settings.hideAmounts ? <EyeOff size={15} className="text-amber-500" /> : <Eye size={15} />}
          </button>
        </div>
        <div className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {formatCurrencyWithSettings(totalBalance, settings)}
        </div>
        <div className={`mt-2.5 flex items-center justify-between text-xs pt-2 border-t ${
          isDark ? 'border-slate-700/80 text-slate-400' : 'border-emerald-100 text-slate-500'
        }`}>
          <span>{accounts.length} Active Accounts</span>
          <span className="text-emerald-600 font-bold">PKR (Rs)</span>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="px-4 mt-4">
        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
        >
          <span>+ Add Transaction</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1">
        <p className={`px-3 text-[11px] font-bold uppercase tracking-wider mb-2 ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>Menu</p>
        <ul className="space-y-1">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            isActive={currentView === 'dashboard'}
            isDark={isDark}
            onClick={() => handleSetView('dashboard')}
          />
          <NavItem
            icon={<ArrowLeftRight size={18} />}
            label="Transactions"
            badge={transactions.length}
            isActive={currentView === 'transactions'}
            isDark={isDark}
            onClick={() => handleSetView('transactions')}
          />
          <NavItem
            icon={<Wallet size={18} />}
            label="Accounts & Wallets"
            badge={accounts.length}
            isActive={currentView === 'accounts'}
            isDark={isDark}
            onClick={() => handleSetView('accounts')}
          />
          <NavItem
            icon={<Target size={18} />}
            label="Budgets & Goals"
            isActive={currentView === 'budgets'}
            isDark={isDark}
            onClick={() => handleSetView('budgets')}
          />
          <NavItem
            icon={<BarChart3 size={18} />}
            label="Analytics & Reports"
            isActive={currentView === 'analytics'}
            isDark={isDark}
            onClick={() => handleSetView('analytics')}
          />
          <NavItem
            icon={<Bot size={18} />}
            label="AI Financial Advisor"
            isActive={currentView === 'ai-assistant'}
            isDark={isDark}
            onClick={() => handleSetView('ai-assistant')}
          />
        </ul>

        <div className={`pt-3 mt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className={`px-3 text-[11px] font-bold uppercase tracking-wider mb-2 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>Configuration</p>
          <ul className="space-y-1">
            <NavItem
              icon={<Settings size={18} />}
              label="Settings & Cloud"
              isActive={currentView === 'settings'}
              isDark={isDark}
              onClick={() => handleSetView('settings')}
            />
          </ul>
        </div>
      </nav>

      {/* Theme Switcher Strip */}
      <div className={`px-4 py-2 mx-3 mb-2 rounded-xl flex items-center justify-between text-xs ${
        isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100/70 text-slate-600'
      }`}>
        <span className="font-semibold text-[11px] flex items-center space-x-1.5">
          <Palette size={13} className="text-emerald-600" />
          <span>Theme</span>
        </span>
        <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              !isDark ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              isDark ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      {/* User / Cloud Status Footer */}
      <div className={`p-3.5 mx-3 mb-3 rounded-2xl border text-xs transition-all ${
        isDark 
          ? 'bg-slate-950/80 border-slate-800 text-slate-300' 
          : 'bg-slate-50 border-slate-200/90 text-slate-700'
      }`}>
        {currentUser ? (
          <div 
            onClick={() => setAuthModalOpen(true)}
            className="cursor-pointer hover:opacity-90 flex items-center space-x-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle2 size={11} />
                <span>Connected &amp; Synced</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Firebase: enermatrix-bdf38</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <LogIn size={13} />
              <span>Sign In with Account</span>
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;