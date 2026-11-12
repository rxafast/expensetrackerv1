import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
  Transaction, 
  Category, 
  Budget, 
  Account, 
  SavingsGoal, 
  AppSettings, 
  FirebaseConfig,
  AuthUser
} from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_ACCOUNTS, 
  DEFAULT_SAVINGS_GOALS, 
  DEFAULT_TRANSACTIONS, 
  DEFAULT_SETTINGS,
  USER_FIREBASE_CONFIG
} from '../constants';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutUser, 
  sendResetPassword, 
  subscribeToAuth,
  saveUserDataToCloud,
  fetchUserDataFromCloud
} from '../services/firebaseService';

interface AppContextType {
  // Auth
  currentUser: AuthUser | null;
  isAuthLoading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<AuthUser>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<AuthUser>;
  signInWithGooglePopup: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;

  // Data
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  deleteMultipleTransactions: (ids: string[]) => void;
  addMultipleTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, date: string, description: string) => void;

  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => Account;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  getAccountBalance: (accountId: string) => number;
  getTotalBalance: () => number;

  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  setAllCategories: (categories: Category[]) => void;
  importCategories: (categories: Omit<Category, 'id'>[]) => void;

  budgets: Budget[];
  setBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  importBudgets: (budgets: Omit<Budget, 'id'>[]) => void;

  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  adjustGoalAmount: (id: string, delta: number) => void;

  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleHideAmounts: () => void;

  isSyncing: boolean;
  syncStatus: { message: string; type: 'idle' | 'success' | 'error' };
  syncToCloud: () => Promise<boolean>;
  pullFromCloud: () => Promise<boolean>;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Clear any old demo data keys from previous turns so user starts completely clean
  useEffect(() => {
    const hasCleanedV3 = localStorage.getItem('fintrack_cleaned_demo_v3');
    if (!hasCleanedV3) {
      localStorage.removeItem('fintrack_transactions_v2');
      localStorage.removeItem('fintrack_budgets_v2');
      localStorage.removeItem('fintrack_goals_v2');
      localStorage.setItem('fintrack_cleaned_demo_v3', 'true');
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('fintrack_transactions_v3', DEFAULT_TRANSACTIONS);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('fintrack_accounts_v3', DEFAULT_ACCOUNTS);
  const [categories, setCategories] = useLocalStorage<Category[]>('fintrack_categories_v3', DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('fintrack_budgets_v3', []);
  const [savingsGoals, setSavingsGoals] = useLocalStorage<SavingsGoal[]>('fintrack_goals_v3', DEFAULT_SAVINGS_GOALS);
  const [settings, setSettings] = useLocalStorage<AppSettings>('fintrack_settings_v3', DEFAULT_SETTINGS);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string; type: 'idle' | 'success' | 'error' }>({
    message: '',
    type: 'idle'
  });

  // Auth listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user) {
        // Automatically fetch data from cloud on login
        setIsSyncing(true);
        setSyncStatus({ message: `Loading data for ${user.email}...`, type: 'idle' });
        try {
          const res = await fetchUserDataFromCloud(user.uid);
          if (res.success && res.data) {
            if (res.data.transactions && res.data.transactions.length > 0) {
              setTransactions(res.data.transactions);
            }
            if (res.data.accounts && res.data.accounts.length > 0) {
              setAccounts(res.data.accounts);
            }
            if (res.data.categories && res.data.categories.length > 0) {
              setCategories(res.data.categories);
            }
            if (res.data.budgets && res.data.budgets.length > 0) {
              setBudgets(res.data.budgets);
            }
            if (res.data.savingsGoals && res.data.savingsGoals.length > 0) {
              setSavingsGoals(res.data.savingsGoals);
            }
            setSyncStatus({ message: 'Loaded your Firebase records!', type: 'success' });
          } else {
            setSyncStatus({ message: `Connected to Firebase as ${user.email}`, type: 'success' });
          }
        } catch (e: any) {
          console.warn('Auto fetch on login:', e);
          setSyncStatus({ message: `Signed in as ${user.email}`, type: 'success' });
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Account balances
  const getAccountBalance = useCallback((accountId: string): number => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return 0;

    let balance = account.initialBalance || 0;

    for (const t of transactions) {
      if (t.type === 'income' && t.accountId === accountId) {
        balance += t.amount;
      } else if (t.type === 'expense' && t.accountId === accountId) {
        balance -= t.amount;
      } else if (t.type === 'transfer') {
        if (t.accountId === accountId) balance -= t.amount;
        if (t.toAccountId === accountId) balance += t.amount;
      }
    }

    return balance;
  }, [accounts, transactions]);

  const getTotalBalance = useCallback((): number => {
    return accounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);
  }, [accounts, getAccountBalance]);

  // Data mutations
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const deleteMultipleTransactions = (ids: string[]) => {
    const set = new Set(ids);
    setTransactions(prev => prev.filter(t => !set.has(t.id)));
  };

  const addMultipleTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsToAdd = newTransactions.map(t => ({ ...t, id: crypto.randomUUID() }));
    setTransactions(prev => [...transactionsToAdd, ...prev]);
  };

  const transferFunds = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description: string
  ) => {
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);
    const desc = description.trim() || `Transfer: ${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Account'}`;

    addTransaction({
      type: 'transfer',
      category: 'Other',
      amount,
      date,
      description: desc,
      accountId: fromAccountId,
      toAccountId: toAccountId,
      paymentMethod: 'Bank Transfer'
    });
  };

  const addAccount = (account: Omit<Account, 'id'>): Account => {
    const newAccount: Account = { ...account, id: crypto.randomUUID() };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
  };

  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>): Category => {
    const existing = categories.find(c => c.name.trim().toLowerCase() === category.name.trim().toLowerCase());
    if (existing) return existing;
    const newCat = { ...category, id: crypto.randomUUID() };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setBudgets(prev => prev.filter(b => b.categoryId !== id));
  };

  const setAllCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
  };

  const importCategories = (newCategories: Omit<Category, 'id'>[]) => {
    setCategories(prev => {
      const existingNames = new Set(prev.map(c => c.name.toLowerCase()));
      const toAdd = newCategories
        .filter(nc => !existingNames.has(nc.name.toLowerCase()))
        .map(nc => ({ ...nc, id: crypto.randomUUID() }));
      return [...prev, ...toAdd];
    });
  };

  const setBudget = (budget: Omit<Budget, 'id'>) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === budget.categoryId);
      if (existing) {
        return prev.map(b => b.categoryId === budget.categoryId ? { ...b, amount: budget.amount, period: budget.period } : b);
      }
      return [...prev, { ...budget, id: crypto.randomUUID() }];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const importBudgets = (newBudgets: Omit<Budget, 'id'>[]) => {
    setBudgets(prev => {
      const map = new Map(prev.map(b => [b.categoryId, b]));
      newBudgets.forEach(nb => {
        if (map.has(nb.categoryId)) {
          const ex = map.get(nb.categoryId)!;
          map.set(nb.categoryId, { ...ex, amount: nb.amount });
        } else {
          map.set(nb.categoryId, { ...nb, id: crypto.randomUUID() });
        }
      });
      return Array.from(map.values());
    });
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    setSavingsGoals(prev => [...prev, { ...goal, id: crypto.randomUUID() }]);
  };

  const updateSavingsGoal = (goal: SavingsGoal) => {
    setSavingsGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const adjustGoalAmount = (id: string, delta: number) => {
    setSavingsGoals(prev => prev.map(g => {
      if (g.id === id) {
        const updated = Math.max(0, g.currentAmount + delta);
        return { ...g, currentAmount: updated };
      }
      return g;
    }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    // Enforce PKR only
    setSettings(prev => ({ 
      ...prev, 
      ...newSettings,
      currency: 'PKR',
      currencySymbol: 'Rs',
      currencyPosition: 'prefix'
    }));
  };

  const toggleHideAmounts = () => {
    setSettings(prev => ({ ...prev, hideAmounts: !prev.hideAmounts }));
  };

  // Cloud Sync
  const syncToCloud = async (): Promise<boolean> => {
    setIsSyncing(true);
    setSyncStatus({ message: 'Saving data to your Firebase project...', type: 'idle' });

    try {
      const targetUserId = currentUser?.uid || 'primary_user';
      const res = await saveUserDataToCloud(targetUserId, {
        transactions,
        accounts,
        categories,
        budgets,
        savingsGoals,
        settings
      });

      if (res.success) {
        const now = new Date().toLocaleTimeString();
        updateSettings({ lastSyncedAt: now });
        setSyncStatus({ message: `Synced ${res.count} records to Firebase at ${now}!`, type: 'success' });
        setIsSyncing(false);
        return true;
      } else {
        setSyncStatus({ message: res.message, type: 'error' });
        setIsSyncing(false);
        return false;
      }
    } catch (err: any) {
      setSyncStatus({ message: err.message || 'Sync failed', type: 'error' });
      setIsSyncing(false);
      return false;
    }
  };

  const pullFromCloud = async (): Promise<boolean> => {
    setIsSyncing(true);
    setSyncStatus({ message: 'Fetching from Firebase Firestore...', type: 'idle' });

    try {
      const targetUserId = currentUser?.uid || 'primary_user';
      const res = await fetchUserDataFromCloud(targetUserId);

      if (res.success && res.data) {
        if (res.data.transactions) setTransactions(res.data.transactions);
        if (res.data.accounts) setAccounts(res.data.accounts);
        if (res.data.categories) setCategories(res.data.categories);
        if (res.data.budgets) setBudgets(res.data.budgets);
        if (res.data.savingsGoals) setSavingsGoals(res.data.savingsGoals);

        const now = new Date().toLocaleTimeString();
        updateSettings({ lastSyncedAt: now });
        setSyncStatus({ message: res.message || 'Updated from Firebase!', type: 'success' });
        setIsSyncing(false);
        return true;
      } else {
        setSyncStatus({ message: res.message || 'No data found in Firebase.', type: 'error' });
        setIsSyncing(false);
        return false;
      }
    } catch (err: any) {
      setSyncStatus({ message: err.message || 'Pull failed', type: 'error' });
      setIsSyncing(false);
      return false;
    }
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setAccounts([
      { id: 'acc-1', name: 'Cash in Hand', type: 'cash', initialBalance: 0, color: '#10B981', notes: 'Physical cash' },
      { id: 'acc-2', name: 'Bank Account', type: 'bank', initialBalance: 0, color: '#3B82F6', notes: 'Primary bank account' },
    ]);
    setSyncStatus({ message: 'Cleared all local data.', type: 'idle' });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isAuthLoading,
      signInWithEmail: loginWithEmail,
      signUpWithEmail: registerWithEmail,
      signInWithGooglePopup: loginWithGoogle,
      signOut: logoutUser,
      sendPasswordReset: sendResetPassword,

      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      deleteMultipleTransactions,
      addMultipleTransactions,
      transferFunds,

      accounts,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccountBalance,
      getTotalBalance,

      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      setAllCategories,
      importCategories,

      budgets,
      setBudget,
      deleteBudget,
      importBudgets,

      savingsGoals,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      adjustGoalAmount,

      settings,
      updateSettings,
      toggleHideAmounts,

      isSyncing,
      syncStatus,
      syncToCloud,
      pullFromCloud,
      clearAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};