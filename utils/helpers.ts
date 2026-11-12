import { AppSettings } from '../types';

export const formatCurrencyWithSettings = (
  amount: number,
  settings?: Partial<AppSettings>
): string => {
  if (settings?.hideAmounts) {
    return '••••••';
  }

  const symbol = settings?.currencySymbol || 'Rs';
  const position = settings?.currencyPosition || 'prefix';
  
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const sign = amount < 0 ? '-' : '';

  if (position === 'suffix') {
    return `${sign}${formattedNumber} ${symbol}`;
  }
  return `${sign}${symbol} ${formattedNumber}`;
};

export const formatCurrency = (amount: number, hideAmount = false): string => {
  if (hideAmount) return '••••••';
  return formatCurrencyWithSettings(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatShortDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getMonthYear = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
};

export const getAccountTypeName = (type: string): string => {
  switch (type) {
    case 'cash':
      return 'Cash in Hand';
    case 'bank':
      return 'Bank Account';
    case 'credit_card':
      return 'Credit Card';
    case 'savings':
      return 'Savings Account';
    case 'digital_wallet':
      return 'Digital Wallet';
    default:
      return type;
  }
};