import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  FileText,
  User,
  HeartHandshake,
  Car,
  Activity,
  Lock,
  Store,
  RefreshCw,
  Search,
  Check,
  ChevronRight
} from 'lucide-react';
import { Transaction, AgentProfile, InsuranceProduct } from '../types';
import { MOCK_INSURANCE_PRODUCTS } from '../data/mockData';

interface InsuranceModuleProps {
  walletBalance: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onShowReceipt: (tx: Transaction) => void;
  agentProfile: AgentProfile;
}

export const InsuranceModule: React.FC<InsuranceModuleProps> = ({
  walletBalance,
  onExecuteTransaction,
  onShowReceipt,
  agentProfile,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct>(MOCK_INSURANCE_PRODUCTS[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAadhaar, setCustomerAadhaar] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [vehicleRegNumber, setVehicleRegNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [policySuccess, setPolicySuccess] = useState<{
    tx: Transaction;
    policyNumber: string;
    insurer: string;
  } | null>(null);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'MOTOR' | 'HEALTH' | 'ACCIDENT' | 'CYBER' | 'SHOP'>('ALL');

  const filteredProducts = MOCK_INSURANCE_PRODUCTS.filter(p =>
    selectedCategory === 'ALL' ? true : p.category === selectedCategory
  );

  // Commission is 15% - 20% on micro-insurance
  const commissionRate = selectedProduct.category === 'MOTOR' ? 0.15 : 0.18;
  const estimatedCommission = +(selectedProduct.premium * commissionRate).toFixed(2);

  const isMotor = selectedProduct.category === 'MOTOR';

  const canProceed =
    customerName.trim().length >= 3 &&
    customerMobile.length === 10 &&
    nomineeName.trim().length >= 3 &&
    (!isMotor || vehicleRegNumber.trim().length >= 6) &&
    walletBalance >= selectedProduct.premium &&
    !isProcessing;

  const handleIssuePolicy = () => {
    if (!canProceed) return;
    setIsProcessing(true);

    const rrn = '6265' + Math.floor(10000000 + Math.random() * 90000000);
    const policyNumber = `POL-${selectedProduct.insurer.slice(0, 4).toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    setTimeout(() => {
      const newTx: Omit<Transaction, 'id' | 'timestamp'> = {
        txnReference: `INS${Date.now().toString().slice(-8)}`,
        rrn,
        service: 'INSURANCE',
        subtype: `${selectedProduct.title} (Policy: ${policyNumber})`,
        status: 'SUCCESS',
        amount: selectedProduct.premium,
        fee: 0,
        commission: estimatedCommission,
        customerName: customerName.trim(),
        customerMobile,
        accountOrAadhaarOrConsumer: isMotor ? vehicleRegNumber.toUpperCase() : policyNumber,
        bankOrOperator: selectedProduct.insurer,
        timeline: [
          { step: 'Customer Proposal Verified', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Nominee: ${nomineeName} (${nomineeRelation})` },
          { step: 'Insurer Underwriting Gateway', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `${selectedProduct.insurer} Accepted` },
          { step: 'Certificate Issued & Dispatched', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Policy #${policyNumber}` },
          { step: 'POSP Agent Margin Credited', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `+₹${estimatedCommission} commission added` },
        ],
      };

      onExecuteTransaction(newTx);
      setIsProcessing(false);

      const completeTx: Transaction = {
        ...newTx,
        id: `TXN-${Math.floor(90000 + Math.random() * 10000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      setPolicySuccess({
        tx: completeTx,
        policyNumber,
        insurer: selectedProduct.insurer,
      });
    }, 1300);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">DigiSeva Micro-Insurance Portal</h2>
                <span className="text-[11px] font-bold bg-emerald-400/30 text-white border border-emerald-300/40 px-2 py-0.5 rounded-full">
                  IRDAI POSP Certified
                </span>
              </div>
              <p className="text-emerald-100 text-sm mt-0.5">
                Instant policy issuance for Two-Wheeler, HospiCash, Personal Accident, Cyber Safe & Merchant Kiosk
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-[10px] text-emerald-200 uppercase font-semibold">POSP Commission</div>
              <div className="text-sm font-bold text-white font-mono">15.00% to 20.00% High Margin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'ALL', label: 'All Insurance Plans' },
            { id: 'MOTOR', label: 'Two-Wheeler (Motor)' },
            { id: 'HEALTH', label: 'HospiCash (Health)' },
            { id: 'ACCIDENT', label: 'Personal Accident (₹5L)' },
            { id: 'CYBER', label: 'Cyber Fraud Protection' },
            { id: 'SHOP', label: 'Shopkeeper / Kiosk Cover' },
          ] as const
        ).map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Form Left, Product Browser Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Policy Issuance Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
              Customer & Nominee Information
            </h3>

            {/* Customer Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Insured Person Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-ins-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="As per Aadhaar / PAN card"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            {/* Mobile & Aadhaar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">+91</span>
                  <input
                    id="input-ins-mobile"
                    type="tel"
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 digits"
                    className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl text-xs font-mono font-medium focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aadhaar (Last 4 digits)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={customerAadhaar}
                  onChange={(e) => setCustomerAadhaar(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="e.g. 4819"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl text-xs font-mono font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Motor Specific: Vehicle Number */}
            {isMotor && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Registration Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-ins-vehicle"
                  type="text"
                  value={vehicleRegNumber}
                  onChange={(e) => setVehicleRegNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. DL-01-AB-4921"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-xs font-mono font-bold focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Vahan portal vehicle records will be auto-linked to policy certificate.</span>
              </div>
            )}

            {/* Nominee Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominee Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominee Relationship <span className="text-rose-500">*</span>
                </label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl text-xs font-medium focus:outline-none"
                >
                  <option value="Spouse">Spouse (Wife/Husband)</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                </select>
              </div>
            </div>

            {/* Selected Plan Details Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span>{selectedProduct.title}</span>
                <span className="text-base font-extrabold font-mono text-emerald-800">₹{selectedProduct.premium}</span>
              </div>
              <div className="text-slate-600">Insurer: <span className="font-semibold text-slate-800">{selectedProduct.insurer}</span></div>
              <div className="text-[11px] font-semibold text-emerald-800">
                🛡️ Sum Insured / Cover: {selectedProduct.coverAmount}
              </div>
            </div>

            {/* Wallet & Commission */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Main Wallet Balance:</span>
                <span className="font-mono font-bold text-slate-800">₹{walletBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Premium Deducted:</span>
                <span className="font-mono font-bold text-rose-600">-₹{selectedProduct.premium.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold border-t border-slate-200/60 pt-1">
                <span>POSP Agent Commission:</span>
                <span className="font-mono font-bold">+₹{estimatedCommission.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-ins-submit"
              type="button"
              disabled={!canProceed}
              onClick={handleIssuePolicy}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                canProceed
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Issuing Underwritten Policy Schedule...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Issue Policy Certificate ₹{selectedProduct.premium.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Insurance Product Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">2</span>
                Select Micro-Insurance Policy
              </h3>
              <p className="text-xs text-slate-500">Government approved point-of-sale plans with instant digital issuance</p>
            </div>

            <div className="space-y-3.5">
              {filteredProducts.map((product) => {
                const isSelected = selectedProduct.id === product.id;
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {product.insurer}
                        </span>
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          ₹{product.premium}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 font-mono">
                          / {product.validity}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900">{product.title}</h4>
                      <p className="text-xs text-slate-600 leading-snug">{product.description}</p>

                      <div className="text-[11px] font-semibold text-emerald-800 pt-0.5">
                        🛡️ Cover: {product.coverAmount}
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {product.keyBenefits.slice(0, 2).map((b, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-emerald-100/70 text-emerald-900 px-2 py-0.5 rounded-md"
                          >
                            ✓ {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-emerald-700 font-mono">
                        +₹{(product.premium * (product.category === 'MOTOR' ? 0.15 : 0.18)).toFixed(2)} comm.
                      </span>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
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

      {/* Success Modal */}
      {policySuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Insurance Policy Issued!</h3>
              <p className="text-xs text-slate-500">
                Official policy certificate active for <span className="font-bold text-slate-800">{policySuccess.tx.customerName}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Policy Number:</span>
                <span className="font-bold font-mono text-emerald-800">{policySuccess.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Underwriting Insurer:</span>
                <span className="font-bold text-slate-800">{policySuccess.insurer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Premium Paid:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">₹{policySuccess.tx.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agent POSP Commission:</span>
                <span className="font-bold text-emerald-600 font-mono">+₹{policySuccess.tx.commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">POSP Center:</span>
                <span className="font-semibold text-slate-700">{agentProfile.shopName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onShowReceipt(policySuccess.tx);
                  setPolicySuccess(null);
                }}
                className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Print Policy Certificate
              </button>
              <button
                type="button"
                onClick={() => setPolicySuccess(null)}
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
