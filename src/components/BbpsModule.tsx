import React, { useState } from 'react';
import { 
  Zap, 
  Flame, 
  Droplet, 
  Smartphone, 
  Car, 
  Tv, 
  Wifi, 
  Search, 
  FileCheck2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Receipt,
  Calendar,
  User,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { BbpsCategory, Biller, Transaction } from '../types';
import { BBPS_BILLERS } from '../data/mockData';
import confetti from 'canvas-confetti';

interface BbpsModuleProps {
  walletBalance: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'timeline' | 'rrn' | 'txnReference'>) => Promise<Transaction>;
  onShowReceipt: (tx: Transaction) => void;
}

export const BbpsModule: React.FC<BbpsModuleProps> = ({
  walletBalance,
  onExecuteTransaction,
  onShowReceipt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BbpsCategory>('ELECTRICITY');
  const [selectedBillerId, setSelectedBillerId] = useState('adani-elec');
  const [billerSearch, setBillerSearch] = useState('');

  // Bill parameters
  const [consumerParam, setConsumerParam] = useState('100928392');
  const [customerMobile, setCustomerMobile] = useState('9811234567');

  // Fetched bill state
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedBill, setFetchedBill] = useState<{
    customerName: string;
    billNumber: string;
    dueDate: string;
    billPeriod: string;
    amount: number;
  } | null>({
    customerName: 'Meena Saxena',
    billNumber: 'BILL/MUM/89201',
    dueDate: '2026-09-28',
    billPeriod: '01 Aug 2026 - 31 Aug 2026',
    amount: 2450.0,
  });

  const [isPaying, setIsPaying] = useState(false);

  // Categories config
  const categories: Array<{ id: BbpsCategory; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'ELECTRICITY', label: 'Electricity', icon: Zap },
    { id: 'GAS_CYLINDER', label: 'LPG Gas', icon: Flame },
    { id: 'WATER', label: 'Water Bill', icon: Droplet },
    { id: 'MOBILE_POSTPAID', label: 'Mobile Postpaid', icon: Smartphone },
    { id: 'FASTAG', label: 'FASTag', icon: Car },
    { id: 'DTH', label: 'DTH TV', icon: Tv },
    { id: 'BROADBAND', label: 'Broadband', icon: Wifi },
  ];

  const categoryBillers = BBPS_BILLERS.filter(b => b.category === selectedCategory);
  const filteredBillers = categoryBillers.filter(b => 
    b.name.toLowerCase().includes(billerSearch.toLowerCase()) ||
    (b.state && b.state.toLowerCase().includes(billerSearch.toLowerCase()))
  );

  const selectedBiller = BBPS_BILLERS.find(b => b.id === selectedBillerId) || categoryBillers[0] || BBPS_BILLERS[0];

  // Commission: ₹3.50 for electricity/water/gas, ₹2.00 for mobile/DTH, 0.20% for Fastag
  let agentCommission = 3.5;
  if (selectedCategory === 'MOBILE_POSTPAID' || selectedCategory === 'DTH') {
    agentCommission = 2.0;
  } else if (selectedCategory === 'FASTAG') {
    agentCommission = fetchedBill ? Number((fetchedBill.amount * 0.002).toFixed(2)) : 2.5;
  }

  const handleCategoryChange = (cat: BbpsCategory) => {
    setSelectedCategory(cat);
    const firstBiller = BBPS_BILLERS.find(b => b.category === cat);
    if (firstBiller) {
      setSelectedBillerId(firstBiller.id);
      setConsumerParam(firstBiller.sampleAccount);
      // Auto fetch bill for instant preview
      setFetchedBill({
        customerName: 'Priya Sharma',
        billNumber: `BILL/${firstBiller.category.slice(0, 3)}/${Math.floor(10000 + Math.random() * 90000)}`,
        dueDate: '2026-09-30',
        billPeriod: 'Current Billing Cycle',
        amount: firstBiller.defaultAmount,
      });
    }
  };

  const handleFetchBill = () => {
    if (!consumerParam) {
      alert(`Please enter ${selectedBiller.paramLabel}`);
      return;
    }
    setIsFetching(true);
    setFetchedBill(null);

    setTimeout(() => {
      setIsFetching(false);
      setFetchedBill({
        customerName: 'Priya Sharma',
        billNumber: `BILL/2026/${Math.floor(10000 + Math.random() * 90000)}`,
        dueDate: '2026-09-29',
        billPeriod: 'Monthly Cycle 2026',
        amount: selectedBiller.defaultAmount || 1450,
      });
    }, 1000);
  };

  const handlePayBill = async () => {
    if (!fetchedBill) return;
    if (fetchedBill.amount > walletBalance) {
      alert(`Insufficient Float Balance! Bill amount is ₹${fetchedBill.amount.toLocaleString('en-IN')}, your float is ₹${walletBalance.toLocaleString('en-IN')}`);
      return;
    }

    setIsPaying(true);

    try {
      const generatedRrn = `6265${Math.floor(10000000 + Math.random() * 90000000)}`;

      const newTx = await onExecuteTransaction({
        service: 'BBPS',
        subtype: `${selectedCategory.replace('_', ' ')} Bill`,
        status: 'SUCCESS',
        amount: fetchedBill.amount,
        fee: 0,
        commission: agentCommission,
        customerName: fetchedBill.customerName,
        customerMobile: customerMobile,
        accountOrAadhaarOrConsumer: consumerParam,
        bankOrOperator: selectedBiller.name,
        billerDetails: {
          billNumber: fetchedBill.billNumber,
          dueDate: fetchedBill.dueDate,
          consumerId: consumerParam,
          category: selectedCategory,
        },
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      onShowReceipt(newTx);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Slider */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`tab-bbps-${cat.id.toLowerCase()}`}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Biller Selection & Consumer ID input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Select Service Provider / Biller
              </label>

              {/* Search billers */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={billerSearch}
                  onChange={(e) => setBillerSearch(e.target.value)}
                  placeholder={`Search ${selectedCategory.toLowerCase()} billers...`}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Biller list cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredBillers.map((biller) => {
                  const isSelected = biller.id === selectedBillerId;
                  return (
                    <div
                      key={biller.id}
                      id={`biller-card-${biller.id}`}
                      onClick={() => {
                        setSelectedBillerId(biller.id);
                        setConsumerParam(biller.sampleAccount);
                        setFetchedBill(null);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 font-bold text-indigo-950'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{biller.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                        <span>{biller.state || 'National Biller'}</span>
                        <span className="font-mono text-indigo-600 font-medium">BBPS Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consumer Parameter Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  {selectedBiller.paramLabel}
                </label>
                <button
                  type="button"
                  onClick={() => setConsumerParam(selectedBiller.sampleAccount)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                >
                  Use Sample ID
                </button>
              </div>

              <input
                id="input-bbps-consumer"
                type="text"
                value={consumerParam}
                onChange={(e) => setConsumerParam(e.target.value)}
                placeholder={selectedBiller.paramPlaceholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-600 focus:bg-white font-bold"
              />
            </div>

            {/* Customer Mobile */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Customer Mobile for SMS Bill Receipt
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

            {/* Fetch Bill Button */}
            <button
              id="btn-bbps-fetch"
              type="button"
              disabled={isFetching || !consumerParam}
              onClick={handleFetchBill}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isFetching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching Live Bill from Biller Central Gateway...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Fetch Bill Details</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Fetched Bill Card & Instant Settlement */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">BBPS Bill Summary</h3>
                  <p className="text-[11px] text-slate-500">Bharat Bill Payment System</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Assured Biller
              </span>
            </div>

            {fetchedBill ? (
              <div className="space-y-4">
                {/* Details Sheet */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> Consumer Name:
                    </span>
                    <span className="font-bold text-slate-900">{fetchedBill.customerName}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Due Date:
                    </span>
                    <span className="font-bold text-rose-600">{fetchedBill.dueDate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Bill Number:</span>
                    <span className="font-mono text-slate-700">{fetchedBill.billNumber}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Biller:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px] text-right">
                      {selectedBiller.name}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                    <span className="text-slate-700 font-bold">Total Bill Amount:</span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">
                      ₹{fetchedBill.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Agent Commission Note */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Agent Margin:
                  </span>
                  <span className="font-bold font-mono text-sm">+₹{agentCommission.toFixed(2)}</span>
                </div>

                {/* Pay Bill Button */}
                <button
                  id="btn-bbps-pay"
                  type="button"
                  disabled={isPaying || fetchedBill.amount > walletBalance}
                  onClick={handlePayBill}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isPaying ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Settling via BBPS Central Switch...</span>
                    </div>
                  ) : (
                    <>
                      <span>Pay ₹{fetchedBill.amount.toLocaleString('en-IN')} Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400">
                <FileCheck2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">Click "Fetch Bill Details" to load customer dues directly from the utility provider</p>
              </div>
            )}

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>NPCI Bharat BillPay Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
