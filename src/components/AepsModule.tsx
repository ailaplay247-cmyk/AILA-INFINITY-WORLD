import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Banknote, 
  HelpCircle, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ArrowDownLeft, 
  Cpu,
  Search,
  Check,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { AepsSubtype, Bank, Transaction, BiometricAuditAttempt } from '../types';
import { POPULAR_BANKS, INITIAL_BIOMETRIC_AUDIT_LOGS } from '../data/mockData';
import { BiometricAuditModal } from './BiometricAuditModal';
import { BiometricAuditLog } from './BiometricAuditLog';
import confetti from 'canvas-confetti';

const SUBTYPE_LABELS: Record<AepsSubtype, string> = {
  CASH_WITHDRAWAL: 'Cash Withdrawal',
  BALANCE_ENQUIRY: 'Balance Enquiry',
  MINI_STATEMENT: 'Mini Statement',
  AADHAAR_PAY: 'Aadhaar Pay',
};

interface AepsModuleProps {
  cashInDrawer: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'timeline' | 'rrn' | 'txnReference'>) => Promise<Transaction>;
  onShowReceipt: (tx: Transaction) => void;
}

export const AepsModule: React.FC<AepsModuleProps> = ({
  cashInDrawer,
  onExecuteTransaction,
  onShowReceipt,
}) => {
  const [activeSubtype, setActiveSubtype] = useState<AepsSubtype>('CASH_WITHDRAWAL');

  // Customer Data
  const [aadhaarNumber, setAadhaarNumber] = useState('482091828421');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [customerMobile, setCustomerMobile] = useState('9876501234');
  const [selectedBankId, setSelectedBankId] = useState('pnb');
  const [bankSearch, setBankSearch] = useState('');
  const [amount, setAmount] = useState<number | ''>(2000);

  // Biometric scanner state
  const [selectedDevice, setSelectedDevice] = useState('Mantra MFS100 (RD Service v1.0.4)');
  const [isScanning, setIsScanning] = useState(false);
  const [scanQuality, setScanQuality] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  const [aepsViewMode, setAepsViewMode] = useState<'TERMINAL' | 'AUDIT_LOG'>('TERMINAL');

  // Biometric Audit Log state (persisted locally)
  const [auditLogs, setAuditLogs] = useState<BiometricAuditAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('digiagent_biometric_audit');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      /* ignore */
    }
    return INITIAL_BIOMETRIC_AUDIT_LOGS;
  });

  const [showAuditModal, setShowAuditModal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('digiagent_biometric_audit', JSON.stringify(auditLogs));
    } catch (e) {
      /* ignore */
    }
  }, [auditLogs]);

  const handleSimulateTestCapture = (
    simulatedQuality: number, 
    simulatedStatus: 'SUCCESS' | 'FAILED', 
    failureReason?: string
  ) => {
    const now = new Date();
    const formattedTimestamp = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newAttempt: BiometricAuditAttempt = {
      id: `BIO-LOG-${Date.now().toString().slice(-4)}`,
      timestamp: formattedTimestamp,
      rawTimestamp: Date.now(),
      deviceModel: selectedDevice,
      serviceType: SUBTYPE_LABELS[activeSubtype],
      aadhaarMasked: `XXXX-XXXX-${aadhaarNumber.slice(-4)}`,
      bankName: selectedBank.name,
      qualityScore: simulatedQuality,
      minRequiredScore: 65,
      status: simulatedStatus,
      errorCode: simulatedStatus === 'SUCCESS' ? 'NPCI-00' : simulatedQuality < 45 ? 'RD-104' : 'RD-101',
      failureReason: failureReason,
      nfiqScore: simulatedQuality >= 90 ? 1 : simulatedQuality >= 75 ? 2 : simulatedQuality >= 65 ? 3 : 4,
      captureDurationMs: Math.floor(1050 + Math.random() * 800),
    };

    setAuditLogs(prev => [newAttempt, ...prev]);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to reset the biometric capture audit log?')) {
      setAuditLogs([]);
    }
  };

  // Result notification modal
  const [lastResult, setLastResult] = useState<{
    balance?: number;
    amount?: number;
    rrn?: string;
    authCode?: string;
    commission?: number;
  } | null>(null);

  const selectedBank = POPULAR_BANKS.find(b => b.id === selectedBankId) || POPULAR_BANKS[0];

  const quickAmounts = [500, 1000, 2000, 3000, 5000, 10000];

  const filteredBanks = POPULAR_BANKS.filter(b => 
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.code.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Commission calculation based on AePS slab:
  // ₹100-₹499: ₹0.25 | ₹500-₹999: ₹1.50 | ₹1000-₹1499: ₹3.50 | ₹1500-₹2999: ₹5.50 | ₹3000-₹10000: ₹10.00
  // Non-financial (Balance Enquiry / Mini Statement): ₹1.50 flat
  const numericAmount = typeof amount === 'number' ? amount : 0;
  let calculatedCommission = 1.5;
  if (activeSubtype === 'CASH_WITHDRAWAL' || activeSubtype === 'AADHAAR_PAY') {
    if (numericAmount >= 3000) calculatedCommission = 10.0;
    else if (numericAmount >= 1500) calculatedCommission = 5.5;
    else if (numericAmount >= 1000) calculatedCommission = 3.5;
    else if (numericAmount >= 500) calculatedCommission = 1.5;
    else calculatedCommission = 0.25;
  }

  // Format Aadhaar display (e.g. XXXX-XXXX-8421)
  const formatAadhaar = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 12);
    return cleaned;
  };

  const getMaskedAadhaar = (val: string) => {
    if (val.length < 4) return val;
    const last4 = val.slice(-4);
    if (!showAadhaar) {
      return `XXXX-XXXX-${last4}`;
    }
    return `${val.slice(0, 4)}-${val.slice(4, 8)}-${last4}`;
  };

  // Simulate Biometric capture
  const handleCaptureFingerprint = () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      alert('Please enter a valid 12-digit Aadhaar Number');
      return;
    }
    if (!consentChecked) {
      alert('Customer consent is mandatory for Aadhaar biometric authentication');
      return;
    }
    if (activeSubtype === 'CASH_WITHDRAWAL' && numericAmount > cashInDrawer) {
      alert(`Insufficient cash in counter! Counter has ₹${cashInDrawer.toLocaleString('en-IN')}, but requested withdrawal is ₹${numericAmount.toLocaleString('en-IN')}`);
      return;
    }

    setIsScanning(true);
    setScanQuality(null);

    const scanStartTime = Date.now();

    // Realistic optical scanning simulation
    setTimeout(() => {
      const quality = Math.floor(88 + Math.random() * 9); // 88% - 96%
      const duration = Date.now() - scanStartTime;
      setScanQuality(quality);
      setIsScanning(false);

      const now = new Date();
      const formattedTimestamp = now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // Record biometric capture in audit log
      const isPass = quality >= 65;
      const newAttempt: BiometricAuditAttempt = {
        id: `BIO-LOG-${Date.now().toString().slice(-4)}`,
        timestamp: formattedTimestamp,
        rawTimestamp: Date.now(),
        deviceModel: selectedDevice,
        serviceType: SUBTYPE_LABELS[activeSubtype],
        aadhaarMasked: `XXXX-XXXX-${aadhaarNumber.slice(-4)}`,
        bankName: selectedBank.name,
        qualityScore: quality,
        minRequiredScore: 65,
        status: isPass ? 'SUCCESS' : 'FAILED',
        errorCode: isPass ? 'NPCI-00' : 'RD-101',
        failureReason: isPass ? undefined : 'Fingerprint quality below UIDAI 65% statutory threshold. Please clean sensor.',
        nfiqScore: quality >= 90 ? 1 : quality >= 75 ? 2 : 3,
        captureDurationMs: duration,
      };

      setAuditLogs(prev => [newAttempt, ...prev]);

      // Auto-trigger switch authentication if passed
      if (isPass) {
        processAepsTransaction(quality);
      } else {
        alert(`Fingerprint scan quality is ${quality}%, which is below the mandatory UIDAI 65% statutory threshold. Transaction halted. Please check audit log.`);
      }
    }, 1800);
  };

  const processAepsTransaction = async (quality: number) => {
    setIsExecuting(true);

    try {
      const generatedRrn = `6265${Math.floor(10000000 + Math.random() * 90000000)}`;
      const generatedAuth = `${Math.floor(100000 + Math.random() * 900000)}`;
      const simulatedRemainingBalance = Math.floor(5400 + Math.random() * 45000);

      const miniStmtSample = [
        { date: '21/09/2026', type: 'CR' as const, amount: 2000.0, narration: 'PM-KISAN DBT Direct' },
        { date: '19/09/2026', type: 'DR' as const, amount: 500.0, narration: 'AePS Cash WDL Counter' },
        { date: '14/09/2026', type: 'DR' as const, amount: 853.0, narration: 'BBPS Gas Refill Booking' },
        { date: '10/09/2026', type: 'CR' as const, amount: 150.0, narration: 'Govt Subsidy DBT' },
        { date: '04/09/2026', type: 'DR' as const, amount: 250.0, narration: 'POS Kirana Purchase' },
      ];

      const newTx = await onExecuteTransaction({
        service: 'AEPS',
        subtype: SUBTYPE_LABELS[activeSubtype],
        status: 'SUCCESS',
        amount: activeSubtype === 'CASH_WITHDRAWAL' || activeSubtype === 'AADHAAR_PAY' ? numericAmount : 0,
        fee: 0,
        commission: calculatedCommission,
        customerName: 'Aadhaar Bank Customer',
        customerMobile: customerMobile,
        accountOrAadhaarOrConsumer: `XXXX-XXXX-${aadhaarNumber.slice(-4)}`,
        bankOrOperator: selectedBank.name,
        balanceRemaining: simulatedRemainingBalance,
        miniStatement: activeSubtype === 'MINI_STATEMENT' ? miniStmtSample : undefined,
      });

      setLastResult({
        balance: simulatedRemainingBalance,
        amount: numericAmount,
        rrn: generatedRrn,
        authCode: generatedAuth,
        commission: calculatedCommission,
      });

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      onShowReceipt(newTx);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top AePS Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            id="btn-aeps-view-terminal"
            onClick={() => setAepsViewMode('TERMINAL')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              aepsViewMode === 'TERMINAL'
                ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>AePS Terminal</span>
          </button>
          <button
            type="button"
            id="btn-aeps-view-audit"
            onClick={() => setAepsViewMode('AUDIT_LOG')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              aepsViewMode === 'AUDIT_LOG'
                ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Biometric Audit Log</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full font-mono font-bold">
              {auditLogs.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">RD Service Status:</span>
          <span className="font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
            Ready (UIDAI L0/L1)
          </span>
        </div>
      </div>

      {aepsViewMode === 'AUDIT_LOG' ? (
        <BiometricAuditLog
          logs={auditLogs}
          onClearLogs={handleClearLogs}
          onSimulateTestCapture={handleSimulateTestCapture}
        />
      ) : (
        <>
          {/* Service Subtype Selector Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
            {[
              { id: 'CASH_WITHDRAWAL' as AepsSubtype, label: 'Cash Withdrawal', icon: Banknote, desc: 'Dispense cash & earn commission' },
              { id: 'BALANCE_ENQUIRY' as AepsSubtype, label: 'Balance Enquiry', icon: HelpCircle, desc: 'Real-time account balance' },
              { id: 'MINI_STATEMENT' as AepsSubtype, label: 'Mini Statement', icon: FileText, desc: 'Last 5 banking transactions' },
              { id: 'AADHAAR_PAY' as AepsSubtype, label: 'Aadhaar Pay', icon: CreditCard, desc: 'High value customer purchases' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubtype === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-aeps-${tab.id.toLowerCase()}`}
                  type="button"
                  onClick={() => setActiveSubtype(tab.id)}
                  className={`flex-1 min-w-[160px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 text-indigo-950'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs">{tab.label}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-10 hidden sm:block">
                    {tab.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bank Selection & Aadhaar Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  Select Customer's Bank
                </label>
                <span className="text-[11px] text-slate-400 font-mono">IIN: {selectedBank.iin}</span>
              </div>

              {/* Bank quick chips */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {POPULAR_BANKS.slice(0, 8).map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer truncate ${
                      selectedBankId === bank.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                    }`}
                  >
                    {bank.code}
                  </button>
                ))}
              </div>

              {/* Searchable Bank dropdown */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Or search other banks (e.g. Canara, Union, IPPB)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              {bankSearch && (
                <div className="mt-1 max-h-36 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg p-1">
                  {filteredBanks.map(b => (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBankId(b.id);
                        setBankSearch('');
                      }}
                      className="px-3 py-2 hover:bg-indigo-50 rounded-lg text-xs font-medium cursor-pointer flex justify-between"
                    >
                      <span>{b.name}</span>
                      <span className="text-slate-400 font-mono">{b.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aadhaar Input with 4-4-4 formatting */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Customer Aadhaar Number (UID / VID)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAadhaar(!showAadhaar)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {showAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showAadhaar ? 'Mask UID' : 'Show Digits'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  id="input-aeps-aadhaar"
                  type="text"
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value))}
                  placeholder="12-digit Aadhaar Number"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:border-indigo-600 focus:bg-white font-bold"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                  {aadhaarNumber.length}/12
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                Preview: {getMaskedAadhaar(aadhaarNumber)}
              </p>
            </div>

            {/* Customer Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Customer Mobile Number (for SMS confirmation)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-500 text-xs font-mono font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-r-xl text-xs font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Amount Field (Only for Cash Withdrawal or Aadhaar Pay) */}
            {(activeSubtype === 'CASH_WITHDRAWAL' || activeSubtype === 'AADHAAR_PAY') && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">₹</span>
                  <input
                    id="input-aeps-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter amount (multiples of ₹100 up to ₹10,000)"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
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
                      ₹{q.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Statutory Aadhaar Consent Checkbox */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  I hereby declare that the customer has provided biometric consent to authenticate with UIDAI/NPCI for this AePS transaction as per UIDAI Regulations 2016.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Biometric Device Scanner & Action */}
        <div className="lg:col-span-5 space-y-4">
          {/* RD Service Device Status Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Biometric RD Service</h3>
                <p className="text-xs text-slate-500">Aadhaar Certified Scanner</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-open-biometric-audit-header"
                  type="button"
                  onClick={() => setShowAuditModal(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer shadow-2xs"
                  title="View detailed fingerprint capture timestamps, quality scores, and success/failure logs"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Audit Log ({auditLogs.length})</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready</span>
                </div>
              </div>
            </div>

            {/* Device Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Connected Biometric Scanner
                </label>
                <button
                  type="button"
                  onClick={() => setShowAuditModal(true)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Capture Telemetry</span>
                </button>
              </div>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="Mantra MFS100 (RD Service v1.0.4)">Mantra MFS100 (Optical USB)</option>
                <option value="Morpho Safran MSO 1300 E3">Morpho Safran MSO 1300 E3</option>
                <option value="Startek FM220 ACPL">Startek FM220 Certified RD</option>
                <option value="SecuGen Hamster Pro 20">SecuGen Hamster Pro 20</option>
              </select>
            </div>

            {/* Interactive Biometric Scanner Pad */}
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 text-center text-white border border-slate-800 shadow-inner">
              {/* Laser beam animation during scan */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-[0_0_15px_#22d3ee]" />
              )}

              <div className="relative mx-auto w-24 h-24 rounded-2xl bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center mb-3 group cursor-pointer hover:border-indigo-500 transition-colors">
                <Fingerprint className={`w-14 h-14 transition-all duration-300 ${
                  isScanning 
                    ? 'text-cyan-400 scale-110 animate-pulse' 
                    : scanQuality 
                    ? 'text-emerald-400' 
                    : 'text-slate-500 group-hover:text-slate-400'
                }`} />

                {scanQuality && (
                  <div className="absolute -bottom-2 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
                    {scanQuality}% QUALITY
                  </div>
                )}
              </div>

              <div className="text-xs font-semibold text-slate-200">
                {isScanning 
                  ? 'Capturing Fingerprint from Sensor...' 
                  : scanQuality 
                  ? 'Fingerprint Captured Successfully!' 
                  : 'Place Customer Thumb / Index Finger'}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedBank.name} • {selectedDevice.split(' ')[0]}
              </p>

              {scanQuality && (
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(true)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 hover:text-cyan-200 bg-slate-800/90 border border-cyan-500/40 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                  >
                    <span>View capture in Audit Log ({scanQuality}%)</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {/* Commission Earned Preview */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> Agent Commission:
                </span>
                <span className="font-bold text-emerald-300 font-mono text-sm">+₹{calculatedCommission.toFixed(2)}</span>
              </div>
            </div>

            {/* Scan & Submit Button */}
            <button
              id="btn-aeps-capture-scan"
              type="button"
              disabled={isScanning || isExecuting || !consentChecked}
              onClick={handleCaptureFingerprint}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {isScanning ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning RD Sensor...</span>
                </div>
              ) : isExecuting ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Routing to NPCI AePS Switch...</span>
                </div>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  <span>Capture Fingerprint & Authenticate</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>UIDAI 2048-bit PKI Encrypted</span>
              </div>
              <button
                type="button"
                onClick={() => setAepsViewMode('AUDIT_LOG')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline decoration-dotted"
              >
                View Audit Trail ({auditLogs.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )}

      {/* Biometric Capture Audit Modal */}
      <BiometricAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        auditLogs={auditLogs}
        onClearLogs={handleClearLogs}
        onSimulateTestCapture={handleSimulateTestCapture}
      />
    </div>
  );
};
