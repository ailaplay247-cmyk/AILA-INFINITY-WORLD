import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  Store,
  Phone,
  Mail,
  MapPin,
  Building2,
  Cpu,
  Printer,
  Fingerprint,
  CreditCard,
  FileCheck,
  Award,
  Sliders,
  Wallet,
  Coins,
  BadgeAlert,
  ExternalLink,
  Edit3,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { AgentProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AgentProfile;
  onUpdateProfile: (updated: Partial<AgentProfile>) => void;
  onOpenWallet?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onOpenWallet,
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'COMPLIANCE' | 'HARDWARE' | 'LIMITS' | 'EDIT'>('DETAILS');

  // Edit form state
  const [formData, setFormData] = useState({
    name: profile.name,
    shopName: profile.shopName,
    phone: profile.phone || '+91 98765 43210',
    email: profile.email || 'ailaplay247@gmail.com',
    location: profile.location,
    lowBalanceThreshold: profile.lowBalanceThreshold || 5000,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: formData.name.trim(),
      shopName: formData.shopName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      location: formData.location.trim(),
      lowBalanceThreshold: Number(formData.lowBalanceThreshold) || 5000,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('DETAILS');
    }, 1200);
  };

  // Initials for avatar
  const initials = profile.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        id="user-profile-modal-container"
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header & Hero Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              {/* Agent Avatar */}
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg shadow-indigo-500/30 border-2 border-white/20">
                  {initials}
                </div>
                <span 
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] text-white shadow-xs"
                  title="Agent Online & Authenticated"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    {profile.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Banking Agent
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-indigo-200 mt-1 flex-wrap">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-indigo-400" />
                    {profile.shopName}
                  </span>
                  <span className="text-indigo-400/60">•</span>
                  <span className="font-mono text-indigo-300">BC ID: {profile.bcId}</span>
                  <span className="text-indigo-400/60">•</span>
                  <span className="font-mono text-indigo-300">Terminal: {profile.terminalId}</span>
                </div>
              </div>
            </div>

            <button
              id="btn-close-profile-modal"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Profile (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats Micro Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Main Float</span>
              <span className="text-sm font-bold text-white font-mono">
                ₹{profile.mainWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-emerald-400 block text-[10px] uppercase font-bold tracking-wider">Commission Earned</span>
              <span className="text-sm font-bold text-emerald-300 font-mono">
                ₹{profile.commissionWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-indigo-300 block text-[10px] uppercase font-bold tracking-wider">KYC & Cert</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                IIBF Certified
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto shrink-0 gap-1 pt-2">
          {[
            { id: 'DETAILS' as const, label: 'Identity & Kiosk', icon: User },
            { id: 'COMPLIANCE' as const, label: 'KYC & Regulatory', icon: FileCheck },
            { id: 'HARDWARE' as const, label: 'POS & RD Devices', icon: Cpu },
            { id: 'LIMITS' as const, label: 'Daily Limits & Slabs', icon: Sliders },
            { id: 'EDIT' as const, label: 'Edit Info', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`profile-tab-${tab.id.toLowerCase()}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: IDENTITY & KIOSK DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal & Shop Identification Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-indigo-600" />
                    Agent & Kendra Credentials
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Legal Name</span>
                      <span className="font-semibold text-slate-900">{profile.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Kendra / Trade Name</span>
                      <span className="font-bold text-indigo-700">{profile.shopName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Agent Operator ID</span>
                      <span className="font-mono font-bold text-slate-800">{profile.id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">BC Merchant Code</span>
                      <span className="font-mono font-bold text-slate-800">{profile.bcId}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Kiosk Terminal ID</span>
                      <span className="font-mono font-bold text-slate-800">{profile.terminalId}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Sponsoring Bank</span>
                      <span className="font-semibold text-slate-900">
                        {profile.sponsoringBank || 'State Bank of India'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Location Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Contact & Registered Address
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80 items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Mobile Number
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 font-mono">
                          {profile.phone || '+91 98765 43210'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(profile.phone || '+91 98765 43210', 'phone')}
                          className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                        >
                          {copiedField === 'phone' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-200/80 items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        Email Address
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">
                          {profile.email || 'ailaplay247@gmail.com'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(profile.email || 'ailaplay247@gmail.com', 'email')}
                          className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                        >
                          {copiedField === 'email' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500 block mb-0.5">Kiosk Address</span>
                      <span className="font-medium text-slate-800 block">
                        {profile.location}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">District & State</span>
                      <span className="font-semibold text-slate-900">
                        {profile.district || 'Central Delhi'}, {profile.state || 'Delhi'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">PIN Code</span>
                      <span className="font-mono font-bold text-slate-800">
                        {profile.pincode || '110001'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corporate BC & Onboarding Overview */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-950">
                      Corporate Network Partner: {profile.corporateBcPartner || 'Vakrangee / CSC e-Governance SPV'}
                    </div>
                    <div className="text-[11px] text-indigo-800/80">
                      Onboarded on {profile.onboardingDate || '14 Jan 2022'} • Active Good Standing Status
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('EDIT')}
                  className="px-3 py-1.5 bg-white text-indigo-700 hover:bg-indigo-100/60 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: KYC & REGULATORY COMPLIANCE */}
          {activeTab === 'COMPLIANCE' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Full Bank e-KYC Authenticated</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    This agent terminal operates under the regulatory guidelines issued by the Reserve Bank of India (RBI) and the National Payments Corporation of India (NPCI) for Business Correspondents (BC).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Government & Identity Badges */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Government ID Authentication
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Permanent Account Number (PAN)</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {profile.panNumber || 'ABCPS8124F'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> NSDL Verified
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Aadhaar Reference (UIDAI Biometric)</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {profile.aadhaarNumber || 'XXXX-XXXX-4819'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> UIDAI Linked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Certification & Police Verification */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Certifications & Audits
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">IIBF BC/BF Examination</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                          Grade: Distinction
                        </span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-1">
                        {profile.iibfCertificate || 'IIBF/BC-BF/2022/84920'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Indian Institute of Banking & Finance Certified Agent
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Police Clearance Certificate</span>
                        <span className="font-semibold text-slate-800 text-xs">
                          Clear / No Adverse Record (Delhi Police)
                        </span>
                        <span className="text-[10px] text-slate-500 block">Valid through 31 Dec 2027</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Valid
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POS & RD DEVICES */}
          {activeTab === 'HARDWARE' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Biometric Scanner */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biometric RD Service</span>
                    <h5 className="text-xs font-bold text-slate-900">
                      {profile.biometricDevice || 'Mantra MFS100'}
                    </h5>
                    <span className="text-[11px] text-slate-500">UIDAI L0 Registered Scanner</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active (v1.0.4)
                    </span>
                  </div>
                </div>

                {/* Thermal Printer */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt Printer</span>
                    <h5 className="text-xs font-bold text-slate-900">
                      {profile.thermalPrinterModel || 'Bluebamboo P25-M'}
                    </h5>
                    <span className="text-[11px] text-slate-500">58mm Bluetooth Thermal POS</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Ready / Paired
                    </span>
                  </div>
                </div>

                {/* MicroATM */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MicroATM (mPOS)</span>
                    <h5 className="text-xs font-bold text-slate-900">
                      {profile.microAtmSerial || 'PAX D180 #84192'}
                    </h5>
                    <span className="text-[11px] text-slate-500">EMV Chip & PIN Certified</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Switch:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      NPCI Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware diagnostics overview */}
              <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Hardware drivers are initialized and ready for biometric cash withdrawals and instant IMPS transfers.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DAILY LIMITS & SLABS */}
          {activeTab === 'LIMITS' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* DMT Limit */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DMT Remittance Limit</span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    ₹{(profile.dmtDailyLimit || 2500000).toLocaleString('en-IN')} / Day
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full w-[24%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Used Today: ₹92,400</span>
                    <span className="text-emerald-600 font-bold">Remaining: ₹24.07L</span>
                  </div>
                </div>

                {/* AePS Limit */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AePS Withdrawal Limit</span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    ₹{(profile.aepsSingleLimit || 10000).toLocaleString('en-IN')} / Txn
                  </div>
                  <div className="text-xs text-slate-600 pt-1">
                    Standard NPCI per-aadhaar single withdrawal cap with two-factor biometric verification.
                  </div>
                </div>

                {/* BBPS Limit */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BBPS Aggregate Limit</span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    ₹{(profile.bbpsDailyLimit || 1000000).toLocaleString('en-IN')} / Day
                  </div>
                  <div className="text-xs text-slate-600 pt-1">
                    Bill payment collection limit with instant central clearance and consumer receipt generation.
                  </div>
                </div>
              </div>

              {/* Float management quick button */}
              {onOpenWallet && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-indigo-950">Float & Bank Settlement Management</div>
                      <div className="text-[11px] text-indigo-800">
                        Transfer commission earnings to main float or request instant bank settlement (NEFT/IMPS).
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWallet();
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Open Wallet
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EDIT PROFILE */}
          {activeTab === 'EDIT' && (
            <form onSubmit={handleSaveEdit} className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Updates to contact information, trade name, or low balance alert thresholds will be saved to your local terminal profile and reflected on receipts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agent Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kendra / Shop Trade Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physical Kiosk Address
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Low Float Warning Alert Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={formData.lowBalanceThreshold}
                    onChange={(e) => setFormData({ ...formData, lowBalanceThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Triggers an orange warning banner when float drops below this amount.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[3]" /> Profile Updated Successfully!
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">All changes are saved to browser session.</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('DETAILS')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-profile-edit"
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/25 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>BC-SBI-99382 • Active Digital Signature</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-close-profile-bottom"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
