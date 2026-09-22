import React, { useState } from 'react';
import { 
  Send, 
  UserCheck, 
  Plus, 
  Building, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Search, 
  ChevronRight,
  Sparkles,
  Phone,
  QrCode,
  Wallet
} from 'lucide-react';
import { Beneficiary, DmtMode, Transaction } from '../types';
import { INITIAL_BENEFICIARIES, POPULAR_BANKS } from '../data/mockData';
import { DynamicQrModal } from './DynamicQrModal';
import confetti from 'canvas-confetti';

interface DmtModuleProps {
  walletBalance: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'timeline' | 'rrn' | 'txnReference'>) => Promise<Transaction>;
  onShowReceipt: (tx: Transaction) => void;
  onFundWallet?: (amount: number, note: string) => void;
}

export const DmtModule: React.FC<DmtModuleProps> = ({
  walletBalance,
  onExecuteTransaction,
  onShowReceipt,
  onFundWallet,
}) => {
  // Remitter State
  const [remitterMobile, setRemitterMobile] = useState('9811234567');
  const [remitterName, setRemitterName] = useState('Ravi Shankar Sharma');
  const [isRemitterVerified, setIsRemitterVerified] = useState(true);

  // Dynamic QR Code State
  const [showQrModal, setShowQrModal] = useState(false);
  const [fundedToastMessage, setFundedToastMessage] = useState<string | null>(null);

  // Beneficiaries
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(INITIAL_BENEFICIARIES);
  const [selectedBenId, setSelectedBenId] = useState<string>('BEN-101');
  const [showAddBenModal, setShowAddBenModal] = useState(false);

  // New Ben Form
  const [newBenName, setNewBenName] = useState('');
  const [newBenAccount, setNewBenAccount] = useState('');
  const [newBenBank, setNewBenBank] = useState('State Bank of India');
  const [newBenIfsc, setNewBenIfsc] = useState('SBIN0001245');
  const [isVerifyingPennyDrop, setIsVerifyingPennyDrop] = useState(false);
  const [pennyDropVerified, setPennyDropVerified] = useState(false);

  // Transfer Form
  const [amount, setAmount] = useState<number | ''>(3500);
  const [transferMode, setTransferMode] = useState<DmtMode>('IMPS');
  const [remark, setRemark] = useState('Family Support');

  // Confirmation & Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('482910');

  // Quick Amount presets
  const quickAmounts = [1000, 2000, 5000, 10000, 15000];

  const selectedBen = beneficiaries.find(b => b.id === selectedBenId) || beneficiaries[0];

  // Fee calculation: 0.40% or min ₹5
  const numericAmount = typeof amount === 'number' ? amount : 0;
  const surchargeFee = numericAmount > 0 ? Math.max(5, Number((numericAmount * 0.004).toFixed(2))) : 0;
  // Agent commission: 0.35%
  const agentCommission = numericAmount > 0 ? Number((numericAmount * 0.0035).toFixed(2)) : 0;
  const netFloatDeduction = numericAmount + surchargeFee - agentCommission;

  // Monthly limit tracking
  const monthlyLimit = 25000;
  const usedThisMonth = 8500;
  const remainingLimit = monthlyLimit - usedThisMonth;

  const handlePennyDropVerify = () => {
    if (!newBenAccount || !newBenIfsc) return;
    setIsVerifyingPennyDrop(true);
    setTimeout(() => {
      setIsVerifyingPennyDrop(false);
      setPennyDropVerified(true);
      if (!newBenName) {
        setNewBenName('Ramesh Kumar Verma (Verified by Bank)');
      }
    }, 900);
  };

  const handleAddNewBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBenAccount || !newBenBank) return;

    const newBen: Beneficiary = {
      id: `BEN-${Date.now().toString().slice(-4)}`,
      name: newBenName || 'Beneficiary A/c Holder',
      accountNumber: newBenAccount,
      bankName: newBenBank,
      ifsc: newBenIfsc || 'SBIN0000001',
      verified: pennyDropVerified,
    };

    setBeneficiaries([newBen, ...beneficiaries]);
    setSelectedBenId(newBen.id);
    setShowAddBenModal(false);
    setNewBenName('');
    setNewBenAccount('');
    setPennyDropVerified(false);
  };

  const handleInitiateTransfer = () => {
    if (!numericAmount || numericAmount <= 0) return;
    if (numericAmount > remainingLimit) {
      alert(`Amount exceeds remitter's remaining monthly limit of ₹${remainingLimit.toLocaleString('en-IN')}`);
      return;
    }
    if (netFloatDeduction > walletBalance) {
      alert(`Insufficient Float Balance! You need ₹${netFloatDeduction.toFixed(2)}, but have ₹${walletBalance.toFixed(2)} in your float.`);
      return;
    }
    setShowOtpModal(true);
  };

  const handleConfirmTransfer = async () => {
    setShowOtpModal(false);
    setIsProcessing(true);

    try {
      const generatedUtr = `CMS${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

      const newTx = await onExecuteTransaction({
        service: 'DMT',
        subtype: `${transferMode} Money Transfer`,
        status: 'SUCCESS',
        amount: numericAmount,
        fee: surchargeFee,
        commission: agentCommission,
        customerName: selectedBen.name,
        customerMobile: remitterMobile,
        accountOrAadhaarOrConsumer: selectedBen.accountNumber,
        bankOrOperator: selectedBen.bankName,
        ifsc: selectedBen.ifsc,
        mode: transferMode,
        utr: generatedUtr,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      onShowReceipt(newTx);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Remitter Profile Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-900">{remitterName}</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Full KYC Active
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" /> +91 {remitterMobile}
                </span>
                <span className="text-slate-300">•</span>
                <span>Tier 1 Remitter (RBI DMT)</span>
              </div>
            </div>
          </div>

          {/* Monthly DMT Limit Gauge */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 min-w-[240px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">Monthly Limit:</span>
              <span className="font-bold text-slate-800 font-mono">₹{remainingLimit.toLocaleString('en-IN')} Left</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(usedThisMonth / monthlyLimit) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Used: ₹{usedThisMonth.toLocaleString('en-IN')}</span>
              <span>Max: ₹{monthlyLimit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Beneficiary Selection & Add */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Beneficiary</h3>
                <p className="text-xs text-slate-500">Choose recipient bank account or register a new one</p>
              </div>
              <button
                id="btn-add-beneficiary"
                onClick={() => setShowAddBenModal(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Beneficiary</span>
              </button>
            </div>

            {/* Beneficiaries List */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {beneficiaries.map((ben) => {
                const isSelected = ben.id === selectedBenId;
                return (
                  <div
                    key={ben.id}
                    id={`ben-card-${ben.id}`}
                    onClick={() => setSelectedBenId(ben.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{ben.name}</span>
                          {ben.verified && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>{ben.bankName}</span>
                          <span>•</span>
                          <span>A/c: ...{ben.accountNumber.slice(-4)}</span>
                          <span>•</span>
                          <span>IFSC: {ben.ifsc}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Beneficiary Details Bar */}
          {selectedBen && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Destination Account</span>
                <div className="text-sm font-bold mt-0.5 text-slate-100">{selectedBen.name}</div>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  {selectedBen.bankName} — A/c: {selectedBen.accountNumber} ({selectedBen.ifsc})
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  Instant IMPS Direct Credit
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Amount, Mode, Cost Breakdown & Transfer Button */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transfer Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">₹</span>
                <input
                  id="input-dmt-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Enter amount (min ₹100)"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-base font-bold text-slate-900 font-mono focus:outline-none transition-colors"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
                      amount === q
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    +₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Transfer Switch Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['IMPS', 'NEFT', 'RTGS'] as DmtMode[]).map((mode) => (
                  <button
                    key={mode}
                    id={`btn-mode-${mode}`}
                    type="button"
                    onClick={() => setTransferMode(mode)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      transferMode === mode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div>{mode}</div>
                    <div className={`text-[10px] font-normal mt-0.5 ${transferMode === mode ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {mode === 'IMPS' ? 'Instant 24x7' : mode === 'NEFT' ? 'Batch Clearing' : 'High Value'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Breakdown Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Beneficiary Receives:</span>
                <span className="font-mono font-bold text-slate-900">₹{numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">Customer Surcharge (0.4%):</span>
                <span className="font-mono text-slate-700">+₹{surchargeFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Agent Commission (0.35%):
                </span>
                <span className="font-mono font-bold">+₹{agentCommission.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-900 font-bold">
                <span>Net Debit from Agent Float:</span>
                <span className="font-mono text-indigo-700">₹{netFloatDeduction.toFixed(2)}</span>
              </div>
            </div>

            {/* Float Fund Success Notification */}
            {fundedToastMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{fundedToastMessage}</span>
              </div>
            )}

            {/* Insufficient Float Warning with 1-click QR trigger */}
            {numericAmount > 0 && netFloatDeduction > walletBalance && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Float Balance Insufficient</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      You need ₹{netFloatDeduction.toFixed(2)} but have ₹{walletBalance.toFixed(2)}. Generate a dynamic QR so the customer can pay via UPI and fund your float immediately!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Generate Dynamic QR to Fund ₹{(numericAmount + surchargeFee).toFixed(2)}</span>
                </button>
              </div>
            )}

            {/* Action Buttons: Dynamic QR Collection & Transfer Submission */}
            <div className="space-y-2">
              <button
                id="btn-open-dynamic-qr"
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                title="Customer pays via UPI (GPay, PhonePe, Paytm, BHIM) to fund the agent wallet instantly"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Receive via Dynamic UPI QR (₹{(numericAmount + surchargeFee).toFixed(2)})</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-semibold">
                  Instant Float
                </span>
              </button>

              <button
                id="btn-initiate-dmt"
                type="button"
                disabled={isProcessing || !numericAmount || numericAmount <= 0 || netFloatDeduction > walletBalance}
                onClick={handleInitiateTransfer}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Processing through NPCI Switch...</span>
                  </div>
                ) : (
                  <>
                    <span>Send ₹{numericAmount ? numericAmount.toLocaleString('en-IN') : '0'} via {transferMode}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              NPCI IMPS Switch Instant Settlement Guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Add Beneficiary Modal */}
      {showAddBenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Beneficiary</h3>
                <p className="text-xs text-slate-500">Register account for instant money transfers</p>
              </div>
              <button
                onClick={() => setShowAddBenModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewBeneficiary} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Bank</label>
                <select
                  value={newBenBank}
                  onChange={(e) => setNewBenBank(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600"
                >
                  {POPULAR_BANKS.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={newBenAccount}
                  onChange={(e) => setNewBenAccount(e.target.value)}
                  placeholder="e.g. 32918849201"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={newBenIfsc}
                  onChange={(e) => setNewBenIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001245"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Penny drop verification button */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Penny Drop Verification
                  </div>
                  <div className="text-[11px] text-indigo-700">Verifies account holder name directly with bank</div>
                </div>
                <button
                  type="button"
                  onClick={handlePennyDropVerify}
                  disabled={isVerifyingPennyDrop || !newBenAccount || pennyDropVerified}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pennyDropVerified
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300'
                  }`}
                >
                  {isVerifyingPennyDrop ? 'Checking...' : pennyDropVerified ? '✓ Verified' : 'Verify (₹1)'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={newBenName}
                  onChange={(e) => setNewBenName(e.target.value)}
                  placeholder="Name as per bank records"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBenModal(false)}
                  className="w-1/2 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Beneficiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP / PIN Authorization Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Authorize Transfer</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter customer OTP or Agent MPIN to route transaction through NPCI Switch
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold text-slate-800">{selectedBen.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900 font-mono">₹{numericAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mode:</span>
                <span className="font-bold text-indigo-600">{transferMode}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                6-Digit Security OTP (Simulated: 482910)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 bg-slate-100 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-1/2 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-dmt-otp"
                type="button"
                onClick={handleConfirmTransfer}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Customer Payment QR Modal */}
      <DynamicQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        amount={numericAmount || 0}
        surcharge={surchargeFee}
        customerName={remitterName}
        customerMobile={remitterMobile}
        onPaymentReceived={(fundedAmount) => {
          onFundWallet?.(fundedAmount, 'Customer UPI Dynamic QR');
          setFundedToastMessage(`Payment of ₹${fundedAmount.toFixed(2)} received via UPI! Agent float funded successfully.`);
          setTimeout(() => setFundedToastMessage(null), 6000);
        }}
      />
    </div>
  );
};
