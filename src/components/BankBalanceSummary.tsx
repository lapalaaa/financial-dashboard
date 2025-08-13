import React from 'react';
import { Wallet, Building2, CreditCard } from 'lucide-react';
import { BankBalanceSummary as BankSummaryType } from '../types/bankTypes';

interface BankBalanceSummaryProps {
  summary: BankSummaryType;
  loading?: boolean;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
};

const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  details 
}: { 
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
  details?: string;
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
          {React.cloneElement(icon, { className: `w-8 h-8 ${color}` })}
        </div>
        <p className={`text-3xl font-bold ${color}`}>
          {typeof value === 'number' ? formatCurrency(value) : value}
        </p>
      </div>
      {details && <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{details}</p>}
    </div>
  );
};

const BankBalanceSummary: React.FC<BankBalanceSummaryProps> = ({ summary, loading = false }) => {
  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-24"></div>
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded"></div>
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-600 rounded w-32 mb-3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-full"></div>
          </div>
        ))}
      </section>
    );
  }

  const topBank = Object.entries(summary.accountsByBank)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <SummaryCard 
        title="Total Saldo Bank" 
        value={summary.totalBalance} 
        icon={<Wallet />} 
        color="text-emerald-500" 
        details="Saldo keseluruhan dari semua rekening bank."
      />
      
      <SummaryCard 
        title="Jumlah Rekening" 
        value={`${summary.totalAccounts}`} 
        icon={<CreditCard />} 
        color="text-blue-500" 
        details="Total rekening bank yang terdaftar."
      />
      
      <SummaryCard 
        title="Bank Utama" 
        value={topBank ? topBank[0] : 'N/A'} 
        icon={<Building2 />} 
        color="text-orange-500" 
        details={topBank ? `Saldo: ${formatCurrency(topBank[1])}` : 'Tidak ada data'}
      />
    </section>
  );
};

export default BankBalanceSummary;