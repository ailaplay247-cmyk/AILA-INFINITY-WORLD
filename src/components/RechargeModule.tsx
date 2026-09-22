import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Zap,
  Tag,
  ShieldCheck,
  RefreshCw,
  Search,
  Check,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { Transaction, AgentProfile, RechargePlan } from '../types';
import { MOCK_MOBILE_OPERATORS, MOCK_RECHARGE_PLANS } from '../data/mockData';

interface RechargeModuleProps {
  walletBalance: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onShowReceipt: (tx: Transaction) => void;
  agentProfile: AgentProfile;
}

export const RechargeModule: React.FC<RechargeModuleProps> = ({
  walletBalance,
  onExecuteTransaction,
  onShowReceipt,
  agentProfile,
}) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('jio');
  const [selectedCircle, setSelectedCircle] = useState('Delhi NCR');
  const [activePlanTab, setActivePlanTab] = useState<'POPULAR' | 'UNLIMITED' | 'DATA_ADDON' | 'ANNUAL' | 'TALKTIME'>('POPULAR');
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan | null>(MOCK_RECHARGE_PLANS['jio'][0]);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState<Transaction | null>(null);
  const [searchPlan, setSearchPlan] = useState('');

  // Circles in India
  const circles = [
    'Delhi NCR',
    'UP East',
    'UP West & Uttarakhand',
    'Bihar & Jharkhand',
    'Maharashtra & Goa',
    'Mumbai',
    'Rajasthan',
    'Madhya Pradesh & CG',
    'Punjab & Haryana',
    'West Bengal & Kolkata',
    'Gujarat',
    'Karnataka',
    'Tamil Nadu & Chennai'
  ];

  // Auto-detect operator based on prefix
  const handleMobileChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(cleaned);

    if (cleaned.length >= 4) {
      const prefix = cleaned.slice(0, 2);
      if (['98', '99', '97'].includes(prefix)) {
        if (!selectedOperator) setSelectedOperator('airtel');
      } else if (['70', '63', '89', '79'].includes(prefix)) {
        if (!selectedOperator) setSelectedOperator('jio');
      } else if (['91', '90', '96'].includes(prefix)) {
        if (!selectedOperator) setSelectedOperator('vi');
      } else if (['94', '95'].includes(prefix)) {
        if (!selectedOperator) setSelectedOperator('bsnl');
      }
    }
  };

  const currentPlans = MOCK_RECHARGE_PLANS[selectedOperator] || [];
  const filteredPlans = currentPlans.filter(p => {
    const matchesTab = activePlanTab === 'POPULAR' ? true : p.category === activePlanTab;
    const matchesSearch = searchPlan
      ? p.price.toString().includes(searchPlan) ||
        p.data.toLowerCase().includes(searchPlan.toLowerCase()) ||
        p.description.toLowerCase().includes(searchPlan.toLowerCase())
      : true;
    return matchesTab && matchesSearch;
  });

  const finalAmount = selectedPlan ? selectedPlan.price : parseFloat(customAmount) || 0;
  
  // Calculate commission: e.g. ~2.2% average
  const commissionRate = selectedOperator === 'bsnl' ? 0.035 : selectedOperator === 'vi' ? 0.028 : 0.022;
  const estimatedCommission = +(finalAmount * commissionRate).toFixed(2);

  const canProceed =
    mobileNumber.length === 10 &&
    finalAmount > 0 &&
    walletBalance >= finalAmount &&
    !isProcessing;

  const handleRecharge = () => {
    if (!canProceed) return;

    setIsProcessing(true);
    const rrn = '6265' + Math.floor(10000000 + Math.random() * 90000000);
    const operatorObj = MOCK_MOBILE_OPERATORS.find(o => o.id === selectedOperator);

    setTimeout(() => {
      const newTx: Omit<Transaction, 'id' | 'timestamp'> = {
        txnReference: `REC${Date.now().toString().slice(-8)}`,
        rrn,
        service: 'RECHARGE',
        subtype: `Prepaid Recharge ${selectedPlan ? selectedPlan.data : 'Top-up'} (${selectedPlan ? selectedPlan.validity : 'Core Balance'})`,
        status: 'SUCCESS',
        amount: finalAmount,
        fee: 0,
        commission: estimatedCommission,
        customerName: `Subscriber ${mobileNumber.slice(-4)}`,
        customerMobile: mobileNumber,
        accountOrAadhaarOrConsumer: mobileNumber,
        bankOrOperator: `${operatorObj?.name || 'Mobile Prepaid'} (${selectedCircle})`,
        timeline: [
          { step: 'Recharge Request Initiated', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Amount: ₹${finalAmount}` },
          { step: 'Operator Switch Gateway Route', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `${operatorObj?.name} Circle Core` },
          { step: 'Subscriber Pack Activated', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `RRN ${rrn} - Active instantly` },
          { step: 'Commission Credit', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `+₹${estimatedCommission} added to Commission Wallet` },
        ],
      };

      onExecuteTransaction(newTx);
      setIsProcessing(false);

      const completeTx: Transaction = {
        ...newTx,
        id: `TXN-${Math.floor(90000 + Math.random() * 10000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      setRechargeSuccess(completeTx);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Smartphone className="w-8 h-8 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Instant Mobile Recharge</h2>
                <span className="text-[11px] font-bold bg-sky-400/30 text-white border border-sky-300/40 px-2 py-0.5 rounded-full">
                  All Indian Operators
                </span>
              </div>
              <p className="text-sky-100 text-sm mt-0.5">
                Prepaid & Postpaid recharges across Jio, Airtel, Vi & BSNL with instant RRN and commission
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">Agent Commission</div>
              <div className="text-sm font-bold text-white font-mono">Up to 3.50% Instant Credit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Plan Browser Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Number & Operator Selector */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">1</span>
              Subscriber Details
            </h3>

            {/* Mobile Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                10-Digit Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  +91
                </span>
                <input
                  id="input-recharge-mobile"
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-sky-600 focus:bg-white rounded-xl text-sm font-mono font-medium focus:outline-none transition-all"
                />
                {mobileNumber.length === 10 && (
                  <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            {/* Operator Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Operator <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOCK_MOBILE_OPERATORS.map((op) => {
                  const isSelected = selectedOperator === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setSelectedOperator(op.id);
                        setSelectedPlan(MOCK_RECHARGE_PLANS[op.id]?.[0] || null);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/80 shadow-2xs text-sky-900 font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full ${op.color} text-white text-[11px] font-bold flex items-center justify-center shadow-xs`}>
                        {op.logoInitial}
                      </span>
                      <span className="text-xs truncate w-full">{op.brand}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Circle Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telecom Circle / State
              </label>
              <select
                id="select-recharge-circle"
                value={selectedCircle}
                onChange={(e) => setSelectedCircle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-sky-600 rounded-xl text-xs font-medium focus:outline-none"
              >
                {circles.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Amount / Selected Plan Summary */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recharge Amount (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₹</span>
                  <input
                    id="input-recharge-amount"
                    type="number"
                    value={selectedPlan ? selectedPlan.price : customAmount}
                    onChange={(e) => {
                      setSelectedPlan(null);
                      setCustomAmount(e.target.value);
                    }}
                    placeholder="Enter or select plan"
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 focus:border-sky-600 focus:bg-white rounded-xl text-base font-bold font-mono focus:outline-none"
                  />
                </div>
                {selectedPlan && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomAmount(selectedPlan.price.toString());
                      setSelectedPlan(null);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-800 font-semibold px-2 py-1"
                  >
                    Custom Edit
                  </button>
                )}
              </div>
            </div>

            {/* Selected Plan Details Chip */}
            {selectedPlan && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-sky-900">
                  <span>Selected: ₹{selectedPlan.price} Pack</span>
                  <span className="bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-full font-mono">
                    {selectedPlan.validity}
                  </span>
                </div>
                <div className="text-slate-600">{selectedPlan.description}</div>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-sky-800">
                  <span>⚡ Data: {selectedPlan.data}</span>
                  {selectedPlan.ottBenefits && selectedPlan.ottBenefits.length > 0 && (
                    <span className="text-amber-700">🎁 {selectedPlan.ottBenefits.join(' + ')}</span>
                  )}
                </div>
              </div>
            )}

            {/* Wallet & Commission Calculation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Available Main Wallet:</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Deduction from Wallet:</span>
                <span className="font-mono font-bold text-rose-600">
                  -₹{finalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold border-t border-slate-200/60 pt-1">
                <span>Agent Instant Commission:</span>
                <span className="font-mono font-bold">
                  +₹{estimatedCommission.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-recharge-submit"
              type="button"
              disabled={!canProceed}
              onClick={handleRecharge}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                canProceed
                  ? 'bg-sky-600 hover:bg-sky-700 text-white active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Operator Route...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Proceed to Recharge ₹{finalAmount.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Plan Browser */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">2</span>
                  Browse Recommended Plans
                </h3>
                <p className="text-xs text-slate-500">Live tariff plans for {MOCK_MOBILE_OPERATORS.find(o => o.id === selectedOperator)?.name}</p>
              </div>

              {/* Plan Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPlan}
                  onChange={(e) => setSearchPlan(e.target.value)}
                  placeholder="Search ₹, data, validity..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-sky-600 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
              {(
                [
                  { id: 'POPULAR', label: 'Popular' },
                  { id: 'UNLIMITED', label: 'Truly Unlimited' },
                  { id: 'DATA_ADDON', label: 'Data Boosters' },
                  { id: 'ANNUAL', label: 'Annual 365d' },
                  { id: 'TALKTIME', label: 'Talktime' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePlanTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activePlanTab === tab.id
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Plans List */}
            <div className="mt-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredPlans.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No plans found matching your criteria. Try another category.
                </div>
              ) : (
                filteredPlans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setCustomAmount('');
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/70 shadow-2xs ring-1 ring-sky-600'
                          : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900 font-mono">
                            ₹{plan.price}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                            {plan.validity}
                          </span>
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                            {plan.data}
                          </span>
                          {plan.talktime && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                              {plan.talktime}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{plan.description}</p>
                        {plan.ottBenefits && plan.ottBenefits.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {plan.ottBenefits.map((b, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-emerald-700 font-mono">
                          +₹{(plan.price * commissionRate).toFixed(2)} comm.
                        </span>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-700 group-hover:bg-sky-100'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {rechargeSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Recharge Successful!</h3>
              <p className="text-xs text-slate-500">
                Pack activated for subscriber <span className="font-mono font-bold text-slate-800">+91 {rechargeSuccess.customerMobile}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Operator:</span>
                <span className="font-bold text-slate-800">{rechargeSuccess.bankOrOperator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">₹{rechargeSuccess.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operator RRN:</span>
                <span className="font-mono text-indigo-700 font-semibold">{rechargeSuccess.rrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agent Commission:</span>
                <span className="font-bold text-emerald-600 font-mono">+₹{rechargeSuccess.commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">DigiSeva Center:</span>
                <span className="font-semibold text-slate-700">{agentProfile.shopName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onShowReceipt(rechargeSuccess);
                  setRechargeSuccess(null);
                }}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setRechargeSuccess(null)}
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
