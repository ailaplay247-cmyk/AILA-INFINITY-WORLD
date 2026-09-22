import React, { useState } from 'react';
import { 
  Wallet, 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  QrCode, 
  RefreshCw, 
  Sparkles, 
  X,
  CreditCard,
  Receipt
} from 'lucide-react';
import { AgentProfile } from '../types';

interface WalletModalProps {
  profile: AgentProfile;
  isOpen: boolean;
  onClose: () => void;
  onTopUpFloat: (amount: number) => void;
  onTransferCommissionToFloat: () => void;
  onSettleToBank: (amount: number) => void;
  onUpdateCashInDrawer: (amount: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  profile,
  isOpen,
  onClose,
  onTopUpFloat,
  onTransferCommissionToFloat,
  onSettleToBank,
  onUpdateCashInDrawer,
}) => {
  const [activeTab, setActiveTab] = useState<'TOPUP' | 'COMMISSION' | 'SETTLE' | 'CASH'>('TOPUP');
  const [topUpAmount, setTopUpAmount] = useState<number | ''>(25000);
  const [settleAmount, setSettleAmount] = useState<number | ''>(10000);
  const [cashDrawerAmount, setCashDrawerAmount] = useState<number | ''>(profile.cashInDrawer);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleTopUp = () => {
    const amt = typeof topUpAmount === 'number' ? topUpAmount : 0;
    if (amt <= 0) return;
    onTopUpFloat(amt);
    showToast(`Successfully added ₹${amt.toLocaleString('en-IN')} to Float Balance!`);
  };

  const handleCommissionMove = () => {
    if (profile.commissionWalletBalance <= 0) return;
    const amt = profile.commissionWalletBalance;
    onTransferCommissionToFloat();
    showToast(`Transferred ₹${amt.toFixed(2)} Commission to Main Float!`);
  };

  const handleSettle = () => {
    const amt = typeof settleAmount === 'number' ? settleAmount : 0;
    if (amt <= 0) return;
    if (amt > profile.mainWalletBalance) {
      alert('Settlement amount exceeds available float balance!');
      return;
    }
    onSettleToBank(amt);
    showToast(`Payout of ₹${amt.toLocaleString('en-IN')} initiated to Bank Account!`);
  };

  const handleCashUpdate = () => {
    const amt = typeof cashDrawerAmount === 'number' ? cashDrawerAmount : 0;
    onUpdateCashInDrawer(amt);
    showToast(`Counter cash register updated to ₹${amt.toLocaleString('en-IN')}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Float & Working Capital Manager</h3>
            <p className="text-xs text-slate-500">Agent liquidity balance and bank settlement</p>
          </div>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Current Balances Banner */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500">Main Float Balance</div>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              ₹{profile.mainWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-1">Available for DMT & BBPS</div>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80">
            <div className="text-[11px] font-semibold text-emerald-800">Earned Commission</div>
            <div className="text-lg font-extrabold text-emerald-900 font-mono mt-0.5">
              ₹{profile.commissionWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1">100% Withdrawable</div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex border-b border-slate-200 mb-4 text-xs font-bold text-slate-600">
          {[
            { id: 'TOPUP' as const, label: 'Add Float' },
            { id: 'COMMISSION' as const, label: 'Claim Commission' },
            { id: 'SETTLE' as const, label: 'Payout to Bank' },
            { id: 'CASH' as const, label: 'Counter Cash' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Add Float */}
        {activeTab === 'TOPUP' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Add Float Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">₹</span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 mt-2">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-medium"
                  >
                    +₹{(amt / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-600">
              <div className="font-bold text-slate-800">Assigned Virtual Account (Instant Top-up):</div>
              <div className="flex justify-between font-mono">
                <span>Account No:</span>
                <span className="font-bold text-slate-900">DIGIAGT8492001</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>IFSC:</span>
                <span className="font-bold text-slate-900">YESB0CMSNOC</span>
              </div>
              <div className="flex justify-between">
                <span>Beneficiary:</span>
                <span className="font-medium text-slate-800">DigiAgent Float Pooling</span>
              </div>
            </div>

            <button
              onClick={handleTopUp}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Add ₹{typeof topUpAmount === 'number' ? topUpAmount.toLocaleString('en-IN') : '0'} to Float
            </button>
          </div>
        )}

        {/* Tab 2: Claim Commission */}
        {activeTab === 'COMMISSION' && (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                <Coins className="w-5 h-5" />
              </div>
              <div className="text-xs text-emerald-800 font-semibold">Available Commission Balance</div>
              <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
                ₹{profile.commissionWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Zero charges • Instant conversion into working capital float
              </p>
            </div>

            <button
              onClick={handleCommissionMove}
              disabled={profile.commissionWalletBalance <= 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Move All Commission to Float Balance
            </button>
          </div>
        )}

        {/* Tab 3: Settle to Bank */}
        {activeTab === 'SETTLE' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Settlement Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">₹</span>
                <input
                  type="number"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-600">
              <div className="font-bold text-slate-800">Registered Agent Settlement Account:</div>
              <div className="flex justify-between font-mono">
                <span>Bank:</span>
                <span className="font-bold text-slate-900">State Bank of India</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Account Number:</span>
                <span className="font-bold text-slate-900">38102948102</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Mode:</span>
                <span className="font-bold text-indigo-600">IMPS Auto-Settlement</span>
              </div>
            </div>

            <button
              onClick={handleSettle}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Transfer ₹{typeof settleAmount === 'number' ? settleAmount.toLocaleString('en-IN') : '0'} to SBI Bank
            </button>
          </div>
        )}

        {/* Tab 4: Counter Cash */}
        {activeTab === 'CASH' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Physical Cash in Counter / Safe (₹)</label>
              <input
                type="number"
                value={cashDrawerAmount}
                onChange={(e) => setCashDrawerAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Updated automatically when customer performs AePS Cash Withdrawal.
              </p>
            </div>

            <button
              onClick={handleCashUpdate}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Update Counter Cash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
