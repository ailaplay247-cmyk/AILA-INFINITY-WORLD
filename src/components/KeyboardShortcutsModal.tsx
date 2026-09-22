import React from 'react';
import { 
  Keyboard, 
  X, 
  Send, 
  Fingerprint, 
  Receipt, 
  Activity, 
  Wallet, 
  Percent, 
  Lock, 
  Zap, 
  Sliders,
  ShieldCheck,
  User,
  Smartphone,
  Tv,
  Film,
  Landmark
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modifierLabel = isMac ? '⌘ / ⌥' : 'Ctrl / Alt';

  const shortcutSections = [
    {
      category: 'Service Navigation',
      items: [
        {
          keys: [modifierLabel, '1'],
          label: 'Money Transfer (DMT)',
          description: 'Instant domestic IMPS/NEFT transfer with bank IFSC lookups',
          icon: Send,
          action: 'TAB_DMT',
        },
        {
          keys: [modifierLabel, '2'],
          label: 'Aadhaar ATM (AePS)',
          description: 'Biometric cash withdrawal, balance enquiry, mini statement & audit',
          icon: Fingerprint,
          action: 'TAB_AEPS',
        },
        {
          keys: [modifierLabel, '3'],
          label: 'Mobile Recharge',
          description: 'Prepaid mobile recharge across all operators with plans catalog',
          icon: Smartphone,
          action: 'TAB_RECHARGE',
        },
        {
          keys: [modifierLabel, '4'],
          label: 'Bill Payments (BBPS)',
          description: '20,000+ utility billers with BBPCU fetch & instant receipts',
          icon: Receipt,
          action: 'TAB_BBPS',
        },
        {
          keys: [modifierLabel, '5'],
          label: 'DTH Connection & Recharge',
          description: 'Instant recharge, 3-day emergency loan, heavy refresh & new connection',
          icon: Tv,
          action: 'TAB_DTH',
        },
        {
          keys: [modifierLabel, '6'],
          label: 'OTT Subscriptions',
          description: 'Hotstar, SonyLIV, ZEE5, Prime Video & Combo activation vouchers',
          icon: Film,
          action: 'TAB_OTT',
        },
        {
          keys: [modifierLabel, '7'],
          label: 'Micro-Insurance',
          description: 'Two-Wheeler, HospiCash, Personal Accident & Cyber Protection',
          icon: ShieldCheck,
          action: 'TAB_INSURANCE',
        },
        {
          keys: [modifierLabel, '8'],
          label: 'LIC Premium Renewal',
          description: 'Direct renewal payment with instant Section 80C Tax exemption slip',
          icon: Landmark,
          action: 'TAB_LIC',
        },
        {
          keys: [modifierLabel, '9'],
          label: 'Transaction Tracker Feed',
          description: 'Live switch activity feed, status queries & PDF receipt reprints',
          icon: Activity,
          action: 'TAB_TRACKER',
        },
      ],
    },
    {
      category: 'Agent Float & Earnings',
      items: [
        {
          keys: ['Ctrl / Alt', 'W'],
          label: 'Float & Settlement Wallet',
          description: 'Inspect live main float, commission wallet, transfer funds, or settle to bank',
          icon: Wallet,
          action: 'OPEN_WALLET',
        },
        {
          keys: ['Ctrl / Alt', 'S'],
          label: 'Commission Slabs & Margins',
          description: 'Lookup real-time agent commissions across transaction amount tiers',
          icon: Percent,
          action: 'OPEN_COMMISSION',
        },
      ],
    },
    {
      category: 'Terminal Security & Controls',
      items: [
        {
          keys: ['Ctrl / Alt', 'U'],
          label: 'User / Agent Profile Details',
          description: 'View agent credentials, bank KYC, device status, and transaction limits',
          icon: User,
          action: 'OPEN_PROFILE',
        },
        {
          keys: ['Ctrl / Alt', 'L'],
          label: 'Lock Kiosk Terminal Immediately',
          description: 'Instantly lock screen with PIN/password protection during counter breaks',
          icon: Lock,
          action: 'LOCK_KIOSK',
        },
        {
          keys: ['Ctrl / Alt', 'M'],
          label: 'Toggle Live Switch Simulation',
          description: 'Simulate background NPCI switch traffic and webhook clearances',
          icon: Zap,
          action: 'TOGGLE_SIMULATION',
        },
        {
          keys: ['Ctrl / Alt', 'K'],
          altKeys: ['?'],
          label: 'Shortcuts Reference Palette',
          description: 'Toggle this keyboard shortcuts cheat-sheet modal anywhere',
          icon: Keyboard,
          action: 'SHORTCUTS',
        },
        {
          keys: ['Esc'],
          label: 'Dismiss Any Modal / Dialog',
          description: 'Close active popups, receipts, or prompt drawers instantly',
          icon: Sliders,
          action: 'CLOSE_MODAL',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Agent Keyboard Shortcuts
                </h3>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                  High-Speed POS Mode
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Execute rapid tab switching and critical kiosk actions without reaching for the mouse
              </p>
            </div>
          </div>

          <button
            id="btn-close-shortcuts-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Quick Tip Banner */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 space-y-0.5">
              <span className="font-bold">Pro-tip for peak rush hours:</span>
              <p className="text-indigo-800/90 text-[11px]">
                Both <kbd className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded font-mono font-bold text-[10px] text-indigo-900">Ctrl</kbd> and <kbd className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded font-mono font-bold text-[10px] text-indigo-900">Alt</kbd> keys can be used interchangeably. On Mac systems, <kbd className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded font-mono font-bold text-[10px] text-indigo-900">⌥ Option</kbd> is also supported.
              </p>
            </div>
          </div>

          {/* Sections */}
          {shortcutSections.map((section) => (
            <div key={section.category} className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {section.category}
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      onClick={() => {
                        if (onSelectAction && item.action) {
                          onSelectAction(item.action);
                        }
                      }}
                      className="p-3 bg-slate-50/60 hover:bg-indigo-50/40 rounded-2xl border border-slate-200 hover:border-indigo-200 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-200 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-950">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-mono font-bold text-slate-700 shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                        {item.altKeys && (
                          <>
                            <span className="text-slate-400 text-xs">or</span>
                            {item.altKeys.map((k) => (
                              <kbd
                                key={k}
                                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-mono font-bold text-slate-700 shadow-2xs"
                              >
                                {k}
                              </kbd>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-700">?</kbd> anytime to open this guide
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
