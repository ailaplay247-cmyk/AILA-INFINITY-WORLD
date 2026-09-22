import React, { useState } from 'react';
import { 
  Building2, 
  Wallet, 
  Coins, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Fingerprint, 
  ArrowUpRight, 
  Percent, 
  MapPin, 
  Store,
  SlidersHorizontal,
  AlertTriangle,
  Settings2,
  X,
  Check,
  Lock,
  Clock,
  Keyboard,
  User
} from 'lucide-react';
import { AgentProfile } from '../types';

interface HeaderProps {
  profile: AgentProfile;
  onOpenWallet: () => void;
  onOpenCommissionSlabs: () => void;
  onToggleSimulateIncoming: () => void;
  isSimulating: boolean;
  onUpdateThreshold?: (newThreshold: number) => void;
  secondsRemaining?: number;
  onLockKioskNow?: () => void;
  onSimulateIdleTimeout?: () => void;
  onOpenShortcuts?: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenWallet,
  onOpenCommissionSlabs,
  onToggleSimulateIncoming,
  isSimulating,
  onUpdateThreshold,
  secondsRemaining = 900,
  onLockKioskNow,
  onSimulateIdleTimeout,
  onOpenShortcuts,
  onOpenProfile,
}) => {
  const currentThreshold = profile.lowBalanceThreshold ?? 5000;
  const isLowBalance = profile.mainWalletBalance < currentThreshold;

  // Format idle timer
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedIdleTime = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  // Popover state to configure threshold
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  const [inputThreshold, setInputThreshold] = useState<number | ''>(currentThreshold);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveThreshold = (val: number) => {
    if (val <= 0) return;
    if (onUpdateThreshold) {
      onUpdateThreshold(val);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowThresholdConfig(false);
    }, 900);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top micro status bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 font-medium text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
              title="Click to view full Agent & Kiosk Profile details"
            >
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <span>{profile.shopName}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono text-[11px]">BC ID: {profile.bcId}</span>
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBI / NPCI Registered Agent</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">NPCI Switch: <span className="text-emerald-400 font-medium">32ms</span></span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <span>BBPS Central:</span>
              <span className="text-emerald-400 font-medium">Online</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <Fingerprint className="w-3 h-3 text-indigo-400" />
              <span>RD Service:</span>
              <span className="text-emerald-400 font-medium">Mantra MFS100 Ready</span>
            </div>

            {/* Kiosk Idle Session Guard Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/80 text-[11px] text-slate-300">
              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Kiosk Lock: <strong className="font-mono text-amber-300">{formattedIdleTime}</strong></span>
              {onLockKioskNow && (
                <button
                  id="btn-header-lock-kiosk"
                  type="button"
                  onClick={onLockKioskNow}
                  className="ml-1 text-slate-400 hover:text-amber-300 underline text-[10px] cursor-pointer"
                  title="Lock terminal immediately"
                >
                  Lock
                </button>
              )}
              {onSimulateIdleTimeout && (
                <button
                  id="btn-header-sim-idle"
                  type="button"
                  onClick={onSimulateIdleTimeout}
                  className="ml-1 px-1 py-0.2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[9px] font-mono cursor-pointer"
                  title="Simulate 15 min idle session expiration for quick evaluation"
                >
                  Sim 15m
                </button>
              )}
            </div>

            <button
              id="header-live-simulation-toggle"
              onClick={onToggleSimulateIncoming}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                isSimulating 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle automatic live simulated gateway status updates"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Live Pulse ON' : 'Live Pulse OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation & Agent wallet balances */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Agent Info */}
          <div className="flex items-center justify-between">
            <div 
              onClick={onOpenProfile}
              className={`flex items-center gap-3 ${onOpenProfile ? 'cursor-pointer group' : ''}`}
              title={onOpenProfile ? 'Click to view full Agent Profile & Credentials' : undefined}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-700 transition-colors">
                    DigiAgent Portal
                  </h1>
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    DMT • AEPS • BBPS
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{profile.location}</span>
                  <span className="mx-1">•</span>
                  <span className="font-medium text-slate-700 group-hover:text-indigo-600 underline-offset-2 transition-colors">
                    {profile.name}
                  </span>
                </p>
              </div>
            </div>

            {/* Mobile Wallet & Profile button triggers */}
            <div className="flex md:hidden items-center gap-2">
              {onOpenProfile && (
                <button
                  id="btn-mobile-profile"
                  type="button"
                  onClick={onOpenProfile}
                  className="p-2 rounded-lg border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                  title="View User Profile"
                >
                  <User className="w-5 h-5 text-indigo-600" />
                </button>
              )}
              <button
                id="btn-mobile-wallet"
                onClick={onOpenWallet}
                className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  isLowBalance
                    ? 'bg-orange-100 text-orange-700 border-orange-300 ring-2 ring-orange-400/60'
                    : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                }`}
              >
                <Wallet className="w-5 h-5" />
                {isLowBalance && <AlertTriangle className="w-4 h-4 text-orange-600 animate-pulse" />}
              </button>
            </div>
          </div>

          {/* Desktop Wallets & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Main Float Wallet Card with Orange Threshold Warning */}
            <div className="relative">
              <div 
                id="card-main-wallet"
                onClick={onOpenWallet}
                className={`rounded-xl px-3.5 py-2 transition-all cursor-pointer group flex items-center gap-3 border ${
                  isLowBalance
                    ? 'bg-orange-50/90 hover:bg-orange-100/90 border-orange-300 ring-2 ring-orange-400/60 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
                title={isLowBalance ? `Low Float Warning: Balance is below configurable limit of ₹${currentThreshold.toLocaleString('en-IN')}` : 'Click to manage float & liquidity'}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                  isLowBalance
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {isLowBalance ? (
                    <AlertTriangle className="w-4 h-4 text-orange-600 animate-bounce" />
                  ) : (
                    <Wallet className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <span className={isLowBalance ? 'text-orange-800 font-bold' : 'text-slate-500'}>
                      Float Balance
                    </span>
                    {isLowBalance ? (
                      <span className="flex items-center gap-0.5 text-[9px] bg-orange-200 text-orange-950 px-1.5 py-0.2 rounded font-extrabold tracking-wide uppercase animate-pulse">
                        Low Float
                      </span>
                    ) : (
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    )}
                  </div>
                  <div className={`text-sm font-bold font-mono ${
                    isLowBalance ? 'text-orange-950 font-black' : 'text-slate-900'
                  }`}>
                    ₹{profile.mainWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Small threshold config cog button on the card */}
                <button
                  id="btn-open-threshold-config"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInputThreshold(currentThreshold);
                    setShowThresholdConfig(!showThresholdConfig);
                  }}
                  className={`p-1 rounded-md transition-colors cursor-pointer ml-1 ${
                    isLowBalance
                      ? 'text-orange-700 hover:bg-orange-200/80'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                  }`}
                  title="Configure Low Balance Alert Threshold"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Threshold Configuration Popover */}
              {showThresholdConfig && (
                <div 
                  className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-72 text-xs space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Low Float Alert Threshold</span>
                    </div>
                    <button
                      onClick={() => setShowThresholdConfig(false)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Highlights the Float Wallet in <strong className="text-orange-700">orange</strong> when balance drops below this amount.
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Threshold Limit (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">₹</span>
                      <input
                        type="number"
                        value={inputThreshold}
                        onChange={(e) => setInputThreshold(e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-6 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      {[2000, 5000, 10000, 50000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setInputThreshold(preset);
                            handleSaveThreshold(preset);
                          }}
                          className={`py-1 text-[10px] font-mono font-semibold rounded-md border transition-colors cursor-pointer ${
                            inputThreshold === preset
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowThresholdConfig(false)}
                      className="w-1/3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const val = typeof inputThreshold === 'number' ? inputThreshold : 5000;
                        handleSaveThreshold(val);
                      }}
                      className="w-2/3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {savedSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                      <span>{savedSuccess ? 'Saved!' : 'Save Limit'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Commission Wallet */}
            <div 
              id="card-commission-wallet"
              onClick={onOpenWallet}
              className="bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/80 rounded-xl px-3.5 py-2 transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <span>Commission</span>
                  <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-1 rounded font-semibold">Earned</span>
                </div>
                <div className="text-sm font-bold text-emerald-800 font-mono">
                  ₹{profile.commissionWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Commission Slabs & Rates */}
            <button
              id="btn-commission-slabs"
              onClick={onOpenCommissionSlabs}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Percent className="w-3.5 h-3.5 text-indigo-600" />
              <span>Commission Slabs</span>
            </button>

            {/* Agent / User Profile Section Trigger */}
            {onOpenProfile && (
              <button
                id="btn-open-user-profile"
                type="button"
                onClick={onOpenProfile}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center gap-2 transition-all shadow-2xs cursor-pointer group"
                title="View Agent / User Profile Details (Ctrl+U)"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {profile.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                </div>
                <div className="text-left hidden xl:block">
                  <span className="block text-[11px] font-bold text-slate-800 leading-tight">Profile</span>
                  <span className="flex items-center gap-0.5 text-[9px] text-emerald-600 font-bold leading-none">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
                <span className="hidden sm:inline-block xl:hidden text-xs font-bold text-slate-700">
                  Profile
                </span>
                <kbd className="hidden 2xl:inline-block px-1 py-0.2 bg-slate-100 border border-slate-300 rounded text-[9px] font-mono text-slate-500">
                  ^U
                </kbd>
              </button>
            )}

            {/* Keyboard Shortcuts Palette Trigger */}
            {onOpenShortcuts && (
              <button
                id="btn-open-keyboard-shortcuts"
                type="button"
                onClick={onOpenShortcuts}
                className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Agent High-Speed Keyboard Shortcuts (Ctrl+K or ?)"
              >
                <Keyboard className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Shortcuts</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.2 bg-slate-100 border border-slate-300 rounded text-[9px] font-mono font-bold text-slate-600 shadow-2xs">
                  ?
                </kbd>
              </button>
            )}

            {/* Settle / Manage Float */}
            <button
              id="btn-manage-wallet"
              onClick={onOpenWallet}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-500/20 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Manage Float</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

