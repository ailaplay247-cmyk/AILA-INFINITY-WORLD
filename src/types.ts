export type ServiceType = 
  | 'DMT' 
  | 'AEPS' 
  | 'RECHARGE' 
  | 'BBPS' 
  | 'DTH' 
  | 'OTT' 
  | 'INSURANCE' 
  | 'LIC';

export type TxStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REVERSED';

export type AepsSubtype = 'CASH_WITHDRAWAL' | 'BALANCE_ENQUIRY' | 'MINI_STATEMENT' | 'AADHAAR_PAY';

export type DmtMode = 'IMPS' | 'NEFT' | 'RTGS';

export type BbpsCategory = 
  | 'ELECTRICITY' 
  | 'WATER' 
  | 'GAS_CYLINDER' 
  | 'MOBILE_POSTPAID' 
  | 'FASTAG' 
  | 'DTH' 
  | 'BROADBAND';

export interface RechargePlan {
  id: string;
  price: number;
  validity: string;
  data: string;
  description: string;
  category: 'UNLIMITED' | 'DATA_ADDON' | 'POPULAR' | 'ANNUAL' | 'TALKTIME';
  talktime?: string;
  ottBenefits?: string[];
}

export interface DthPack {
  id: string;
  name: string;
  price: number;
  validity: string;
  channels: string;
  category: 'MONTHLY' | '3_MONTHS' | '6_MONTHS' | 'ANNUAL' | 'HD_COMBO';
  description: string;
}

export interface OttSubscriptionPlan {
  id: string;
  provider: string;
  planName: string;
  price: number;
  validity: string;
  screens: number;
  resolution: string;
  badge?: string;
  features: string[];
}

export interface InsuranceProduct {
  id: string;
  title: string;
  category: 'MOTOR' | 'HEALTH' | 'ACCIDENT' | 'CYBER' | 'SHOP';
  insurer: string;
  coverAmount: string;
  premium: number;
  validity: string;
  description: string;
  keyBenefits: string[];
}

export interface LicPolicyDetails {
  policyNumber: string;
  policyholderName: string;
  planName: string;
  sumAssured: number;
  dueDate: string;
  installmentPremium: number;
  lateFee: number;
  totalPayable: number;
  status: 'ACTIVE' | 'GRACE_PERIOD' | 'LAPSED';
  agentCode: string;
}

export interface StatusTimelineStep {
  step: string;
  timestamp: string;
  status: 'done' | 'processing' | 'failed' | 'waiting';
  note?: string;
}

export interface MiniStatementItem {
  date: string;
  type: 'CR' | 'DR';
  amount: number;
  narration: string;
}

export interface Transaction {
  id: string;
  txnReference: string;
  rrn: string; // 12-digit Retrieval Reference Number
  utr?: string;
  timestamp: string;
  service: ServiceType;
  subtype?: string;
  status: TxStatus;
  amount: number;
  fee: number;
  commission: number;
  customerName: string;
  customerMobile: string;
  accountOrAadhaarOrConsumer: string;
  bankOrOperator: string;
  ifsc?: string;
  mode?: string;
  failureReason?: string;
  timeline: StatusTimelineStep[];
  balanceRemaining?: number;
  miniStatement?: MiniStatementItem[];
  billerDetails?: {
    billNumber?: string;
    dueDate?: string;
    consumerId?: string;
    category?: BbpsCategory;
  };
}

export interface AgentProfile {
  id: string;
  name: string;
  shopName: string;
  bcId: string; // Business Correspondent ID
  terminalId: string;
  location: string;
  mainWalletBalance: number;
  commissionWalletBalance: number;
  cashInDrawer: number;
  kycStatus: 'VERIFIED' | 'PENDING';
  lowBalanceThreshold?: number;
  email?: string;
  phone?: string;
  sponsoringBank?: string;
  corporateBcPartner?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  iibfCertificate?: string;
  policeVerificationStatus?: 'CLEARED' | 'PENDING' | 'RENEWAL_DUE';
  onboardingDate?: string;
  district?: string;
  state?: string;
  pincode?: string;
  biometricDevice?: string;
  thermalPrinterModel?: string;
  microAtmSerial?: string;
  dmtDailyLimit?: number;
  aepsSingleLimit?: number;
  bbpsDailyLimit?: number;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  iin: string; // Issuer Identification Number for AePS
  popular?: boolean;
}

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifsc: string;
  verified: boolean;
}

export interface Biller {
  id: string;
  name: string;
  category: BbpsCategory;
  state?: string;
  paramLabel: string;
  paramPlaceholder: string;
  sampleAccount: string;
  defaultAmount: number;
}

export interface BiometricAuditAttempt {
  id: string;
  timestamp: string;
  rawTimestamp: number;
  deviceModel: string;
  serviceType: string;
  aadhaarMasked: string;
  bankName: string;
  qualityScore: number;
  minRequiredScore: number;
  status: 'SUCCESS' | 'FAILED';
  errorCode?: string;
  failureReason?: string;
  nfiqScore?: number;
  captureDurationMs: number;
}
