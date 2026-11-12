export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 'Cash' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Mobile Wallet' | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO string YYYY-MM-DD
  description: string;
  accountId?: string; // Origin account
  toAccountId?: string; // Destination account for transfers
  paymentMethod?: PaymentMethod;
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings' | 'digital_wallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currency?: string;
  color: string;
  accountNumber?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type?: 'expense' | 'income' | 'both';
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  color: string;
  notes?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type AppTheme = 'light' | 'indigo' | 'dark';

export interface AppSettings {
  currency: 'PKR';
  currencySymbol: 'Rs';
  currencyPosition: 'prefix';
  hideAmounts: boolean;
  theme: AppTheme;
  firebaseConfig?: FirebaseConfig;
  useFirebase: boolean;
  autoSync: boolean;
  lastSyncedAt?: string;
}
