import type { Transaction } from '@/types';

export function formatCurrency(amount: string | number, currencyCode = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(num);
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getTransactionColor(type: Transaction['type']): string {
  switch (type) {
    case 'DEPOSIT':    return 'text-income';
    case 'WITHDRAWAL': return 'text-expense';
    case 'TRANSFER':   return 'text-gray-600';
  }
}

export function getTransactionSign(type: Transaction['type']): string {
  switch (type) {
    case 'DEPOSIT':    return '+';
    case 'WITHDRAWAL': return '-';
    case 'TRANSFER':   return '↔';
  }
}
