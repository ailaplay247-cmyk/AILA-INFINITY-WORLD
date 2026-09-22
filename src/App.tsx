/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Fingerprint, 
  Receipt, 
  Activity, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  RefreshCw,
  Bell,
  Smartphone,
  Tv,
  Film,
  ShieldCheck,
  Landmark
} from 'lucide-react';
import { ServiceType, Transaction, AgentProfile } from './types';
import { INITIAL_AGENT_PROFILE, INITIAL_TRANSACTIONS } from './data/mockData';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { DmtModule } from './components/DmtModule';
import { AepsModule } from './components/AepsModule';
import { BbpsModule } from './components/BbpsModule';
import { RechargeModule } from './components/RechargeModule';
import { DthModule } from './components/DthModule';
import { OttModule } from './components/OttModule';
import { InsuranceModule } from './components/InsuranceModule';
import { LicModule } from './components/LicModule';
import { TransactionTracker } from './components/TransactionTracker';
import { ReceiptModal } from './components/ReceiptModal';
import { WalletModal } from './components/WalletModal';
import { CommissionSlabModal } from './components/CommissionSlabModal';
import { KioskLockScreen } from './components/KioskLockScreen';
import { KioskIdleWarning } from './components/KioskIdleWarning';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { useIdleTimer } from './hooks/useIdleTimer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  // Agent profile with local persistence
  const [profile, setProfile] = useState<AgentProfile>(() => {
    const saved = localStorage.getItem('digiagent_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.shopName === 'Maa Vaishno DigiSeva Kendra') {
          parsed.shopName = 'AILA INFINITY DIGISEVA';
        }
        return {
          ...INITIAL_AGENT_PROFILE,
          ...parsed,
        };
      } catch (e) { /* use default */ }
    }
    return INITIAL_AGENT_PROFILE;
  });

  // Transactions list with local persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('digiagent_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<ServiceType | 'TRACKER'>('DMT');

  // Modals state
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<Transaction | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Live Gateway Simulation State
  const [isSimulating, setIsSimulating] = useState(true);
  const [liveToast, setLiveToast] = useState<{ id: string; title: string; message: string; type: 'success' | 'info' } | null>(null);

  const handleUpdateProfile = (updated: Partial<AgentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      return next;
    });
    setLiveToast({
      id: `PROFILE-${Date.now().toString().slice(-4)}`,
      title: 'Agent Profile Updated',
      message: 'Kiosk & user profile changes saved successfully.',
      type: 'success',
    });
  };

  // Rapid Tab Switching Keyboard Handler
  const handleSwitchTabByShortcut = (tabIndex: number) => {
    const tabMap: Record<number, { id: ServiceType | 'TRACKER'; name: string }> = {
      1: { id: 'DMT', name: 'Money Transfer (DMT)' },
      2: { id: 'AEPS', name: 'Aadhaar ATM (AePS)' },
      3: { id: 'RECHARGE', name: 'Mobile Recharge' },
      4: { id: 'BBPS', name: 'Bill Payments (BBPS)' },
      5: { id: 'DTH', name: 'DTH Connection & Recharge' },
      6: { id: 'OTT', name: 'OTT Subscriptions' },
      7: { id: 'INSURANCE', name: 'Micro-Insurance' },
      8: { id: 'LIC', name: 'LIC Premium Renewal' },
      9: { id: 'TRACKER', name: 'Real-Time Tracker Feed' },
    };
    const target = tabMap[tabIndex];
    if (target) {
      setActiveTab(target.id);
      setLiveToast({
        id: `TAB-SHORTCUT-${Date.now().toString().slice(-4)}`,
        title: `Switched Tab [Ctrl+${tabIndex}]`,
        message: `Navigated to ${target.name}`,
        type: 'info',
      });
      setTimeout(() => setLiveToast(null), 2200);
    }
  };

  // Idle Session Timer for Public Kiosk Security (15 Minutes = 900 Seconds)
  const handleSessionTimeout = () => {
    // Clear all sensitive session states
    setSelectedReceiptTxn(null);
    setIsWalletOpen(false);
    setIsCommissionOpen(false);
    setIsShortcutsOpen(false);
    try {
      sessionStorage.clear();
    } catch (e) {
      /* ignore */
    }
    setLiveToast({
      id: `LOCK-${Date.now().toString().slice(-4)}`,
      title: 'Kiosk Security Auto-Lock',
      message: 'Session locked after 15 minutes of inactivity to protect customer data.',
      type: 'info',
    });
  };

  const {
    isLocked,
    showWarning,
    secondsRemaining,
    resetTimer,
    lockImmediately,
    unlock,
  } = useIdleTimer({
    timeoutSeconds: 900, // 15 minutes timeout
    warningSeconds: 60,  // Pre-lock warning at 14 minutes
    onTimeout: handleSessionTimeout,
  });

  // Global Keyboard Shortcuts Listener for High-Speed Kiosk Operation
  useKeyboardShortcuts({
    onSwitchTab: handleSwitchTabByShortcut,
    onOpenWallet: () => setIsWalletOpen((prev) => !prev),
    onOpenCommission: () => setIsCommissionOpen((prev) => !prev),
    onOpenShortcutsModal: () => setIsShortcutsOpen((prev) => !prev),
    onOpenProfile: () => setIsProfileOpen((prev) => !prev),
    onLockKiosk: () => {
      lockImmediately();
      setLiveToast({
        id: `LOCK-MANUAL-${Date.now().toString().slice(-4)}`,
        title: 'Kiosk Terminal Locked [Ctrl+L]',
        message: 'Screen locked via shortcut. Re-authenticate to continue.',
        type: 'info',
      });
    },
    onCloseModals: () => {
      setSelectedReceiptTxn(null);
      setIsWalletOpen(false);
      setIsCommissionOpen(false);
      setIsShortcutsOpen(false);
      setIsProfileOpen(false);
    },
    onToggleSimulate: () => {
      setIsSimulating((prev) => {
        const next = !prev;
        setLiveToast({
          id: `SIM-TOGGLE-${Date.now().toString().slice(-4)}`,
          title: next ? 'Live Switch Simulation Resumed' : 'Live Switch Simulation Paused',
          message: `NPCI switch pulse is now ${next ? 'ACTIVE' : 'PAUSED'} [Ctrl+M]`,
          type: 'info',
        });
        setTimeout(() => setLiveToast(null), 3000);
        return next;
      });
    },
  });

  const handleShortcutPaletteAction = (action: string) => {
    setIsShortcutsOpen(false);
    if (action === 'TAB_DMT') handleSwitchTabByShortcut(1);
    else if (action === 'TAB_AEPS') handleSwitchTabByShortcut(2);
    else if (action === 'TAB_RECHARGE') handleSwitchTabByShortcut(3);
    else if (action === 'TAB_BBPS') handleSwitchTabByShortcut(4);
    else if (action === 'TAB_DTH') handleSwitchTabByShortcut(5);
    else if (action === 'TAB_OTT') handleSwitchTabByShortcut(6);
    else if (action === 'TAB_INSURANCE') handleSwitchTabByShortcut(7);
    else if (action === 'TAB_LIC') handleSwitchTabByShortcut(8);
    else if (action === 'TAB_TRACKER') handleSwitchTabByShortcut(9);
    else if (action === 'OPEN_WALLET') setIsWalletOpen(true);
    else if (action === 'OPEN_COMMISSION') setIsCommissionOpen(true);
    else if (action === 'OPEN_PROFILE') setIsProfileOpen(true);
    else if (action === 'LOCK_KIOSK') lockImmediately();
    else if (action === 'TOGGLE_SIMULATION') {
      setIsSimulating((prev) => !prev);
    }
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('digiagent_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('digiagent_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Periodic simulated gateway switch listener: checks if there's any pending transaction
  // and periodically simulates a bank clearing webhook in real time!
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTransactions((current) => {
        const pendingTxn = current.find(t => t.status === 'PENDING');
        if (!pendingTxn) return current;

        // Auto-resolve pending transaction to SUCCESS
        const updatedUtr = `CMS${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
        const updatedList = current.map(t => {
          if (t.id === pendingTxn.id) {
            return {
              ...t,
              status: 'SUCCESS' as const,
              utr: updatedUtr,
              timeline: [
                ...t.timeline.slice(0, 2),
                { step: 'Beneficiary Bank Clearance', timestamp: new Date().toTimeString().slice(0, 8), status: 'done' as const, note: 'Bank Host ACK 00 (Settled)' },
                { step: 'Final Settlement', timestamp: new Date().toTimeString().slice(0, 8), status: 'done' as const, note: `UTR: ${updatedUtr}` },
              ]
            };
          }
          return t;
        });

        // Trigger notification
        setLiveToast({
          id: pendingTxn.id,
          title: 'NPCI Bank Switch Settlement Update',
          message: `Pending ${pendingTxn.service} order ${pendingTxn.id} has cleared! UTR: ${updatedUtr}`,
          type: 'success'
        });
        setTimeout(() => setLiveToast(null), 5000);

        return updatedList;
      });
    }, 18000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Execute a new Transaction
  const handleExecuteTransaction = async (
    txData: Omit<Transaction, 'id' | 'timestamp' | 'timeline' | 'rrn' | 'txnReference'>
  ): Promise<Transaction> => {
    const timestamp = new Date();
    const formattedTime = timestamp.toISOString().replace('T', ' ').substring(0, 19);
    const timeStr = timestamp.toTimeString().slice(0, 8);
    const newId = `TXN-${Math.floor(90242 + Math.random() * 9000)}`;
    const newRef = `${txData.service}${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`;
    const newRrn = `6265${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newTxn: Transaction = {
      id: newId,
      txnReference: newRef,
      rrn: newRrn,
      timestamp: formattedTime,
      ...txData,
      timeline: [
        { step: 'Order Initiated', timestamp: timeStr, status: 'done', note: 'Agent Portal Request Validated' },
        { step: 'NPCI / BBPS Switch Handshake', timestamp: timeStr, status: 'done', note: 'Switch Response: 00 (Authorized)' },
        { step: 'Core Bank / Biller Clearance', timestamp: timeStr, status: 'done', note: 'Acquirer Host Accepted' },
        { step: 'Settlement Completed', timestamp: timeStr, status: 'done', note: `RRN: ${newRrn}` },
      ],
    };

    // Update balances
    setProfile((prev) => {
      let newFloat = prev.mainWalletBalance;
      let newCommission = prev.commissionWalletBalance + txData.commission;
      let newCash = prev.cashInDrawer;

      if (txData.service === 'DMT') {
        // DMT debits amount + fee from agent float, and adds commission
        newFloat = prev.mainWalletBalance - (txData.amount + txData.fee) + txData.commission;
      } else if (txData.service === 'AEPS') {
        if (txData.subtype?.includes('Withdrawal') || txData.subtype?.includes('Aadhaar Pay')) {
          // Customer withdrew cash: Agent gives physical cash, agent float is CREDITED with amount + commission!
          newFloat = prev.mainWalletBalance + txData.amount + txData.commission;
          newCash = Math.max(0, prev.cashInDrawer - txData.amount);
        } else {
          // Balance enquiry / Mini Statement: agent float credited with commission
          newFloat = prev.mainWalletBalance + txData.commission;
        }
      } else if (txData.service === 'BBPS') {
        // BBPS utility payment: agent float debited for bill, commission credited
        newFloat = prev.mainWalletBalance - txData.amount + txData.commission;
      }

      return {
        ...prev,
        mainWalletBalance: Math.max(0, Number(newFloat.toFixed(2))),
        commissionWalletBalance: Number(newCommission.toFixed(2)),
        cashInDrawer: Number(newCash.toFixed(2)),
      };
    });

    setTransactions((prev) => [newTxn, ...prev]);

    // Show live confirmation toast
    setLiveToast({
      id: newId,
      title: `${txData.service} Transaction Settled`,
      message: `₹${txData.amount.toLocaleString('en-IN')} processed. Agent commission +₹${txData.commission.toFixed(2)} credited!`,
      type: 'success',
    });
    setTimeout(() => setLiveToast(null), 4000);

    return newTxn;
  };

  // Re-query bank status for pending transactions
  const handleRequeryStatus = (txnId: string) => {
    setTransactions((prev) => {
      const target = prev.find(t => t.id === txnId);
      if (!target) return prev;

      const generatedUtr = `CMS${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

      const updated = prev.map(t => {
        if (t.id === txnId) {
          return {
            ...t,
            status: 'SUCCESS' as const,
            utr: generatedUtr,
            timeline: [
              ...t.timeline.slice(0, 2),
              { step: 'Beneficiary Bank Clearance', timestamp: new Date().toTimeString().slice(0, 8), status: 'done' as const, note: 'Re-query Result: Credit Confirmed' },
              { step: 'Final Settlement', timestamp: new Date().toTimeString().slice(0, 8), status: 'done' as const, note: `UTR: ${generatedUtr}` },
            ]
          };
        }
        return t;
      });

      setLiveToast({
        id: txnId,
        title: 'Status Re-query Result',
        message: `Transaction ${txnId} re-verified with Bank switch. Status updated to SUCCESS!`,
        type: 'success',
      });
      setTimeout(() => setLiveToast(null), 4000);

      return updated;
    });
  };

  // Simulate an incoming live gateway event (e.g. customer AePS cash deposit or webhook)
  const handleSimulateIncomingGatewayEvent = () => {
    const services: ServiceType[] = ['DMT', 'AEPS', 'BBPS'];
    const pickService = services[Math.floor(Math.random() * services.length)];
    const timeStr = new Date().toTimeString().slice(0, 8);
    const newId = `TXN-${Math.floor(90250 + Math.random() * 9000)}`;
    const newRrn = `6265${Math.floor(10000000 + Math.random() * 90000000)}`;

    let simulatedTxn: Transaction;

    if (pickService === 'AEPS') {
      simulatedTxn = {
        id: newId,
        txnReference: `AEPS${Date.now().toString().slice(-8)}`,
        rrn: newRrn,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        service: 'AEPS',
        subtype: 'Cash Withdrawal',
        status: 'SUCCESS',
        amount: 2500,
        fee: 0,
        commission: 6.0,
        customerName: 'Gopal Krishna Das',
        customerMobile: '9845019283',
        accountOrAadhaarOrConsumer: 'XXXX-XXXX-9182',
        bankOrOperator: 'State Bank of India',
        balanceRemaining: 8420,
        timeline: [
          { step: 'Biometric Capture', timestamp: timeStr, status: 'done', note: 'Quality 94%' },
          { step: 'UIDAI Verification', timestamp: timeStr, status: 'done', note: 'Auth 482910' },
          { step: 'NPCI Switch Route', timestamp: timeStr, status: 'done', note: 'SBI Approved' },
          { step: 'Settled', timestamp: timeStr, status: 'done', note: 'Dispensed Cash' },
        ]
      };
      setProfile(p => ({
        ...p,
        mainWalletBalance: Number((p.mainWalletBalance + 2506).toFixed(2)),
        commissionWalletBalance: Number((p.commissionWalletBalance + 6).toFixed(2)),
        cashInDrawer: Math.max(0, p.cashInDrawer - 2500)
      }));
    } else if (pickService === 'BBPS') {
      simulatedTxn = {
        id: newId,
        txnReference: `BBPS${Date.now().toString().slice(-8)}`,
        rrn: newRrn,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        service: 'BBPS',
        subtype: 'Electricity Bill',
        status: 'SUCCESS',
        amount: 1890,
        fee: 0,
        commission: 3.5,
        customerName: 'Vinod Mehra',
        customerMobile: '9810294820',
        accountOrAadhaarOrConsumer: '60019283921',
        bankOrOperator: 'Tata Power DDL (Delhi)',
        timeline: [
          { step: 'Bill Verified', timestamp: timeStr, status: 'done' },
          { step: 'BBPCU Switch Routing', timestamp: timeStr, status: 'done' },
          { step: 'Payment Receipt Issued', timestamp: timeStr, status: 'done', note: 'Biller ACK' },
        ]
      };
      setProfile(p => ({
        ...p,
        mainWalletBalance: Number((p.mainWalletBalance - 1890 + 3.5).toFixed(2)),
        commissionWalletBalance: Number((p.commissionWalletBalance + 3.5).toFixed(2)),
      }));
    } else {
      simulatedTxn = {
        id: newId,
        txnReference: `DMT${Date.now().toString().slice(-8)}`,
        rrn: newRrn,
        utr: `CMS${Date.now().toString().slice(-8)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        service: 'DMT',
        subtype: 'IMPS Money Transfer',
        status: 'SUCCESS',
        amount: 4000,
        fee: 10,
        commission: 14.0,
        customerName: 'Sunil Chhabra',
        customerMobile: '9819283746',
        accountOrAadhaarOrConsumer: '10928394810',
        bankOrOperator: 'ICICI Bank',
        mode: 'IMPS',
        timeline: [
          { step: 'Initiated', timestamp: timeStr, status: 'done' },
          { step: 'NPCI IMPS Switch', timestamp: timeStr, status: 'done' },
          { step: 'Beneficiary Bank Credit', timestamp: timeStr, status: 'done' },
          { step: 'Settled', timestamp: timeStr, status: 'done' },
        ]
      };
      setProfile(p => ({
        ...p,
        mainWalletBalance: Number((p.mainWalletBalance - 4010 + 14).toFixed(2)),
        commissionWalletBalance: Number((p.commissionWalletBalance + 14).toFixed(2)),
      }));
    }

    setTransactions(prev => [simulatedTxn, ...prev]);

    setLiveToast({
      id: newId,
      title: 'Incoming Switch Event Processed',
      message: `Simulated live ${simulatedTxn.service} txn for ₹${simulatedTxn.amount.toLocaleString('en-IN')} received!`,
      type: 'info'
    });
    setTimeout(() => setLiveToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Real-Time Live Push Notification Toast */}
      {liveToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 transition-all animate-bounce">
          <div className={`p-2 rounded-xl shrink-0 ${liveToast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold text-slate-100 flex items-center justify-between">
              <span>{liveToast.title}</span>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>
            <p className="text-slate-300 mt-1">{liveToast.message}</p>
          </div>
          <button 
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header with float balance & live switch indicators */}
      <Header
        profile={profile}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenCommissionSlabs={() => setIsCommissionOpen(true)}
        onToggleSimulateIncoming={() => setIsSimulating(!isSimulating)}
        isSimulating={isSimulating}
        onUpdateThreshold={(newThreshold) => {
          setProfile((prev) => ({ ...prev, lowBalanceThreshold: newThreshold }));
        }}
        secondsRemaining={secondsRemaining}
        onLockKioskNow={lockImmediately}
        onSimulateIdleTimeout={lockImmediately}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Real-time Business Analytics Cards */}
        <MetricCards
          transactions={transactions}
          cashInDrawer={profile.cashInDrawer}
        />

        {/* Primary Navigation Tabs with High-Speed Shortcut Key Badges */}
        <div className="space-y-2">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5">
            {[
              { id: 'DMT' as const, label: 'Money Transfer (DMT)', icon: Send, badge: 'Instant IMPS', keyNum: '1' },
              { id: 'AEPS' as const, label: 'AePS (Aadhaar ATM)', icon: Fingerprint, badge: 'Cash Out', keyNum: '2' },
              { id: 'RECHARGE' as const, label: 'Mobile Recharge', icon: Smartphone, badge: 'Prepaid Plans', keyNum: '3' },
              { id: 'BBPS' as const, label: 'Bill Payments (BBPS)', icon: Receipt, badge: '20,000+ Billers', keyNum: '4' },
              { id: 'DTH' as const, label: 'DTH Connection & TV', icon: Tv, badge: 'Heavy Refresh', keyNum: '5' },
              { id: 'OTT' as const, label: 'OTT Subscription', icon: Film, badge: 'Instant Code', keyNum: '6' },
              { id: 'INSURANCE' as const, label: 'Insurance (POSP)', icon: ShieldCheck, badge: 'Instant Policy', keyNum: '7' },
              { id: 'LIC' as const, label: 'LIC Premium', icon: Landmark, badge: '80C Tax Slip', keyNum: '8' },
              { id: 'TRACKER' as const, label: 'Live Tracker Feed', icon: Activity, badge: 'Live Feed', isPulse: true, keyNum: '9' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`main-nav-tab-${tab.id.toLowerCase()}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[155px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                      : 'bg-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                  title={`Press Ctrl+${tab.keyNum} or Alt+${tab.keyNum} to jump to ${tab.label}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : tab.isPulse
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.isPulse && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />}
                      {tab.badge}
                    </span>
                    <kbd
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors ${
                        isActive
                          ? 'bg-indigo-700 border-indigo-400 text-indigo-100'
                          : 'bg-slate-100 border-slate-300 text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      ^{tab.keyNum}
                    </kbd>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Agent Speed Tip Strip */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">⚡ Agent Fast Keys:</span>
              <span><kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700">Ctrl+1..9</kbd> Switch Tabs</span>
              <span className="text-slate-300">•</span>
              <span><kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700">Ctrl+W</kbd> Wallet</span>
              <span className="text-slate-300">•</span>
              <span><kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700">Ctrl+U</kbd> User Profile</span>
              <span className="text-slate-300">•</span>
              <span><kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700">Ctrl+L</kbd> Quick Lock</span>
            </div>
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>View All Shortcuts</span>
              <kbd className="px-1 py-0.2 bg-indigo-50 border border-indigo-200 rounded text-[10px] font-mono font-bold text-indigo-700">?</kbd>
            </button>
          </div>
        </div>

        {/* Dynamic Service View */}
        {activeTab === 'DMT' && (
          <DmtModule
            walletBalance={profile.mainWalletBalance}
            onExecuteTransaction={handleExecuteTransaction}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
            onFundWallet={(amt, note) => {
              setProfile((p) => ({
                ...p,
                mainWalletBalance: Number((p.mainWalletBalance + amt).toFixed(2)),
              }));
              setLiveToast({
                id: `FUND-${Date.now().toString().slice(-4)}`,
                title: 'Agent Float Credited via UPI',
                message: `₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })} received via Dynamic QR and credited to your Float Wallet!`,
                type: 'success',
              });
              setTimeout(() => setLiveToast(null), 5000);
            }}
          />
        )}

        {activeTab === 'AEPS' && (
          <AepsModule
            cashInDrawer={profile.cashInDrawer}
            onExecuteTransaction={handleExecuteTransaction}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
          />
        )}

        {activeTab === 'RECHARGE' && (
          <RechargeModule
            walletBalance={profile.mainWalletBalance}
            onExecuteTransaction={handleExecuteTransaction}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
            agentProfile={profile}
          />
        )}

        {activeTab === 'BBPS' && (
          <BbpsModule
            walletBalance={profile.mainWalletBalance}
            onExecuteTransaction={handleExecuteTransaction}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
          />
        )}

        {activeTab === 'DTH' && (
          <DthModule
            walletBalance={profile.mainWalletBalance}
            onExecuteTransaction={handleExecuteTransaction}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
            agentProfile={profile}
          />
        )}

        {activeTab === 'OTT' && (
          <OttModule
            walletBalance={profile.mainWalletBalance}
            onExecuteTransaction={handleExecuteTransaction}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
            agentProfile={profile}
          />
        )}

        {activeTab === 'INSURANCE' && (
          <InsuranceModule
            walletBalance={profile.mainWalletBalance}
            onExecuteTransaction={handleExecuteTransaction}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
            agentProfile={profile}
          />
        )}

        {activeTab === 'LIC' && (
          <LicModule
            walletBalance={profile.mainWalletBalance}
            onExecuteTransaction={handleExecuteTransaction}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
            agentProfile={profile}
          />
        )}

        {/* Real-time transaction tracker */}
        <div className={activeTab === 'TRACKER' ? 'block' : 'mt-8'}>
          {activeTab !== 'TRACKER' && (
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">Recent Live Transactions</h3>
              </div>
              <button
                onClick={() => setActiveTab('TRACKER')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Tracker Feed</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <TransactionTracker
            transactions={transactions}
            agentProfile={profile}
            onRequeryStatus={handleRequeryStatus}
            onShowReceipt={(tx) => setSelectedReceiptTxn(tx)}
            onSimulateNewTxn={handleSimulateIncomingGatewayEvent}
          />
        </div>
      </main>

      {/* Footer info bar */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-4 px-6 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="font-bold text-slate-700 hover:text-indigo-600 cursor-pointer transition-colors"
              title="Click to view full Agent Profile"
            >
              {profile.shopName}
            </button>
            <span>•</span>
            <span className="font-mono">Terminal ID: {profile.terminalId}</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer underline-offset-2 hover:underline"
            >
              Agent Profile
            </button>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>NPCI IMPS Switch</span>
            <span>•</span>
            <span>UIDAI AePS Certified RD</span>
            <span>•</span>
            <span>BBPS Central Unit</span>
          </div>
          <div>
            Support Helpline: <span className="font-mono font-bold text-indigo-600">1800-849-2026</span>
          </div>
        </div>
      </footer>

      {/* User / Agent Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenWallet={() => {
          setIsProfileOpen(false);
          setIsWalletOpen(true);
        }}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceiptTxn}
        agentProfile={profile}
        onClose={() => setSelectedReceiptTxn(null)}
      />

      {/* Float & Settlement Manager Modal */}
      <WalletModal
        profile={profile}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onTopUpFloat={(amt) => {
          setProfile(p => ({ ...p, mainWalletBalance: p.mainWalletBalance + amt }));
        }}
        onTransferCommissionToFloat={() => {
          setProfile(p => ({
            ...p,
            mainWalletBalance: p.mainWalletBalance + p.commissionWalletBalance,
            commissionWalletBalance: 0,
          }));
        }}
        onSettleToBank={(amt) => {
          setProfile(p => ({
            ...p,
            mainWalletBalance: Math.max(0, p.mainWalletBalance - amt),
          }));
        }}
        onUpdateCashInDrawer={(amt) => {
          setProfile(p => ({ ...p, cashInDrawer: amt }));
        }}
      />

      {/* Commission Slabs Modal */}
      <CommissionSlabModal
        isOpen={isCommissionOpen}
        onClose={() => setIsCommissionOpen(false)}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onSelectAction={handleShortcutPaletteAction}
      />

      {/* Pre-lock Inactivity Warning (60s before auto-lock) */}
      <KioskIdleWarning
        show={showWarning && !isLocked}
        secondsRemaining={secondsRemaining}
        onStayLoggedIn={resetTimer}
        onLockNow={lockImmediately}
      />

      {/* Kiosk Full Screen Security Lockout Modal */}
      <KioskLockScreen
        isLocked={isLocked}
        profile={profile}
        onUnlock={() => {
          unlock();
          setLiveToast({
            id: `UNLOCK-${Date.now().toString().slice(-4)}`,
            title: 'Kiosk Terminal Unlocked',
            message: `Authentication verified. Welcome back, ${profile.name}.`,
            type: 'success',
          });
        }}
        onFullLogout={() => {
          unlock();
          setSelectedReceiptTxn(null);
          setIsWalletOpen(false);
          setIsCommissionOpen(false);
          setActiveTab('DMT');
          setLiveToast({
            id: `LOGOUT-${Date.now().toString().slice(-4)}`,
            title: 'Kiosk Session Reset',
            message: 'Terminal session cleared. Ready for next operator.',
            type: 'info',
          });
        }}
      />
    </div>
  );
}
