import React, { useRef, useState } from 'react';
import { 
  Printer, 
  Share2, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  X,
  Receipt
} from 'lucide-react';
import { AgentProfile, Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction | null;
  agentProfile: AgentProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  agentProfile,
  onClose,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*TRANSACTION RECEIPT - ${agentProfile.shopName}*\n` +
      `Txn ID: ${transaction.id}\n` +
      `RRN: ${transaction.rrn}\n` +
      (transaction.utr ? `UTR: ${transaction.utr}\n` : '') +
      `Service: ${transaction.service} (${transaction.subtype || ''})\n` +
      `Date: ${transaction.timestamp}\n` +
      `Customer: ${transaction.customerName}\n` +
      `Bank/Provider: ${transaction.bankOrOperator}\n` +
      `Amount: INR ${transaction.amount.toFixed(2)}\n` +
      `Status: SUCCESS\n` +
      `Toll Free Support: 1800-11-2211`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Printable Container */}
        <div id="printable-receipt" ref={printRef} className="space-y-4 font-sans text-slate-900">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-4">
            <div className="flex items-center justify-center gap-1.5 text-indigo-700 font-extrabold text-base tracking-tight mb-1">
              <Building2 className="w-5 h-5" />
              <span>{agentProfile.shopName}</span>
            </div>
            <div className="text-xs text-slate-500">
              Business Correspondent Center • {agentProfile.location}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              BC ID: {agentProfile.bcId} | Terminal: {agentProfile.terminalId}
            </div>

            {/* Status Stamp */}
            <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>TRANSACTION SUCCESSFUL</span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="font-mono font-bold text-slate-900">{transaction.txnReference}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">RRN (NPCI):</span>
              <span className="font-mono font-bold text-slate-900">{transaction.rrn}</span>
            </div>

            {transaction.utr && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bank UTR:</span>
                <span className="font-mono font-bold text-indigo-600">{transaction.utr}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-mono text-slate-700">{transaction.timestamp}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Service Category:</span>
              <span className="font-bold text-slate-800">{transaction.service} ({transaction.subtype})</span>
            </div>

            <div className="border-t border-slate-200 my-1 pt-1.5 flex justify-between items-center">
              <span className="text-slate-500">Customer Name:</span>
              <span className="font-bold text-slate-900">{transaction.customerName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mobile Number:</span>
              <span className="font-mono text-slate-700">+91 {transaction.customerMobile}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">A/c or Identifier:</span>
              <span className="font-mono font-medium text-slate-800">{transaction.accountOrAadhaarOrConsumer}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Bank / Provider:</span>
              <span className="font-medium text-slate-800">{transaction.bankOrOperator}</span>
            </div>

            {/* Financial Totals */}
            <div className="border-t border-slate-200 mt-2 pt-2 space-y-1">
              <div className="flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-800">Transaction Amount:</span>
                <span className="text-base font-extrabold font-mono text-slate-900">
                  ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Customer Surcharge / Fee:</span>
                <span className="font-mono">₹{transaction.fee.toFixed(2)}</span>
              </div>
              {transaction.balanceRemaining !== undefined && (
                <div className="flex justify-between text-xs font-semibold text-emerald-800 pt-1">
                  <span>Available Bank Balance:</span>
                  <span className="font-mono">₹{transaction.balanceRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mini Statement Table if applicable */}
          {transaction.miniStatement && transaction.miniStatement.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-[11px]">
              <div className="font-bold text-slate-800 mb-1.5">Last Account Transactions:</div>
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200 text-[10px]">
                    <th className="pb-1">Date</th>
                    <th className="pb-1">Type</th>
                    <th className="pb-1">Amount</th>
                    <th className="pb-1 text-right">Narration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transaction.miniStatement.map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{m.date}</td>
                      <td className={`py-1 font-bold ${m.type === 'CR' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.type}
                      </td>
                      <td className="py-1">₹{m.amount.toFixed(0)}</td>
                      <td className="py-1 text-right truncate max-w-[120px]">{m.narration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Barcode & Verification Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <div className="font-semibold text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                RBI / NPCI Central Switch Certified
              </div>
              <div>Keep this receipt safe for reference. Dispute helpline: 1800-11-2211</div>
            </div>

            {/* Dummy verification QR code visual */}
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center p-1">
              <QrCode className="w-9 h-9 text-slate-700" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
          <button
            id="btn-print-receipt-dialog"
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt Slip</span>
          </button>

          <button
            id="btn-whatsapp-share-slip"
            type="button"
            onClick={handleShareWhatsApp}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {copiedShare ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedShare ? 'Receipt Copied!' : 'Share WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
