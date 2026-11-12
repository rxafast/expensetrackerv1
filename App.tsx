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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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