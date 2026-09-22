import React, { useState } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  FileCheck,
  Search,
  Check,
  RefreshCw,
  Landmark,
  User,
  Calendar,
  ShieldAlert,
  Printer,
  Info
} from 'lucide-react';
import { Transaction, AgentProfile, LicPolicyDetails } from '../types';
import { MOCK_LIC_SAMPLE_POLICIES } from '../data/mockData';

interface LicModuleProps {
  walletBalance: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onShowReceipt: (tx: Transaction) => void;
  agentProfile: AgentProfile;
}

export const LicModule: React.FC<LicModuleProps> = ({
  walletBalance,
  onExecuteTransaction,
  onShowReceipt,
  agentProfile,
}) => {
  const [policyNumber, setPolicyNumber] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerDob, setCustomerDob] = useState('1988-06-15');
  const [isSearching, setIsSearching] = useState(false);
  const [fetchedPolicy, setFetchedPolicy] = useState<LicPolicyDetails | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [licSuccess, setLicSuccess] = useState<{
    tx: Transaction;
    policy: LicPolicyDetails;
  } | null>(null);

  // Quick fill sample policy
  const handleSelectSample = (sampleNum: string) => {
    setPolicyNumber(sampleNum);
    setNotFound(false);
    const found = MOCK_LIC_SAMPLE_POLICIES[sampleNum];
    if (found) {
      setFetchedPolicy(found);
      if (!customerMobile) setCustomerMobile('9899001122');
    }
  };

  const handleFetchPolicy = () => {
    if (!policyNumber.trim() || policyNumber.length < 8) return;
    setIsSearching(true);
    setNotFound(false);

    setTimeout(() => {
      setIsSearching(false);
      const found = MOCK_LIC_SAMPLE_POLICIES[policyNumber];
      if (found) {
        setFetchedPolicy(found);
      } else {
        // Generate simulated dynamic policy details for any 9-digit number
        const randomPrem = Math.floor(2000 + Math.random() * 6000);
        const dynamicPolicy: LicPolicyDetails = {
          policyNumber,
          policyholderName: 'Virendra Singh Rawat',
          planName: 'LIC New Jeevan Anand (Table 915)',
          sumAssured: 400000,
          dueDate: '25 Sep 2026',
          installmentPremium: randomPrem,
          lateFee: 0,
          totalPayable: randomPrem,
          status: 'ACTIVE',
          agentCode: '0491820X',
        };
        setFetchedPolicy(dynamicPolicy);
      }
      if (!customerMobile) {
        setCustomerMobile('9876543210');
      }
    }, 700);
  };

  const finalAmount = fetchedPolicy ? fetchedPolicy.totalPayable : 0;
  const estimatedCommission = +(finalAmount * 0.01).toFixed(2); // 1% commission on LIC premium

  const canProceed =
    fetchedPolicy !== null &&
    customerMobile.length === 10 &&
    walletBalance >= finalAmount &&
    !isProcessing;

  const handlePayLicPremium = () => {
    if (!canProceed || !fetchedPolicy) return;
    setIsProcessing(true);

    const rrn = '6265' + Math.floor(10000000 + Math.random() * 90000000);

    setTimeout(() => {
      const newTx: Omit<Transaction, 'id' | 'timestamp'> = {
        txnReference: `LIC${Date.now().toString().slice(-8)}`,
        rrn,
        service: 'LIC',
        subtype: `LIC Premium Renewal: ${fetchedPolicy.planName}`,
        status: 'SUCCESS',
        amount: finalAmount,
        fee: 0,
        commission: estimatedCommission,
        customerName: fetchedPolicy.policyholderName,
        customerMobile,
        accountOrAadhaarOrConsumer: fetchedPolicy.policyNumber,
        bankOrOperator: 'Life Insurance Corporation of India (LIC)',
        timeline: [
          { step: 'Policy Lookup & Due Fetch', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Policy #${fetchedPolicy.policyNumber} Verified` },
          { step: 'LIC Core Central Gateway Route', timestamp: new Date().toLocaleTimeString(), status: 'done', note: 'Central Switch ACK Code 00' },
          { step: 'Premium Credited & 80C Generated', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Official e-Receipt RRN: ${rrn}` },
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

      setLicSuccess({
        tx: completeTx,
        policy: fetchedPolicy,
      });
    }, 1300);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Landmark className="w-8 h-8 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">LIC Policy Premium Payment</h2>
                <span className="text-[11px] font-bold bg-amber-400/30 text-white border border-amber-300/40 px-2 py-0.5 rounded-full">
                  Official LIC Agent Portal
                </span>
              </div>
              <p className="text-amber-100 text-sm mt-0.5">
                Direct renewal payment for Life Insurance Corporation of India with Section 80C Tax certificate receipt
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-[10px] text-amber-200 uppercase font-semibold">Instant e-Receipt</div>
              <div className="text-sm font-bold text-white font-mono">1.00% Agent Payout + 80C Slip</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Policy Search & Verification Form */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">1</span>
              LIC Policy Lookup
            </h3>

            {/* Quick Sample Selector */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">
                Quick Test Samples (Click to autofill):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(MOCK_LIC_SAMPLE_POLICIES).map((num) => {
                  const p = MOCK_LIC_SAMPLE_POLICIES[num];
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelectSample(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        policyNumber === num
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num} ({p.policyholderName.split(' ')[0]})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Policy Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                9-Digit LIC Policy Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="input-lic-policy-number"
                  type="text"
                  maxLength={9}
                  value={policyNumber}
                  onChange={(e) => {
                    setPolicyNumber(e.target.value.replace(/\D/g, '').slice(0, 9));
                    setFetchedPolicy(null);
                  }}
                  placeholder="e.g. 849201923"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-amber-600 focus:bg-white rounded-xl text-sm font-mono font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleFetchPolicy}
                  disabled={policyNumber.length < 8 || isSearching}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Verify Policy</span>
                </button>
              </div>
            </div>

            {/* Customer Contact & DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Mobile (for SMS e-Receipt) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">+91</span>
                  <input
                    id="input-lic-mobile"
                    type="tel"
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 digits"
                    className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-300 focus:border-amber-600 rounded-xl text-xs font-mono font-medium focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policyholder Date of Birth
                </label>
                <input
                  type="date"
                  value={customerDob}
                  onChange={(e) => setCustomerDob(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-amber-600 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Wallet & Commission info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Main Wallet Balance:</span>
                <span className="font-mono font-bold text-slate-800">₹{walletBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Premium Payment:</span>
                <span className="font-mono font-bold text-rose-600">-₹{finalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold border-t border-slate-200/60 pt-1">
                <span>Agent Commission (1.00%):</span>
                <span className="font-mono font-bold">+₹{estimatedCommission.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-lic-submit"
              type="button"
              disabled={!canProceed}
              onClick={handlePayLicPremium}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                canProceed
                  ? 'bg-amber-600 hover:bg-amber-700 text-white active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to LIC Central Payment Switch...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Pay LIC Premium ₹{finalAmount.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Verified Policy Schedule Card */}
        <div className="lg:col-span-6 space-y-4">
          {fetchedPolicy ? (
            <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    LIC
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Verified Policy Details</h4>
                    <span className="text-[11px] text-slate-500 font-mono">Policy #{fetchedPolicy.policyNumber}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  fetchedPolicy.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {fetchedPolicy.status === 'ACTIVE' ? 'Active / In Order' : 'Grace Period (Late Fee Applies)'}
                </span>
              </div>

              {/* Policyholder breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
                <div>
                  <span className="text-[10px] text-slate-500 block">Policyholder Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{fetchedPolicy.policyholderName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Plan Name:</span>
                  <span className="font-semibold text-slate-800">{fetchedPolicy.planName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sum Assured:</span>
                  <span className="font-bold font-mono text-slate-800">
                    ₹{fetchedPolicy.sumAssured.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Due Date:</span>
                  <span className="font-bold font-mono text-amber-800">{fetchedPolicy.dueDate}</span>
                </div>
              </div>

              {/* Payment Breakdown table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 border-b border-slate-200">
                  Premium Calculation Breakdown
                </div>
                <div className="divide-y divide-slate-100 p-3.5 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Installment Premium:</span>
                    <span className="font-mono font-medium text-slate-800">
                      ₹{fetchedPolicy.installmentPremium.toFixed(2)}
                    </span>
                  </div>
                  {fetchedPolicy.lateFee > 0 && (
                    <div className="flex justify-between text-amber-800 pt-1">
                      <span>Late Fee / Interest:</span>
                      <span className="font-mono font-medium">+₹{fetchedPolicy.lateFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>GST (Goods & Services Tax):</span>
                    <span className="font-mono font-medium text-emerald-700">Included (CGST+SGST)</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                    <span>Total Amount Payable:</span>
                    <span className="font-mono text-amber-700">₹{fetchedPolicy.totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* 80C Tax Benefit Notice */}
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl text-xs flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Income Tax Section 80C Eligible:</span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    This premium payment is eligible for income tax rebate up to ₹1,50,000 under Sec 80C. An official digital receipt will be generated.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl mx-auto flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Policy Loaded Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter a 9-digit LIC policy number on the left and click "Verify Policy" or click one of the quick test sample policy numbers above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal with 80C e-Receipt */}
      {licSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">LIC Premium Paid Successfully!</h3>
              <p className="text-xs text-slate-500">
                Official acknowledgment for policy <span className="font-mono font-bold text-slate-800">{licSuccess.policy.policyNumber}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Policyholder:</span>
                <span className="font-bold text-slate-800">{licSuccess.policy.policyholderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-medium text-slate-700">{licSuccess.policy.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Premium Paid:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">₹{licSuccess.tx.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">LIC Central RRN:</span>
                <span className="font-mono text-amber-700 font-semibold">{licSuccess.tx.rrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agent Commission (1%):</span>
                <span className="font-bold text-emerald-600 font-mono">+₹{licSuccess.tx.commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Authorized DigiSeva Kendra:</span>
                <span className="font-semibold text-slate-700">{agentProfile.shopName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onShowReceipt(licSuccess.tx);
                  setLicSuccess(null);
                }}
                className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Print 80C Tax Receipt
              </button>
              <button
                type="button"
                onClick={() => setLicSuccess(null)}
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
