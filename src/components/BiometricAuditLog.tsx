import React, { useState, useEffect, useMemo } from 'react';
import { 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Cpu, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  Sliders,
  Check,
  Building2,
  Info
} from 'lucide-react';
import { BiometricAuditAttempt } from '../types';
import { INITIAL_BIOMETRIC_AUDIT_LOGS } from '../data/mockData';

interface BiometricAuditLogProps {
  logs?: BiometricAuditAttempt[];
  onRefresh?: () => void;
  onSimulateTestCapture?: (quality: number, status: 'SUCCESS' | 'FAILED', failureReason?: string) => void;
  onClearLogs?: () => void;
  isCompact?: boolean;
}

export const BiometricAuditLog: React.FC<BiometricAuditLogProps> = ({
  logs: externalLogs,
  onRefresh: externalOnRefresh,
  onSimulateTestCapture: externalSimulate,
  onClearLogs: externalClear,
  isCompact = false,
}) => {
  // Local state for fetched logs if not externally provided
  const [internalLogs, setInternalLogs] = useState<BiometricAuditAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date>(new Date());
  
  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'LOW_QUALITY' | 'HIGH_QUALITY'>('NEWEST');
  const [showSimulateDrawer, setShowSimulateDrawer] = useState(false);
  const [exportedToast, setExportedToast] = useState(false);

  // Fetch biometric audit attempts from persistence/backend
  const fetchAuditAttempts = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshing(true);

    try {
      // Simulate real asynchronous fetch with network latency
      await new Promise((resolve) => setTimeout(resolve, 450));
      
      const stored = localStorage.getItem('digiagent_biometric_audit');
      if (stored) {
        setInternalLogs(JSON.parse(stored));
      } else {
        setInternalLogs(INITIAL_BIOMETRIC_AUDIT_LOGS);
        localStorage.setItem('digiagent_biometric_audit', JSON.stringify(INITIAL_BIOMETRIC_AUDIT_LOGS));
      }
      setLastFetchedAt(new Date());
    } catch (error) {
      console.error('Failed to fetch biometric audit logs:', error);
      setInternalLogs(INITIAL_BIOMETRIC_AUDIT_LOGS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!externalLogs) {
      fetchAuditAttempts(true);
    } else {
      setIsLoading(false);
    }
  }, [externalLogs]);

  // Use external logs if provided, otherwise internal logs
  const activeLogs = externalLogs || internalLogs;

  const handleManualRefresh = () => {
    if (externalOnRefresh) {
      externalOnRefresh();
    } else {
      fetchAuditAttempts(false);
    }
  };

  // Internal simulation handler if no external one is provided
  const handleSimulate = (quality: number, status: 'SUCCESS' | 'FAILED', failureReason?: string) => {
    if (externalSimulate) {
      externalSimulate(quality, status, failureReason);
      return;
    }

    const now = new Date();
    const formattedTimestamp = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newAttempt: BiometricAuditAttempt = {
      id: `BIO-LOG-${Date.now().toString().slice(-4)}`,
      timestamp: formattedTimestamp,
      rawTimestamp: Date.now(),
      deviceModel: 'Mantra MFS100 (Optical USB)',
      serviceType: 'Cash Withdrawal',
      aadhaarMasked: 'XXXX-XXXX-8421',
      bankName: 'State Bank of India',
      qualityScore: quality,
      minRequiredScore: 65,
      status: status,
      errorCode: status === 'SUCCESS' ? 'NPCI-00' : quality < 45 ? 'RD-104' : 'RD-101',
      failureReason: failureReason,
      nfiqScore: quality >= 90 ? 1 : quality >= 75 ? 2 : quality >= 65 ? 3 : 4,
      captureDurationMs: Math.floor(1050 + Math.random() * 800),
    };

    const updated = [newAttempt, ...activeLogs];
    setInternalLogs(updated);
    try {
      localStorage.setItem('digiagent_biometric_audit', JSON.stringify(updated));
    } catch (e) {
      /* ignore */
    }
  };

  const handleClear = () => {
    if (externalClear) {
      externalClear();
      return;
    }
    if (window.confirm('Are you sure you want to clear historical biometric authentication audit records?')) {
      setInternalLogs([]);
      try {
        localStorage.setItem('digiagent_biometric_audit', JSON.stringify([]));
      } catch (e) {
        /* ignore */
      }
    }
  };

  // Compute telemetry metrics
  const totalAttempts = activeLogs.length;
  const successCount = activeLogs.filter(a => a.status === 'SUCCESS').length;
  const failedCount = activeLogs.filter(a => a.status === 'FAILED').length;
  const passRate = totalAttempts > 0 ? ((successCount / totalAttempts) * 100).toFixed(1) : '0';
  const averageQuality = totalAttempts > 0 
    ? (activeLogs.reduce((acc, a) => acc + a.qualityScore, 0) / totalAttempts).toFixed(1)
    : '0';

  // Filtered and sorted attempts
  const filteredLogs = useMemo(() => {
    let result = activeLogs.filter(log => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        log.aadhaarMasked.toLowerCase().includes(query) ||
        log.bankName.toLowerCase().includes(query) ||
        log.serviceType.toLowerCase().includes(query) ||
        log.deviceModel.toLowerCase().includes(query) ||
        (log.errorCode && log.errorCode.toLowerCase().includes(query)) ||
        (log.failureReason && log.failureReason.toLowerCase().includes(query));

      const matchesStatus = 
        statusFilter === 'ALL' ? true : log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortOrder === 'NEWEST') return b.rawTimestamp - a.rawTimestamp;
      if (sortOrder === 'OLDEST') return a.rawTimestamp - b.rawTimestamp;
      if (sortOrder === 'LOW_QUALITY') return a.qualityScore - b.qualityScore;
      if (sortOrder === 'HIGH_QUALITY') return b.qualityScore - a.qualityScore;
      return 0;
    });

    return result;
  }, [activeLogs, searchTerm, statusFilter, sortOrder]);

  // Export audit log as CSV
  const handleExportCsv = () => {
    const headers = [
      'Log ID',
      'Timestamp',
      'Aadhaar Masked',
      'Bank Name',
      'Service Type',
      'Device Model',
      'Quality Score (%)',
      'UIDAI Min Required (%)',
      'NFIQ Score',
      'Capture Latency (ms)',
      'Status',
      'Error Code',
      'Failure Reason'
    ];

    const rows = filteredLogs.map(log => [
      log.id,
      `"${log.timestamp}"`,
      `"${log.aadhaarMasked}"`,
      `"${log.bankName}"`,
      `"${log.serviceType}"`,
      `"${log.deviceModel}"`,
      log.qualityScore,
      log.minRequiredScore,
      log.nfiqScore ?? 'N/A',
      log.captureDurationMs,
      log.status,
      log.errorCode || 'N/A',
      `"${log.failureReason || 'None'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AePS_Biometric_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Component Header with Telemetry Status & Actions */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                Biometric Authentication Audit Log
              </h2>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                AePS RD Telemetry
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                UIDAI L0/L1 Verified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Audit trail of fingerprint captures, sensor quality scores, latency, and NPCI/UIDAI auth outcomes
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Fetch latest audit telemetry from device & switch"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Fetching...' : 'Fetch Latest'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Export biometric audit records to CSV"
          >
            {exportedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5 text-slate-600" />}
            <span>{exportedToast ? 'Downloaded!' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSimulateDrawer(!showSimulateDrawer)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Simulate test captures to verify quality floor evaluation"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test Capture</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-5">
        
        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Historical Captures</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {totalAttempts}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Logged sessions</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Pass Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700">
              {passRate}%
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {successCount} Passed / {failedCount} Failed
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Avg Quality Score</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {averageQuality}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Target: &ge; 65% minimum</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>UIDAI Statutory Floor</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold font-mono text-indigo-700">
              65%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Mandatory pass threshold</div>
          </div>
        </div>

        {/* Test Capture Drawer */}
        {showSimulateDrawer && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-indigo-600" />
                Simulate Capture Scenarios to Verify Audit Trail:
              </span>
              <button
                onClick={() => setShowSimulateDrawer(false)}
                className="text-indigo-400 hover:text-indigo-700 text-xs cursor-pointer font-bold"
              >
                Close
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSimulate(95, 'SUCCESS')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simulate High Quality (95% - Pass)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulate(69, 'SUCCESS')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Marginal Quality (69% - Barely Passed)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulate(51, 'FAILED', 'Low fingerprint quality: 51% is below UIDAI 65% floor.')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Simulate Dry Finger Failure (51% - Rejected)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulate(36, 'FAILED', 'Premature finger lift before optical frame completion.')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Simulate Premature Lift (36% - RD-104)</span>
              </button>
            </div>
          </div>
        )}

        {/* Search, Filter, Sort Toolbar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-wrap gap-2.5 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Aadhaar, Bank, Device, or Error Code..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600 text-slate-900"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalAttempts})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SUCCESS')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'SUCCESS'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Passed ({successCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('FAILED')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'FAILED'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Failed ({failedCount})</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="LOW_QUALITY">Lowest Quality Score</option>
              <option value="HIGH_QUALITY">Highest Quality Score</option>
            </select>
          </div>
        </div>

        {/* Historical List Items */}
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-indigo-600 mx-auto animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-600">Fetching biometric audit records...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Fingerprint className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Biometric Attempts Found</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                No logs matching current search criteria or filter.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSuccess = log.status === 'SUCCESS';
              const quality = log.qualityScore;

              let qualityColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              let qualityBarColor = 'bg-emerald-500';
              if (quality < 65) {
                qualityColor = 'text-rose-700 bg-rose-50 border-rose-200';
                qualityBarColor = 'bg-rose-500';
              } else if (quality < 75) {
                qualityColor = 'text-amber-700 bg-amber-50 border-amber-200';
                qualityBarColor = 'bg-amber-500';
              }

              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSuccess
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      : 'bg-rose-50/40 border-rose-200/90 hover:border-rose-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Customer Info, Bank & Service */}
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSuccess ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        <Fingerprint className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {log.aadhaarMasked}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {log.bankName}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {log.serviceType}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{log.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {log.timestamp}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Cpu className="w-3 h-3 text-slate-400" />
                            {log.deviceModel.split('(')[0].trim()}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-400">
                            Capture Latency: {log.captureDurationMs}ms
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quality Score Meter & Status Badge */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {/* Quality Score Meter */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            Quality:
                          </span>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${qualityColor}`}>
                            {quality}%
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5 ml-auto border border-slate-200">
                          <div
                            className={`h-full ${qualityBarColor}`}
                            style={{ width: `${Math.min(100, quality)}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Floor: 65% {log.nfiqScore ? `• NFIQ ${log.nfiqScore}` : ''}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 w-28 text-right">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{log.errorCode || 'Passed'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{log.errorCode || 'Failed'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Failure reason details banner */}
                  {!isSuccess && log.failureReason && (
                    <div className="mt-2.5 pt-2 border-t border-rose-200/60 text-[11px] text-rose-800 flex items-start gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{log.failureReason}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Last synchronized: {lastFetchedAt.toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Clear Local Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
