import React, { useState } from 'react';
import {
  Tv,
  CheckCircle2,
  AlertCircle,
  Zap,
  RefreshCw,
  Search,
  Check,
  Sparkles,
  Radio,
  Calendar,
  Layers,
  Wrench,
  Clock,
  Send
} from 'lucide-react';
import { Transaction, AgentProfile, DthPack } from '../types';
import { MOCK_DTH_PROVIDERS, MOCK_DTH_PACKS, DthProvider } from '../data/mockData';

interface DthModuleProps {
  walletBalance: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onShowReceipt: (tx: Transaction) => void;
  agentProfile: AgentProfile;
}

export const DthModule: React.FC<DthModuleProps> = ({
  walletBalance,
  onExecuteTransaction,
  onShowReceipt,
  agentProfile,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<DthProvider>(MOCK_DTH_PROVIDERS[0]);
  const [subscriberId, setSubscriberId] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [activeTab, setActiveTab] = useState<'RECHARGE' | 'NEW_CONNECTION'>('RECHARGE');
  const [selectedPack, setSelectedPack] = useState<DthPack | null>(MOCK_DTH_PACKS['tataplay'][0]);
  const [customAmount, setCustomAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<{
    customerName: string;
    balance: number;
    planName: string;
    dueDate: string;
    status: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dthSuccess, setDthSuccess] = useState<Transaction | null>(null);
  const [isRefreshingBox, setIsRefreshingBox] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // New Connection Form State
  const [installAddress, setInstallAddress] = useState('');
  const [installDate, setInstallDate] = useState('Tomorrow (Preferred)');
  const [selectedBoxType, setSelectedBoxType] = useState<'HD' | '4K_BINGE'>('HD');

  const packs = MOCK_DTH_PACKS[selectedProvider.id] || [];

  const handleVerifySubscriber = () => {
    if (!subscriberId.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setCustomerDetails({
        customerName: 'Rajeshwar Sharma',
        balance: 14.5,
        planName: 'Hindi Mega HD Family Pack',
        dueDate: '24 Sep 2026',
        status: 'Active (Recharge Due Soon)',
      });
      if (!customerMobile) {
        setCustomerMobile('9811234567');
      }
    }, 800);
  };

  const handleHeavyRefresh = () => {
    setIsRefreshingBox(true);
    setRefreshMessage(null);
    setTimeout(() => {
      setIsRefreshingBox(false);
      setRefreshMessage('Heavy Refresh signal successfully beamed to Set-Top Box! Channels will unblock within 2-5 minutes.');
    }, 1200);
  };

  const rechargeAmount = selectedPack ? selectedPack.price : parseFloat(customAmount) || 0;
  const newConnectionPrice = selectedBoxType === 'HD' ? 1499 : 2499;
  const finalAmount = activeTab === 'RECHARGE' ? rechargeAmount : newConnectionPrice;

  const commissionRate = activeTab === 'RECHARGE' ? 0.03 : 0.15; // 3% for recharge, 15% (~₹225-₹375) for new booking
  const estimatedCommission = +(finalAmount * commissionRate).toFixed(2);

  const canProceed =
    activeTab === 'RECHARGE'
      ? subscriberId.length >= 8 && finalAmount > 0 && walletBalance >= finalAmount && !isProcessing
      : customerMobile.length === 10 && installAddress.trim().length > 10 && walletBalance >= finalAmount && !isProcessing;

  const handleExecute = () => {
    if (!canProceed) return;
    setIsProcessing(true);

    const rrn = '6265' + Math.floor(10000000 + Math.random() * 90000000);
    const subTypeDesc =
      activeTab === 'RECHARGE'
        ? `DTH Recharge ${selectedPack ? selectedPack.name : 'Custom'} (${selectedPack ? selectedPack.validity : 'Balance'})`
        : `New DTH Connection Booking (${selectedBoxType} Box + Dish + 1M Free)`;

    setTimeout(() => {
      const newTx: Omit<Transaction, 'id' | 'timestamp'> = {
        txnReference: `DTH${Date.now().toString().slice(-8)}`,
        rrn,
        service: 'DTH',
        subtype: subTypeDesc,
        status: 'SUCCESS',
        amount: finalAmount,
        fee: 0,
        commission: estimatedCommission,
        customerName: customerDetails?.customerName || (activeTab === 'RECHARGE' ? `Subscriber ${subscriberId.slice(-4)}` : 'DTH Customer'),
        customerMobile: customerMobile || '9876543210',
        accountOrAadhaarOrConsumer: activeTab === 'RECHARGE' ? subscriberId : `NEW-${customerMobile}`,
        bankOrOperator: selectedProvider.name,
        timeline: [
          { step: 'DTH Order Initiated', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Amount ₹${finalAmount}` },
          { step: 'Direct DTH Switch ACK', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `Provider ${selectedProvider.code} Gateway Verified` },
          { step: 'Account Update & Heavy Refresh', timestamp: new Date().toLocaleTimeString(), status: 'done', note: `RRN ${rrn} - Account credited` },
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
      setDthSuccess(completeTx);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Tv className="w-8 h-8 text-violet-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">DTH Recharge & New Connection</h2>
                <span className="text-[11px] font-bold bg-violet-400/30 text-white border border-violet-300/40 px-2 py-0.5 rounded-full">
                  Instant STB Activation
                </span>
              </div>
              <p className="text-violet-100 text-sm mt-0.5">
                Recharge Tata Play, Airtel DTH, Dish TV, Sun Direct & Videocon d2h with Heavy Refresh support
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-[10px] text-violet-200 uppercase font-semibold">Agent Commission</div>
              <div className="text-sm font-bold text-white font-mono">3.00% Recharge | ₹350 New Box</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector: Recharge vs Book New Connection */}
      <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('RECHARGE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'RECHARGE'
              ? 'bg-white text-violet-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>DTH Quick Recharge & Heavy Refresh</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('NEW_CONNECTION')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'NEW_CONNECTION'
              ? 'bg-white text-violet-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Book New DTH Connection (HD / Smart)</span>
        </button>
      </div>

      {/* Providers Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select DTH Provider</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MOCK_DTH_PROVIDERS.map((provider) => {
            const isSelected = selectedProvider.id === provider.id;
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => {
                  setSelectedProvider(provider);
                  setSelectedPack(MOCK_DTH_PACKS[provider.id]?.[0] || null);
                  setCustomerDetails(null);
                  setRefreshMessage(null);
                }}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50/80 shadow-2xs text-violet-950 font-bold'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                  isSelected ? 'bg-violet-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  {provider.code}
                </div>
                <span className="text-xs font-semibold truncate w-full">{provider.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Flow Grid */}
      {activeTab === 'RECHARGE' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Subscriber ID & Verification */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-xs font-bold">1</span>
                Subscriber Lookup
              </h3>

              {/* Subscriber ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {selectedProvider.paramLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id="input-dth-subscriber-id"
                      type="text"
                      value={subscriberId}
                      onChange={(e) => setSubscriberId(e.target.value.replace(/\D/g, ''))}
                      placeholder={`e.g. ${selectedProvider.sampleId}`}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-violet-600 focus:bg-white rounded-xl text-sm font-mono font-medium focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifySubscriber}
                    disabled={subscriberId.length < 6 || isVerifying}
                    className="px-3.5 py-2.5 bg-violet-100 hover:bg-violet-200 text-violet-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Fetch Info</span>
                  </button>
                </div>
              </div>

              {/* Customer Mobile for SMS receipt */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Mobile Number (for SMS & e-Receipt)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-300 focus:border-violet-600 rounded-xl text-xs font-mono font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Fetched Customer Details Box */}
              {customerDetails && (
                <div className="bg-violet-50/70 border border-violet-200 rounded-xl p-3.5 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-violet-200/60 pb-1.5">
                    <span className="font-bold text-violet-950 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {customerDetails.customerName}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {customerDetails.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Current Balance:</span>
                      <span className="font-bold font-mono text-slate-800">₹{customerDetails.balance.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Next Due Date:</span>
                      <span className="font-bold font-mono text-amber-700">{customerDetails.dueDate}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Base Pack:</span>
                    <span className="font-medium text-slate-800">{customerDetails.planName}</span>
                  </div>

                  {/* Heavy Refresh Trigger */}
                  <div className="pt-2 border-t border-violet-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Box shows error or black screen?</span>
                    <button
                      type="button"
                      onClick={handleHeavyRefresh}
                      disabled={isRefreshingBox}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-violet-300 text-violet-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshingBox ? 'animate-spin' : ''}`} />
                      <span>Heavy Refresh STB</span>
                    </button>
                  </div>
                </div>
              )}

              {refreshMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{refreshMessage}</span>
                </div>
              )}

              {/* Amount Input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recharge Amount (INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₹</span>
                  <input
                    id="input-dth-amount"
                    type="number"
                    value={selectedPack ? selectedPack.price : customAmount}
                    onChange={(e) => {
                      setSelectedPack(null);
                      setCustomAmount(e.target.value);
                    }}
                    placeholder="Enter recharge amount"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-violet-600 focus:bg-white rounded-xl text-base font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Wallet Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Main Wallet Balance:</span>
                  <span className="font-mono font-bold text-slate-800">₹{walletBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Deduction:</span>
                  <span className="font-mono font-bold text-rose-600">-₹{finalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold border-t border-slate-200/60 pt-1">
                  <span>Agent Commission (3.00%):</span>
                  <span className="font-mono font-bold">+₹{estimatedCommission.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-dth-recharge-submit"
                type="button"
                disabled={!canProceed}
                onClick={handleExecute}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  canProceed
                    ? 'bg-violet-700 hover:bg-violet-800 text-white active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting to {selectedProvider.code} Switch...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Pay DTH Recharge ₹{finalAmount.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Packs Browser */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-xs font-bold">2</span>
                    Recommended Viewing Packs
                  </h3>
                  <p className="text-xs text-slate-500">Popular channel bouquets for {selectedProvider.name}</p>
                </div>
              </div>

              {/* Pack list */}
              <div className="space-y-3">
                {packs.map((pack) => {
                  const isSelected = selectedPack?.id === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => {
                        setSelectedPack(pack);
                        setCustomAmount('');
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/70 shadow-2xs ring-1 ring-violet-600'
                          : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900 font-mono">
                            ₹{pack.price}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                            {pack.validity}
                          </span>
                          <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-md">
                            {pack.channels}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">{pack.name}</h4>
                        <p className="text-xs text-slate-600 leading-snug">{pack.description}</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-emerald-700 font-mono">
                          +₹{(pack.price * 0.03).toFixed(2)} comm.
                        </span>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSelected ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-700'
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
      ) : (
        /* New Connection Booking Tab */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Book New DTH Connection</h3>
            <p className="text-xs text-slate-500">
              Complete setup kit: Brand New HD Set-Top Box + Outdoor Dish Antenna + 10m Cable + Free Installation + 1 Month Pack Included.
            </p>
          </div>

          {/* Box Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Set-Top Box Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedBoxType('HD')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedBoxType === 'HD'
                    ? 'border-violet-600 bg-violet-50/70 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Digital HD Set-Top Box</span>
                  <span className="font-extrabold text-base font-mono text-violet-800">₹1,499</span>
                </div>
                <p className="text-xs text-slate-600">1080i Full HD, 5.1 Surround Sound, Dish Antenna + 1 Month Free Hindi Pack.</p>
                <div className="mt-2 text-[11px] font-bold text-emerald-700 font-mono">+₹225 Agent Margin</div>
              </div>

              <div
                onClick={() => setSelectedBoxType('4K_BINGE')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedBoxType === '4K_BINGE'
                    ? 'border-violet-600 bg-violet-50/70 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Smart Android / Binge Plus Box</span>
                  <span className="font-extrabold text-base font-mono text-violet-800">₹2,499</span>
                </div>
                <p className="text-xs text-slate-600">Android TV OS, Google Voice Assistant, Built-in Chromecast + Free Hotstar, SonyLIV 3M.</p>
                <div className="mt-2 text-[11px] font-bold text-emerald-700 font-mono">+₹375 Agent Margin</div>
              </div>
            </div>
          </div>

          {/* Customer & Address Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Mobile Number *</label>
              <input
                type="tel"
                maxLength={10}
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Installation Slot *</label>
              <select
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="Tomorrow (Preferred)">Tomorrow (9:00 AM - 1:00 PM)</option>
                <option value="Day After Tomorrow">Day After Tomorrow (2:00 PM - 6:00 PM)</option>
                <option value="Weekend Slot">Upcoming Weekend</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Installation Address *</label>
              <textarea
                rows={2}
                value={installAddress}
                onChange={(e) => setInstallAddress(e.target.value)}
                placeholder="House No, Street, Landmark, Village / Colony, City, Pin Code"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!canProceed}
            onClick={handleExecute}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              canProceed
                ? 'bg-violet-700 hover:bg-violet-800 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Booking Installation with {selectedProvider.name}...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Book Connection & Pay ₹{finalAmount.toFixed(2)} (Commission: +₹{estimatedCommission.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Modal */}
      {dthSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeTab === 'RECHARGE' ? 'DTH Recharge Successful!' : 'New Connection Booked!'}
              </h3>
              <p className="text-xs text-slate-500">
                Provider: <span className="font-bold text-slate-800">{dthSuccess.bankOrOperator}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-800">{dthSuccess.subtype}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">₹{dthSuccess.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RRN / Booking Ref:</span>
                <span className="font-mono text-violet-700 font-semibold">{dthSuccess.rrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agent Commission:</span>
                <span className="font-bold text-emerald-600 font-mono">+₹{dthSuccess.commission.toFixed(2)}</span>
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
                  onShowReceipt(dthSuccess);
                  setDthSuccess(null);
                }}
                className="py-2.5 px-4 bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setDthSuccess(null)}
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
