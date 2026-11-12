import React, { useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import FirebaseSyncCard from './FirebaseSyncCard';
import { 
  exportTransactionsToCSV, parseTransactionsCSV, 
  exportCategoriesToCSV, parseCategoriesCSV, 
  exportBudgetsToCSV, parseBudgetsCSV 
} from '../../utils/csv';
import { 
  Download, 
  Upload, 
  Coins, 
  Eye, 
  EyeOff, 
  Trash2, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle,
  User,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import AuthModal from '../auth/AuthModal';

const SettingsPage: React.FC = () => {
  const {
    transactions, addMultipleTransactions,
    categories, importCategories,
    budgets, importBudgets,
    accounts,
    savingsGoals,
    settings, updateSettings,
    clearAllData,
    currentUser,
    signOut
  } = useAppContext();

  const transactionsInputRef = useRef<HTMLInputElement>(null);
  const categoriesInputRef = useRef<HTMLInputElement>(null);
  const budgetsInputRef = useRef<HTMLInputElement>(null);
  const jsonBackupInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Export full JSON Backup
  const handleExportFullJSON = () => {
    const backupData = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      appName: 'PocketTracker Pro',
      currency: 'PKR',
      userEmail: currentUser?.email || 'local',
      transactions,
      accounts,
      categories,
      budgets,
      savingsGoals,
      settings
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tracker-pro-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotice('Complete JSON Backup downloaded successfully!');
  };

  // Restore JSON Backup
  const handleImportJSONBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.transactions && !parsed.accounts) {
          throw new Error('Invalid JSON backup file format.');
        }

        if (parsed.transactions) {
          localStorage.setItem('fintrack_transactions_v3', JSON.stringify(parsed.transactions));
        }
        if (parsed.accounts) {
          localStorage.setItem('fintrack_accounts_v3', JSON.stringify(parsed.accounts));
        }
        if (parsed.categories) {
          localStorage.setItem('fintrack_categories_v3', JSON.stringify(parsed.categories));
        }
        if (parsed.budgets) {
          localStorage.setItem('fintrack_budgets_v3', JSON.stringify(parsed.budgets));
        }
        if (parsed.savingsGoals) {
          localStorage.setItem('fintrack_goals_v3', JSON.stringify(parsed.savingsGoals));
        }

        showNotice('Backup restored! Reloading application...');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err: any) {
        showNotice(`Failed to restore backup: ${err.message}`, 'error');
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleFileImport = (
    event: React.ChangeEvent<HTMLInputElement>,
    parser: (content: string, categories?: any[]) => any[],
    importer: (data: any[]) => void,
    dataType: string,
    extraParserArgs?: any[]
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("File is empty.");
        const newData = parser(content, ...(extraParserArgs || []));
        importer(newData);
        showNotice(`${newData.length} ${dataType} imported successfully!`);
      } catch (error) {
        console.error(`Error importing ${dataType} CSV:`, error);
        showNotice(`Failed to import ${dataType}. Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Cloud Integration
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your Firebase login session, currency preferences, and data backups.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl flex items-center space-x-2 text-sm font-semibold transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* User Login Account Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-200">
            {currentUser ? (currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase() : <User size={22} className="text-slate-500" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">
                {currentUser ? (currentUser.displayName || currentUser.email) : 'Not Logged In'}
              </h2>
              {currentUser && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck size={11} />
                  <span>Authenticated</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser 
                ? `Personal ledger data is bound to your Firebase account (${currentUser.email}).` 
                : 'Sign in with your previous login credentials to access and sync your remote data.'}
            </p>
          </div>
        </div>

        <div>
          {currentUser ? (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <LogIn size={15} />
              <span>Sign In with Existing Account</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Firebase Cloud Sync Section */}
      <FirebaseSyncCard />

      {/* 2. Currency Preferences (PKR Only) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Coins size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Currency & Formatting</h2>
            <p className="text-xs text-slate-500">Configured strictly for Pakistani Rupee (PKR - Rs).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Active Currency
            </span>
            <div className="text-base font-bold text-slate-900">
              Pakistani Rupee (PKR - Rs)
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strictly locked to PKR across all ledger entries and calculations.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Format Preview
            </span>
            <div className="text-base font-bold text-emerald-600">
              Rs 25,000
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Standard prefix format with thousands separator.
            </p>
          </div>
        </div>

        {/* Privacy Mode Option */}
        <div className="pt-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="font-semibold text-sm text-slate-900 flex items-center space-x-2">
              {settings.hideAmounts ? <EyeOff size={16} className="text-amber-600" /> : <Eye size={16} className="text-slate-600" />}
              <span>Hide Balances by Default (Privacy Mode)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mask balances with `••••••` across all cards for privacy when working in public.
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ hideAmounts: !settings.hideAmounts })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.hideAmounts ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.hideAmounts ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. JSON Backup & Restore */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileJson size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Database Backup & Restore</h2>
            <p className="text-xs text-slate-500">Download a full JSON snapshot of your transactions, accounts, and budgets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportFullJSON}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Download size={16} />
            <span>Download JSON Backup</span>
          </button>

          <input
            type="file"
            ref={jsonBackupInputRef}
            onChange={handleImportJSONBackup}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => jsonBackupInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Upload size={16} />
            <span>Restore from JSON File</span>
          </button>
        </div>
      </div>

      {/* 4. CSV Import & Export */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Download size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">CSV Spreadsheet Management</h2>
            <p className="text-xs text-slate-500">Export or import CSV files compatible with Excel and Google Sheets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">Export to CSV</span>
            <div className="space-y-2">
              <button
                onClick={() => exportTransactionsToCSV(transactions)}
                className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-xs"
              >
                <span>Transactions CSV ({transactions.length} items)</span>
                <Download size={14} className="text-slate-400" />
              </button>
              <button
                onClick={() => exportCategoriesToCSV(categories)}
                className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-xs"
              >
                <span>Categories CSV ({categories.length} items)</span>
                <Download size={14} className="text-slate-400" />
              </button>
              <button
                onClick={() => exportBudgetsToCSV(budgets, categories)}
                className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-xs"
              >
                <span>Budgets CSV ({budgets.length} items)</span>
                <Download size={14} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">Import from CSV</span>
            <div className="space-y-2">
              <input type="file" ref={transactionsInputRef} onChange={(e) => handleFileImport(e, parseTransactionsCSV, addMultipleTransactions, 'transactions')} className="hidden" accept=".csv" />
              <button
                onClick={() => transactionsInputRef.current?.click()}
                className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-xs"
              >
                <span>Import Transactions CSV</span>
                <Upload size={14} className="text-slate-400" />
              </button>

              <input type="file" ref={categoriesInputRef} onChange={(e) => handleFileImport(e, parseCategoriesCSV, importCategories, 'categories')} className="hidden" accept=".csv" />
              <button
                onClick={() => categoriesInputRef.current?.click()}
                className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-xs"
              >
                <span>Import Categories CSV</span>
                <Upload size={14} className="text-slate-400" />
              </button>

              <input type="file" ref={budgetsInputRef} onChange={(e) => handleFileImport(e, parseBudgetsCSV, importBudgets, 'budgets', [categories])} className="hidden" accept=".csv" />
              <button
                onClick={() => budgetsInputRef.current?.click()}
                className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-xs"
              >
                <span>Import Budgets CSV</span>
                <Upload size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Clear Local Data */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          <span className="font-bold text-slate-800">Clear Local Cache</span>
          <p className="text-slate-500">Wipe any local test data from your browser storage.</p>
        </div>
        <button
          onClick={() => {
            if (confirm("Clear all local records? Make sure your data is synced to Firebase first.")) {
              clearAllData();
              showNotice("Local records cleared.");
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-semibold shadow-xs transition-colors"
        >
          <Trash2 size={13} />
          <span>Wipe Local Cache</span>
        </button>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;