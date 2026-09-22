import React, { useState } from 'react';
import {
  Film,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Tv,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Gift,
  ExternalLink,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { Transaction, AgentProfile, OttSubscriptionPlan } from '../types';
import { MOCK_OTT_PLANS } from '../data/mockData';

interface OttModuleProps {
  walletBalance: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onShowReceipt: (tx: Transaction) => void;
  agentProfile: AgentProfile;
}

export const OttModule: React.FC<OttModuleProps> = ({
  walletBalance,
  onExecuteTransaction,
  onShowReceipt,
  agentProfile,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<OttSubscriptionPlan>(MOCK_OTT_PLANS[0]);
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherSuccess, setVoucherSuccess] = useState<{
    tx: Transaction;
    voucherCode: string;
    redeemUrl: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Commission is ~6.5% average
  const commissionRate = selectedPlan.provider.includes('Combo') ? 0.1 : 0.065;
  const estimatedCommission = +(selectedPlan.price * commissionRate).toFixed(2);

  const canProceed =
    customerMobile.length === 10 &&
    walletBalance >= selectedPlan.price &&
    !isProcessing;

  const handlePurchaseVoucher = () => {
    if (!canProceed) return;
    setIsProcessing(true);

    const rrn = '6265' + Math.floor(10000000 + Math.random() * 90000000);
    const voucherCode = `${selectedPlan.provider.replace(/\s+/g, '').toUpperCase().slice(0, 7)}-${Math.floor(10000 + Math.random() * 90000)}`;
    const redeemUrl = `https://activate.${selectedPlan.provider.toLowerCase().replace(/[^a-z]/g, '')}.com/redeem?code=${voucherCode}`;

    setTimeout(() => {
      const newTx: Omit<Transaction, 'id' | 'timestamp'> = {
        txnReference: `OTT${Date.now().toString().slice(-8)}`,
        rrn,
        service: 'OTT',
        subtype: `${selectedPlan.provider} - ${selectedPlan.planName}`,
        status: 'SUCCESS',
        amount: selectedPlan.price,
        fee: 0,
        commission: estimatedCommission,
        customerName: customerName.trim() || `Customer ${customerMobile.slice(-4)}`,
        customerMobile,
        accountOrAadhaarOrConsumer: customerMobile,
        bankOrOperator: selectedPlan.provider,
        timeline: [
          { step: 'Order Initiated', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Plan: ${selectedPlan.planName}` },
          { step: 'OTT Content Partner Switch', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Code generated: ${voucherCode}` },
          { step: 'SMS & WhatsApp Delivery', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Dispatched to +91 ${customerMobile}` },
          { step: 'Agent Commission Credited', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `+₹${estimatedCommission} added to wallet` },
        ],
      };

      onExecuteTransaction(newTx);
      setIsProcessing(false);

      const completeTx: Transaction = {
        ...newTx,
        id: `TXN-${Math.floor(90000 + Math.random() * 10000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      setVoucherSuccess({
        tx: completeTx,
        voucherCode,
        redeemUrl,
      });
    }, 1200);
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Film className="w-8 h-8 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">OTT Entertainment Subscriptions</h2>
                <span className="text-[11px] font-bold bg-rose-400/30 text-white border border-rose-300/40 px-2 py-0.5 rounded-full">
                  Instant Activation Code
                </span>
              </div>
              <p className="text-rose-100 text-sm mt-0.5">
                Issue official subscription vouchers for Hotstar, SonyLIV, ZEE5, Prime Video, JioCinema & Combo Passes
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-[10px] text-rose-200 uppercase font-semibold">Agent Margin</div>
              <div className="text-sm font-bold text-white font-mono">Up to 10.00% High Margin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Plan Selection & Checkout Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Confirmation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">1</span>
              Customer Details
            </h3>

            {/* Customer Mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">+91</span>
                <input
                  id="input-ott-mobile"
                  type="tel"
                  maxLength={10}
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-rose-600 focus:bg-white rounded-xl text-sm font-mono font-medium focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Activation voucher code & link will be sent to this number instantly via SMS.</p>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name (Optional)
              </label>
              <input
                id="input-ott-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ananya Roy"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 focus:border-rose-600 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            {/* Selected Plan Summary Card */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-950 text-sm">{selectedPlan.provider}</span>
                <span className="text-sm font-extrabold font-mono text-rose-700">₹{selectedPlan.price}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">{selectedPlan.planName}</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="bg-white border border-rose-200 px-2 py-0.5 rounded-md font-mono">
                  ⏱️ {selectedPlan.validity}
                </span>
                <span className="bg-white border border-rose-200 px-2 py-0.5 rounded-md">
                  📺 {selectedPlan.screens} Screens ({selectedPlan.resolution})
                </span>
              </div>
            </div>

            {/* Wallet Calculation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Main Wallet Balance:</span>
                <span className="font-mono font-bold text-slate-800">₹{walletBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Deduction from Wallet:</span>
                <span className="font-mono font-bold text-rose-600">-₹{selectedPlan.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold border-t border-slate-200/60 pt-1">
                <span>Instant Agent Commission:</span>
                <span className="font-mono font-bold">+₹{estimatedCommission.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-ott-submit"
              type="button"
              disabled={!canProceed}
              onClick={handlePurchaseVoucher}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                canProceed
                  ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Official Activation Code...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Issue OTT Voucher ₹{selectedPlan.price.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: OTT Plan Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">2</span>
                Choose OTT Subscription Plan
              </h3>
              <p className="text-xs text-slate-500">Official prepaid vouchers redeemable on any phone, tablet, or Smart TV</p>
            </div>

            <div className="space-y-3.5">
              {MOCK_OTT_PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/70 shadow-2xs ring-1 ring-rose-600'
                        : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {plan.provider}
                        </span>
                        {plan.badge && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/60 px-2 py-0.5 rounded-full">
                            {plan.badge}
                          </span>
                        )}
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          ₹{plan.price}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 font-mono">
                          / {plan.validity}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800">{plan.planName}</h4>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-emerald-700 font-mono">
                        +₹{(plan.price * (plan.provider.includes('Combo') ? 0.1 : 0.065)).toFixed(2)} comm.
                      </span>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Generated Modal */}
      {voucherSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Voucher Issued Successfully!</h3>
              <p className="text-xs text-slate-500">
                Activation details sent to <span className="font-mono font-bold text-slate-800">+91 {voucherSuccess.tx.customerMobile}</span>
              </p>
            </div>

            {/* Voucher Code Box */}
            <div className="bg-slate-900 text-white rounded-xl p-4 text-center space-y-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Activation Voucher Code</div>
              <div className="text-xl font-black font-mono tracking-wider text-amber-300">
                {voucherSuccess.voucherCode}
              </div>
              <button
                type="button"
                onClick={() => handleCopyVoucher(voucherSuccess.voucherCode)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard' : 'Copy Voucher Code'}</span>
              </button>
            </div>

            {/* Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Platform & Plan:</span>
                <span className="font-bold text-slate-800">{voucherSuccess.tx.subtype}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Collected:</span>
                <span className="font-bold font-mono text-slate-900">₹{voucherSuccess.tx.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agent Commission:</span>
                <span className="font-bold text-emerald-600 font-mono">+₹{voucherSuccess.tx.commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference RRN:</span>
                <span className="font-mono text-slate-700">{voucherSuccess.tx.rrn}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onShowReceipt(voucherSuccess.tx);
                  setVoucherSuccess(null);
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Print Voucher Slip
              </button>
              <button
                type="button"
                onClick={() => setVoucherSuccess(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
