import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Coins, 
  IndianRupee, 
  ArrowUpRight,
  Receipt,
  Layers
} from 'lucide-react';
import { Transaction } from '../types';

interface MetricCardsProps {
  transactions: Transaction[];
  cashInDrawer: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ transactions, cashInDrawer }) => {
  // Compute analytics
  const totalVolume = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalCommission = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((acc, t) => acc + t.commission, 0);

  const successCount = transactions.filter(t => t.status === 'SUCCESS').length;
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const failedCount = transactions.filter(t => t.status === 'FAILED').length;

  const totalCount = transactions.length;
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '100.0';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Today's GMV Volume */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Today's Volume</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <IndianRupee className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
          ₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
          <span className="font-semibold text-emerald-600 flex items-center">
            <ArrowUpRight className="w-3 h-3" /> {successCount} settled
          </span>
          <span className="text-slate-300">•</span>
          <span>{totalCount} total txns</span>
        </div>
      </div>

      {/* Commission Earned Today */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Commission Earned</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono tracking-tight">
          ₹{totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
          <span className="text-slate-600 font-medium">Instant credit</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-600 font-semibold">100% margin</span>
        </div>
      </div>

      {/* Success Ratio & Status */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Gateway Success</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {successRate}%
          </span>
          {pendingCount > 0 && (
            <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <span className="text-emerald-600 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> {successCount}
          </span>
          <span className="text-amber-600 flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> {pendingCount}
          </span>
          {failedCount > 0 && (
            <span className="text-rose-600 flex items-center gap-0.5">
              ✕ {failedCount}
            </span>
          )}
        </div>
      </div>

      {/* Cash In Drawer / Physical Safe */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Cash in Counter</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
          ₹{cashInDrawer.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
          <span>Physical register ready for AePS cash-outs</span>
        </div>
      </div>
    </div>
  );
};
