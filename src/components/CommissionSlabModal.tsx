import React from 'react';
import { Percent, X, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { COMMISSION_SLABS } from '../data/mockData';

interface CommissionSlabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommissionSlabModal: React.FC<CommissionSlabModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Agent Commission Structure & Slabs</h3>
            <p className="text-xs text-slate-500">Official NPCI & BC partner distributor payouts</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* AePS Slabs */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                AePS Cash Withdrawal & Inquiry Slabs
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                Instant Credit
              </span>
            </div>
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 text-[10px] uppercase">
                  <th className="pb-1.5">Slab Range</th>
                  <th className="pb-1.5">Customer Charge</th>
                  <th className="pb-1.5 text-right text-emerald-700">Agent Earns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {COMMISSION_SLABS.aeps.map((slab, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 font-medium">{slab.range}</td>
                    <td className="py-1.5 text-slate-500">{slab.customerCharge}</td>
                    <td className="py-1.5 text-right font-bold text-emerald-700">{slab.agentEarn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DMT Slabs */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Domestic Money Transfer (DMT IMPS / NEFT)
              </span>
              <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded-full">
                Real-time Settlement
              </span>
            </div>
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 text-[10px] uppercase">
                  <th className="pb-1.5">Transfer Amount</th>
                  <th className="pb-1.5">Customer Surcharge</th>
                  <th className="pb-1.5 text-right text-indigo-700">Agent Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {COMMISSION_SLABS.dmt.map((slab, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 font-medium">{slab.range}</td>
                    <td className="py-1.5 text-slate-500">{slab.fee}</td>
                    <td className="py-1.5 text-right font-bold text-indigo-700">{slab.agentCommission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BBPS Slabs */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Bharat BillPay (BBPS) Utility Payouts
              </span>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/60 px-2 py-0.5 rounded-full">
                Assured Margins
              </span>
            </div>
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 text-[10px] uppercase">
                  <th className="pb-1.5">Category</th>
                  <th className="pb-1.5 text-right text-amber-700">Agent Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {COMMISSION_SLABS.bbps.map((slab, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 font-medium">{slab.category}</td>
                    <td className="py-1.5 text-right font-bold text-amber-700">{slab.agentCommission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Close Slabs
          </button>
        </div>
      </div>
    </div>
  );
};
