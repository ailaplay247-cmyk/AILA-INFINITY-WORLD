import React from 'react';
import { ShieldAlert, Clock, ArrowRight, RefreshCw } from 'lucide-react';

interface KioskIdleWarningProps {
  show: boolean;
  secondsRemaining: number;
  onStayLoggedIn: () => void;
  onLockNow: () => void;
}

export const KioskIdleWarning: React.FC<KioskIdleWarningProps> = ({
  show,
  secondsRemaining,
  onStayLoggedIn,
  onLockNow,
}) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-amber-500/40 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Kiosk Inactivity Warning
            </span>
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800">
              <Clock className="w-3 h-3" />
              {secondsRemaining}s
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-1">
            Session will lock automatically to safeguard sensitive financial data.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              id="btn-stay-logged-in"
              type="button"
              onClick={onStayLoggedIn}
              className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Keep Session Active
            </button>
            <button
              id="btn-lock-now-warning"
              type="button"
              onClick={onLockNow}
              className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Lock Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
