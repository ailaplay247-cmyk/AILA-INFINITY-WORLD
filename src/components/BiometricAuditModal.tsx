import React from 'react';
import { X, Fingerprint } from 'lucide-react';
import { BiometricAuditAttempt } from '../types';
import { BiometricAuditLog } from './BiometricAuditLog';

interface BiometricAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: BiometricAuditAttempt[];
  onClearLogs?: () => void;
  onSimulateTestCapture?: (quality: number, status: 'SUCCESS' | 'FAILED', failureReason?: string) => void;
  onRefresh?: () => void;
}

export const BiometricAuditModal: React.FC<BiometricAuditModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  onClearLogs,
  onSimulateTestCapture,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top bar with quick close */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              AePS Biometric RD Service Telemetry Log
            </span>
          </div>

          <button
            id="btn-close-biometric-audit-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body hosting the BiometricAuditLog component */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-slate-50/50">
          <BiometricAuditLog
            logs={auditLogs}
            onRefresh={onRefresh}
            onClearLogs={onClearLogs}
            onSimulateTestCapture={onSimulateTestCapture}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Compliant with UIDAI Aadhaar Authentication & Security Regulations 2016
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
