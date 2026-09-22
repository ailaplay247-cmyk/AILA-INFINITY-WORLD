import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  ExternalLink, 
  ChevronRight, 
  Building2, 
  Smartphone, 
  Copy, 
  Check, 
  Download, 
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  X,
  User,
  Hash,
  SlidersHorizontal
} from 'lucide-react';
import { ServiceType, Transaction, TxStatus, AgentProfile } from '../types';
import { ExportCsvModal } from './ExportCsvModal';

interface TransactionTrackerProps {
  transactions: Transaction[];
  agentProfile: AgentProfile;
  onRequeryStatus: (txnId: string) => void;
  onShowReceipt: (tx: Transaction) => void;
  onSimulateNewTxn: () => void;
}

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({
  transactions,
  agentProfile,
  onRequeryStatus,
  onShowReceipt,
  onSimulateNewTxn,
}) => {
  const [selectedService, setSelectedService] = useState<ServiceType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<TxStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'ALL' | 'CUSTOMER' | 'MOBILE' | 'REF'>('ALL');
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);
  const [copiedRrn, setCopiedRrn] = useState<string | null>(null);
  const [ticketModalTxn, setTicketModalTxn] = useState<Transaction | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter transactions by Service, Status, and Search Query (Customer Name, Mobile Number, UTR / RRN)
  const filtered = transactions.filter((t) => {
    if (selectedService !== 'ALL' && t.service !== selectedService) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCustomer = t.customerName?.toLowerCase().includes(q);
      const matchMobile = t.customerMobile?.toLowerCase().includes(q);
      const matchRrn = t.rrn?.toLowerCase().includes(q);
      const matchUtr = t.utr?.toLowerCase().includes(q);
      const matchAccount = t.accountOrAadhaarOrConsumer?.toLowerCase().includes(q);
      const matchBank = t.bankOrOperator?.toLowerCase().includes(q);
      const matchRef = t.txnReference?.toLowerCase().includes(q);

      if (searchScope === 'CUSTOMER') {
        if (!matchCustomer) return false;
      } else if (searchScope === 'MOBILE') {
        if (!matchMobile) return false;
      } else if (searchScope === 'REF') {
        if (!matchRrn && !matchUtr && !matchRef) return false;
      } else {
        // 'ALL' scope matches Customer Name, Mobile Number, UTR, RRN, or Account/Bank
        if (!matchCustomer && !matchMobile && !matchRrn && !matchUtr && !matchAccount && !matchBank && !matchRef) {
          return false;
        }
      }
    }
    return true;
  });

  const handleCopyRrn = (rrn: string) => {
    navigator.clipboard.writeText(rrn);
    setCopiedRrn(rrn);
    setTimeout(() => setCopiedRrn(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['Txn ID', 'Reference', 'RRN', 'UTR', 'Date & Time', 'Service', 'Subtype', 'Status', 'Amount (INR)', 'Commission (INR)', 'Customer', 'Mobile', 'Bank / Operator'];
    const rows = filtered.map(t => [
      t.id,
      t.txnReference,
      t.rrn,
      t.utr || 'N/A',
      t.timestamp,
      t.service,
      t.subtype || '',
      t.status,
      t.amount,
      t.commission,
      `"${t.customerName}"`,
      t.customerMobile,
      `"${t.bankOrOperator}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DigiAgent_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const expandedTxn = transactions.find(t => t.id === expandedTxnId);

  return (
    <div className="space-y-4">
      {/* Tracker Header & Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Real-Time Transaction Tracker</h2>
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end monitoring across NPCI IMPS, UIDAI AePS switch, and BBPS central unit
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-simulate-live-event"
              onClick={onSimulateNewTxn}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Simulate a real-time incoming switch transaction"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Gateway Event</span>
            </button>

            <button
              id="btn-export-csv"
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Export current transaction list as CSV for offline accounting and bank reconciliation"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Accounting CSV</span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded-full font-mono font-extrabold">
                {filtered.length}
              </span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-100">
          {/* Search box with targeted Customer Name, Mobile Number, or UTR/RRN search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-tracker-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchScope === 'CUSTOMER'
                  ? 'Filter by Customer Name (e.g., Rajesh, Priya)...'
                  : searchScope === 'MOBILE'
                  ? 'Filter by 10-digit Mobile Number (e.g., 98765)...'
                  : searchScope === 'REF'
                  ? 'Filter by UTR or 12-digit RRN (e.g., RRN982, CMS)...'
                  : 'Search by Customer Name, Mobile Number, or UTR / RRN...'
              }
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl text-xs focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

            {/* Service Filter */}
            <div className="sm:col-span-3">
              <select
                id="select-filter-service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="ALL">All Services ({transactions.length})</option>
                <option value="DMT">Money Transfer (DMT)</option>
                <option value="AEPS">Aadhaar ATM (AePS)</option>
                <option value="RECHARGE">Mobile Recharge</option>
                <option value="BBPS">Bill Payments (BBPS)</option>
                <option value="DTH">DTH Connection & Recharge</option>
                <option value="OTT">OTT Subscription</option>
                <option value="INSURANCE">Micro-Insurance</option>
                <option value="LIC">LIC Premium Renewal</option>
              </select>
            </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="PENDING">Pending / Processing</option>
              <option value="FAILED">Failed</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>
        </div>

        {/* Search Field Scope Selector Pills & Summary */}
        <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Search Scope:</span>
            <button
              type="button"
              onClick={() => setSearchScope('ALL')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchScope === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>All Fields</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchScope('CUSTOMER')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchScope === 'CUSTOMER'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Customer Name</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchScope('MOBILE')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchScope === 'MOBILE'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobile Number</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchScope('REF')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchScope === 'REF'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Hash className="w-3 h-3" />
              <span>UTR / RRN</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
            <span>
              Showing <span className="font-bold text-indigo-700">{filtered.length}</span> of {transactions.length} records
            </span>
            {(searchQuery || selectedService !== 'ALL' || selectedStatus !== 'ALL' || searchScope !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedService('ALL');
                  setSelectedStatus('ALL');
                  setSearchScope('ALL');
                }}
                className="text-indigo-600 hover:text-indigo-800 underline font-normal cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-slate-400">
            <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300 animate-pulse" />
            <p className="text-sm font-semibold text-slate-600">No matching transactions found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try resetting search filters or perform a new transaction</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Service & Ref</th>
                  <th className="py-3 px-4">Customer & Account</th>
                  <th className="py-3 px-4">Bank / Operator</th>
                  <th className="py-3 px-4">Amount & Commission</th>
                  <th className="py-3 px-4">Status & Switch Flow</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => {
                  const isExpanded = expandedTxnId === tx.id;
                  const isPending = tx.status === 'PENDING';
                  const isSuccess = tx.status === 'SUCCESS';
                  const isFailed = tx.status === 'FAILED';

                  const serviceBadgeClass = 
                    tx.service === 'DMT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    tx.service === 'AEPS' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    tx.service === 'RECHARGE' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    tx.service === 'BBPS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    tx.service === 'DTH' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                    tx.service === 'OTT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    tx.service === 'INSURANCE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    tx.service === 'LIC' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <React.Fragment key={tx.id}>
                      <tr 
                        className={`hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                      >
                        {/* Service & Ref */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${serviceBadgeClass}`}>
                              {tx.service}
                            </span>
                            <span className="font-mono font-bold text-slate-900">{tx.id}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <span>{tx.subtype}</span>
                            <span>•</span>
                            <span>{tx.timestamp.split(' ')[1] || tx.timestamp}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>RRN: {tx.rrn}</span>
                            <button
                              onClick={() => handleCopyRrn(tx.rrn)}
                              className="text-slate-400 hover:text-indigo-600"
                              title="Copy RRN"
                            >
                              {copiedRrn === tx.rrn ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Customer & Account */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{tx.customerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            +91 {tx.customerMobile}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            A/c: {tx.accountOrAadhaarOrConsumer}
                          </div>
                        </td>

                        {/* Bank / Operator */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{tx.bankOrOperator}</div>
                          {tx.utr && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              UTR: {tx.utr}
                            </div>
                          )}
                          {tx.mode && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                              Mode: {tx.mode}
                            </span>
                          )}
                        </td>

                        {/* Amount & Commission */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold font-mono text-slate-900 text-sm">
                            ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-700 font-mono">
                            +₹{tx.commission.toFixed(2)} comm.
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Settled</span>
                            </span>
                          )}

                          {isPending && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                <span>Switch Pending</span>
                              </span>
                              <div>
                                <button
                                  id={`btn-requery-${tx.id}`}
                                  onClick={() => onRequeryStatus(tx.id)}
                                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" /> Re-query Bank Status
                                </button>
                              </div>
                            </div>
                          )}

                          {isFailed && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Failed</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Print Receipt */}
                          <button
                            id={`btn-receipt-${tx.id}`}
                            onClick={() => onShowReceipt(tx)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View / Print Customer Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Expand Live Timeline */}
                          <button
                            id={`btn-expand-timeline-${tx.id}`}
                            onClick={() => setExpandedTxnId(isExpanded ? null : tx.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isExpanded ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            title="View Real-Time Routing Timeline"
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Real-Time Routing Pipeline */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={6} className="p-4 sm:p-5">
                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Live Gateway Switch Sequence (NPCI / BBPCU / UIDAI)</span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  Txn Ref: {tx.txnReference} | RRN: {tx.rrn}
                                </div>
                              </div>

                              {/* 4-Step Timeline Stepper */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                                {tx.timeline.map((step, idx) => {
                                  const isStepDone = step.status === 'done';
                                  const isStepProc = step.status === 'processing';
                                  const isStepWaiting = step.status === 'waiting';

                                  return (
                                    <div 
                                      key={idx} 
                                      className={`p-2.5 rounded-lg border text-xs ${
                                        isStepDone ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950' :
                                        isStepProc ? 'border-amber-300 bg-amber-50/60 text-amber-950 ring-1 ring-amber-400' :
                                        'border-slate-200 bg-slate-50 text-slate-400'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-[11px]">{idx + 1}. {step.step}</span>
                                        {isStepDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                        {isStepProc && <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
                                        {isStepWaiting && <Clock className="w-3.5 h-3.5 text-slate-300" />}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-mono">Time: {step.timestamp}</div>
                                      {step.note && (
                                        <div className="text-[10px] font-medium mt-1 text-slate-600 leading-tight">
                                          {step.note}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Action Footer for Transaction */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                <div className="text-slate-500 text-[11px]">
                                  {isPending ? 'Bank switch has not yet sent final response code. You can trigger an instant re-query.' : 'Transaction permanently verified in agent ledger.'}
                                </div>
                                <div className="flex items-center gap-2">
                                  {isPending && (
                                    <button
                                      onClick={() => onRequeryStatus(tx.id)}
                                      className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <RefreshCw className="w-3 h-3" /> Re-query Bank Now
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setTicketModalTxn(tx)}
                                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Raise Dispute Ticket
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket / Grievance Modal */}
      {ticketModalTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Raise Dispute / Grievance</h3>
                <p className="text-xs text-slate-500">NPCI / BBPS Central Dispute Management System</p>
              </div>
              <button
                onClick={() => {
                  setTicketModalTxn(null);
                  setTicketSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {ticketSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Dispute Ticket Logged Successfully</h4>
                <p className="text-xs text-slate-500">
                  Ticket ID: <span className="font-mono font-bold text-indigo-600">CR-2026-{Math.floor(100000 + Math.random() * 900000)}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Bank nodal officer SLA: 24-48 business hours. Automatic refund initiated if debited without credit.
                </p>
                <button
                  onClick={() => {
                    setTicketModalTxn(null);
                    setTicketSuccess(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">RRN / Txn ID:</span>
                    <span className="font-mono font-bold text-slate-900">{ticketModalTxn.rrn} ({ticketModalTxn.id})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-mono font-bold text-slate-900">₹{ticketModalTxn.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank / Biller:</span>
                    <span className="text-slate-800 font-medium">{ticketModalTxn.bankOrOperator}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Dispute Category</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-600">
                    <option>Customer account debited but beneficiary not credited (Late Credit)</option>
                    <option>Duplicate debit on customer card/Aadhaar</option>
                    <option>AePS Cash not dispensed but transaction marked successful</option>
                    <option>BBPS Bill paid but operator unpaid</option>
                    <option>Incorrect beneficiary IFSC/Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agent Remarks / Customer Notes</label>
                  <textarea 
                    rows={3} 
                    placeholder="Enter customer passbook details or transaction issue..." 
                    defaultValue="Customer called stating beneficiary bank did not receive credit within 30 mins."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTicketModalTxn(null)}
                    className="w-1/2 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketSuccess(true)}
                    className="w-1/2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                  >
                    Submit Dispute Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Accounting CSV Modal */}
      <ExportCsvModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        filteredTransactions={filtered}
        allTransactions={transactions}
        agentProfile={agentProfile}
      />
    </div>
  );
};
