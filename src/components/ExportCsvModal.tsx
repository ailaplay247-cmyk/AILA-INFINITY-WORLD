import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  Check, 
  Calendar, 
  FileText, 
  Table, 
  Layers, 
  IndianRupee, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Transaction, AgentProfile } from '../types';

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredTransactions: Transaction[];
  allTransactions: Transaction[];
  agentProfile: AgentProfile;
}

export const ExportCsvModal: React.FC<ExportCsvModalProps> = ({
  isOpen,
  onClose,
  filteredTransactions,
  allTransactions,
  agentProfile,
}) => {
  const [exportScope, setExportScope] = useState<'FILTERED' | 'ALL'>('FILTERED');
  const [includeSummaryRow, setIncludeSummaryRow] = useState(true);
  const [includeAgentMetadata, setIncludeAgentMetadata] = useState(true);
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY'>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const baseList = exportScope === 'FILTERED' ? filteredTransactions : allTransactions;
  const listToExport = dateFilter === 'TODAY'
    ? baseList.filter(t => t.timestamp.startsWith(new Date().toISOString().slice(0, 10)))
    : baseList;

  const totalVolume = listToExport
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCommission = listToExport
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.commission, 0);

  const totalSurcharge = listToExport
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.fee, 0);

  const handleGenerateCsv = () => {
    const lines: string[] = [];

    // Optional metadata headers for accountant / auditor
    if (includeAgentMetadata) {
      lines.push(`# DIGIAGENT AGENT BANKING ACCOUNTING LEDGER EXPORT`);
      lines.push(`# Agent Shop: "${agentProfile.shopName}" | BC ID: ${agentProfile.bcId} | Terminal: ${agentProfile.terminalId}`);
      lines.push(`# Agent Name: "${agentProfile.name}" | Location: "${agentProfile.location}"`);
      lines.push(`# Generated At: ${new Date().toISOString()}`);
      lines.push(`# Total Transactions: ${listToExport.length} | Settled Volume: INR ${totalVolume.toFixed(2)} | Commission Earned: INR ${totalCommission.toFixed(2)}`);
      lines.push(``); // blank line before table
    }

    // CSV Column Headers
    const headers = [
      'Transaction ID',
      'NPCI Reference',
      'RRN (12-Digit)',
      'Bank UTR',
      'Date & Time',
      'Service Category',
      'Subtype',
      'Status',
      'Amount (INR)',
      'Customer Surcharge (INR)',
      'Agent Commission (INR)',
      'Customer Name',
      'Customer Mobile',
      'A/c or Identifier',
      'Bank or Operator',
      'IFSC Code',
      'Transfer Mode',
      'Remaining Balance (INR)',
    ];
    lines.push(headers.map(h => `"${h}"`).join(','));

    // Data rows
    listToExport.forEach((tx) => {
      const row = [
        tx.id,
        tx.txnReference,
        tx.rrn,
        tx.utr || 'N/A',
        tx.timestamp,
        tx.service,
        tx.subtype || '',
        tx.status,
        tx.amount.toFixed(2),
        tx.fee.toFixed(2),
        tx.commission.toFixed(2),
        `"${tx.customerName.replace(/"/g, '""')}"`,
        tx.customerMobile,
        `"${tx.accountOrAadhaarOrConsumer}"`,
        `"${tx.bankOrOperator.replace(/"/g, '""')}"`,
        tx.ifsc || 'N/A',
        tx.mode || 'N/A',
        tx.balanceRemaining !== undefined ? tx.balanceRemaining.toFixed(2) : 'N/A',
      ];
      lines.push(row.join(','));
    });

    // Accounting summary row at the bottom for spreadsheet formulas & audits
    if (includeSummaryRow) {
      lines.push(``);
      lines.push(
        [
          '"ACCOUNTING TOTALS"',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          `"COUNT: ${listToExport.length}"`,
          `"${totalVolume.toFixed(2)}"`,
          `"${totalSurcharge.toFixed(2)}"`,
          `"${totalCommission.toFixed(2)}"`,
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
        ].join(',')
      );
    }

    const csvString = lines.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `DigiAgent_Accounting_Ledger_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Export Accounting CSV Ledger</h3>
            <p className="text-xs text-slate-500">Download offline records for book-keeping & Tally/Excel</p>
          </div>
        </div>

        {downloadSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">CSV Ledger Downloaded Successfully!</h4>
            <p className="text-xs text-slate-500">
              Your offline accounting sheet has been saved. Compatible with Excel, Tally, and Google Sheets.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Scope Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Export Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportScope('FILTERED')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    exportScope === 'FILTERED'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                  }`}
                >
                  <div className="font-bold text-slate-900">Current Filtered View</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {filteredTransactions.length} records matching current search
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExportScope('ALL')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    exportScope === 'ALL'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                  }`}
                >
                  <div className="font-bold text-slate-900">All Transactions</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {allTransactions.length} total recorded entries
                  </div>
                </button>
              </div>
            </div>

            {/* Date Preset */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDateFilter('ALL')}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                    dateFilter === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All Recorded Dates
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('TODAY')}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                    dateFilter === 'TODAY'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Today's Session Only
                </button>
              </div>
            </div>

            {/* Accounting Totals Preview Card */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Export Ledger Summary ({listToExport.length} Transactions)
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <div className="text-[10px] text-slate-400">Total Volume</div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    ₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Commission Earned</div>
                  <div className="text-xs font-bold text-emerald-700 font-mono">
                    ₹{totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Customer Surcharge</div>
                  <div className="text-xs font-bold text-indigo-700 font-mono">
                    ₹{totalSurcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Formatting Options */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSummaryRow}
                  onChange={(e) => setIncludeSummaryRow(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">
                  Append Totals & Balancing row at the end of the sheet
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAgentMetadata}
                  onChange={(e) => setIncludeAgentMetadata(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">
                  Include BC Agent metadata & timestamp header (for bank reconciliation)
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                id="btn-download-csv-ledger"
                type="button"
                onClick={handleGenerateCsv}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV ({listToExport.length} Entries)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
