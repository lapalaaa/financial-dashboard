import React from 'react';
import { BankAccount } from '../types/bankTypes';

interface BankBalanceProps {
  accounts: BankAccount[];
  loading?: boolean;
  error?: string | null;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const BankBalance: React.FC<BankBalanceProps> = ({ accounts, loading = false, error = null }) => {
  if (loading) {
    return <div className="text-sm text-slate-600 dark:text-slate-300">Memuat data rekening...</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error}
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">Tidak ada data rekening.</div>;
  }

  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">Rekening Bank</h2>
      <ul className="rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
        {accounts.map((account) => (
          <li key={account.id} className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {account.accountName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{account.bankName}</div>
            </div>
            <div
              className={`text-sm font-semibold ${
                account.balance >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(account.balance)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BankBalance;