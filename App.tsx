import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import TransactionsPage from './components/transactions/TransactionsPage';
import AccountsPage from './components/accounts/AccountsPage';
import BudgetsPage from './components/budgets/BudgetsPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import AiAssistantPage from './components/ai/AiAssistantPage';
import SettingsPage from './components/settings/SettingsPage';
import Modal from './components/ui/Modal';
import TransactionForm from './components/transactions/TransactionForm';
import TransferModal from './components/transactions/TransferModal';

export type View = 'dashboard' | 'transactions' | 'accounts' | 'budgets' | 'analytics' | 'ai-assistant' | 'settings';

const AppContent: React.FC = () => {
  const { settings } = useAppContext();
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isGlobalAddOpen, setGlobalAddOpen] = useState(false);
  const [isGlobalTransferOpen, setGlobalTransferOpen] = useState(false);

  const isDark = settings.theme === 'dark';

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            setView={setView} 
            onOpenAddModal={() => setGlobalAddOpen(true)}
            onOpenTransferModal={() => setGlobalTransferOpen(true)}
          />
        );
      case 'transactions':
        return <TransactionsPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'budgets':
        return <BudgetsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <Dashboard 
            setView={setView} 
            onOpenAddModal={() => setGlobalAddOpen(true)}
            onOpenTransferModal={() => setGlobalTransferOpen(true)}
          />
        );
    }
  };

  return (
    <div className={`flex h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out md:relative md:translate-x-0 shadow-lg md:shadow-none`}>
        <Sidebar 
          currentView={view} 
          setView={setView} 
          closeSidebar={() => setSidebarOpen(false)}
          onOpenAddModal={() => setGlobalAddOpen(true)}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <Header 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          setView={setView}
          onOpenAddModal={() => setGlobalAddOpen(true)}
          onOpenTransferModal={() => setGlobalTransferOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className={`fixed bottom-0 inset-x-0 z-30 md:hidden border-t flex items-center justify-around h-16 px-2 shadow-lg backdrop-blur-md ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-600'
      }`}>
        <button
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            view === 'dashboard' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-500'
          }`}
        >
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => setView('transactions')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            view === 'transactions' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-500'
          }`}
        >
          <span className="text-xs">Txns</span>
        </button>
        <button
          onClick={() => setGlobalAddOpen(true)}
          className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
          title="Add Transaction"
        >
          <span className="text-2xl font-light">+</span>
        </button>
        <button
          onClick={() => setView('accounts')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            view === 'accounts' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-500'
          }`}
        >
          <span className="text-xs">Accounts</span>
        </button>
        <button
          onClick={() => setView('ai-assistant')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            view === 'ai-assistant' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-500'
          }`}
        >
          <span className="text-xs">AI Advisor</span>
        </button>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <Modal
        isOpen={isGlobalAddOpen}
        onClose={() => setGlobalAddOpen(false)}
        title="Record New Transaction"
      >
        <TransactionForm
          transactionToEdit={null}
          onClose={() => setGlobalAddOpen(false)}
        />
      </Modal>

      {/* Global Quick Transfer Modal */}
      <TransferModal
        isOpen={isGlobalTransferOpen}
        onClose={() => setGlobalTransferOpen(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;