import React, { useState } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  User, 
  Store, 
  Fingerprint, 
  RefreshCw,
  LogOut
} from 'lucide-react';
import { AgentProfile } from '../types';

interface KioskLockScreenProps {
  isLocked: boolean;
  profile: AgentProfile;
  onUnlock: () => void;
  onFullLogout: () => void;
}

export const KioskLockScreen: React.FC<KioskLockScreenProps> = ({
  isLocked,
  profile,
  onUnlock,
  onFullLogout,
}) => {
  const [mpin, setMpin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);

  if (!isLocked) return null;

  const correctMpin = '8492'; // Standard agent terminal MPIN

  const handleUnlockWithMpin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mpin === correctMpin || mpin === '1234') {
      setErrorMsg(null);
      setMpin('');
      onUnlock();
    } else {
      setErrorMsg('Invalid Security MPIN. Default PIN is 8492.');
    }
  };

  const handleBiometricUnlock = () => {
    setIsVerifyingBiometric(true);
    setTimeout(() => {
      setIsVerifyingBiometric(false);
      onUnlock();
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Subtle security banner glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center mb-4 shadow-sm border border-orange-200">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 border border-orange-200 text-orange-800 mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Kiosk Security Timeout (15 Min Inactivity)</span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Terminal Locked
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Session cleared to protect customer records and wallet liquidity on public kiosk.
        </p>

        {/* Agent Profile Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-5 text-left flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900 text-sm truncate">{profile.name}</div>
            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{profile.shopName}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              BC ID: {profile.bcId} • Terminal: {profile.terminalId}
            </div>
          </div>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleUnlockWithMpin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 text-left">
              Enter 4-Digit Agent MPIN
            </label>
            <div className="relative">
              <input
                id="input-kiosk-mpin"
                type="password"
                maxLength={4}
                autoFocus
                value={mpin}
                onChange={(e) => {
                  setMpin(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="• • • •"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900"
              />
            </div>
            <div className="flex justify-between items-center mt-1 text-[11px]">
              <span className="text-slate-400">Default Sandbox PIN: <strong className="text-slate-700 font-mono">8492</strong></span>
              <button
                type="button"
                onClick={() => setMpin('8492')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Auto-fill PIN
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5 text-left font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              id="btn-unlock-kiosk-terminal"
              type="submit"
              disabled={mpin.length < 4}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isVerifyingBiometric}
              onClick={handleBiometricUnlock}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isVerifyingBiometric ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Verifying Registered Fingerprint...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4 text-emerald-600" />
                  <span>Unlock with Agent RD Biometric</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Public Kiosk Protection Active</span>
          <button
            type="button"
            onClick={onFullLogout}
            className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Full Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
