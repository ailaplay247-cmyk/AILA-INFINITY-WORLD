import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  X, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  Copy, 
  Check, 
  ArrowRight,
  Wallet,
  IndianRupee
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

interface DynamicQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  surcharge: number;
  customerName: string;
  customerMobile: string;
  onPaymentReceived: (fundedAmount: number) => void;
}

export const DynamicQrModal: React.FC<DynamicQrModalProps> = ({
  isOpen,
  onClose,
  amount,
  surcharge,
  customerName,
  customerMobile,
  onPaymentReceived,
}) => {
  const totalPayable = amount + surcharge;
  const [secondsRemaining, setSecondsRemaining] = useState(180); // 3 minutes expiry
  const [paymentStatus, setPaymentStatus] = useState<'WAITING' | 'PROCESSING' | 'SUCCESS'>('WAITING');
  const [copiedVpa, setCopiedVpa] = useState(false);

  const virtualVpa = 'digiagent.bc84920@sbi';
  const txnRef = `UPI${Date.now().toString().slice(-8)}`;

  // Formatted UPI Intent URL
  const upiIntentUri = `upi://pay?pa=${virtualVpa}&pn=DigiAgent%20CashIn&am=${totalPayable.toFixed(2)}&cu=INR&tn=DMT-Funding-${txnRef}`;

  // Countdown timer
  useEffect(() => {
    if (!isOpen || paymentStatus === 'SUCCESS') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymentStatus]);

  // Reset when modal opens with new amount
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(180);
      setPaymentStatus('WAITING');
    }
  }, [isOpen, amount]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(virtualVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  // Simulate customer scanning and completing UPI payment
  const handleSimulatePayment = () => {
    setPaymentStatus('PROCESSING');
    setTimeout(() => {
      setPaymentStatus('SUCCESS');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      // Trigger callback to fund agent wallet
      onPaymentReceived(totalPayable);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative my-8 text-slate-900">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-3 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Dynamic Customer Collection QR</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Scan & Fund Agent Float</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer scans with any UPI app (GPay, PhonePe, Paytm, BHIM)
          </p>
        </div>

        {paymentStatus === 'SUCCESS' ? (
          /* Payment Success View */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Payment Received via UPI
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1.5">
                ₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Ref ID: <span className="font-mono font-bold text-slate-800">{txnRef}</span>
              </p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 text-left space-y-1">
              <div className="flex justify-between font-medium">
                <span>Payer Mobile / Customer:</span>
                <span className="font-bold">{customerName || 'Walk-in Customer'} (+91 {customerMobile})</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Added to Agent Float:</span>
                <span className="font-bold text-emerald-700 font-mono">+₹{totalPayable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800 pt-1 border-t border-emerald-200">
                <span>NPCI UPI Switch Status:</span>
                <span className="font-bold">Settled (Response 00)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <span>Continue with Money Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Active QR & Scanning View */
          <div className="py-4 space-y-4 text-xs">
            {/* Amount Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Collectible</span>
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  ₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <div>Transfer: ₹{amount.toLocaleString('en-IN')}</div>
                <div className="text-slate-400 font-mono">+ Fee: ₹{surcharge.toFixed(2)}</div>
              </div>
            </div>

            {/* Dynamic QR Display Frame */}
            <div className="relative mx-auto w-64 p-4 bg-white rounded-2xl border-2 border-indigo-600 shadow-md flex flex-col items-center">
              {/* Pulsing scanning radar line */}
              {paymentStatus === 'PROCESSING' && (
                <div className="absolute inset-x-4 top-4 h-1 bg-indigo-500 rounded animate-pulse shadow-[0_0_12px_#6366f1]" />
              )}

              {/* Rendered dynamic QR Code */}
              <div className="bg-white p-2 rounded-xl">
                <QRCodeSVG
                  value={upiIntentUri}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Supported UPI Apps strip */}
              <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-slate-100 w-full text-[10px] text-slate-500 font-semibold">
                <span>GPay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM</span>
              </div>
            </div>

            {/* Live Polling & Timer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-slate-700 font-medium">
                  {paymentStatus === 'PROCESSING' ? 'Processing UPI switch confirmation...' : 'Listening for instant UPI credit...'}
                </span>
              </div>

              <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            </div>

            {/* VPA Copy Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Agent UPI VPA</div>
                <div className="font-mono font-bold text-slate-800 text-xs">{virtualVpa}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedVpa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Interactive Simulation Button for Sandbox Demo */}
            <div className="pt-2">
              <button
                id="btn-simulate-customer-upi-pay"
                type="button"
                disabled={paymentStatus === 'PROCESSING'}
                onClick={handleSimulatePayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {paymentStatus === 'PROCESSING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with NPCI UPI Switch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simulate Customer Scan & Pay (₹{totalPayable.toFixed(2)})</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1">
                Funds the agent float wallet immediately so you can execute the DMT transfer without dipping into counter cash.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
