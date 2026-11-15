export type Language = 'en' | 'ms' | 'zh';

export type Screen = 'home' | 'results' | 'emergency';

export type Verdict = 'STOP' | 'WAIT' | 'SAFE';

export interface RedFlag {
  quoted_clue: string;
  plain_explanation: string;
}

export type ClaimedIdentity =
  | 'bank'
  | 'police_gov'
  | 'courier'
  | 'family'
  | 'seller'
  | 'not_sure';

export interface PhoneLookupSummary {
  available: boolean;
  police_report_count: number;
  verified_report_count: number;
  unverified_report_count: number;
  spam: boolean;
  fraud: boolean;
  business_tier?: string;
  business_name?: string;
  spoofing_report_count?: number;
  reason?: string;
}

export interface AnalysisResult {
  verdict: Verdict;
  headline: string;
  scam_category: string;
  simple_summary: string;
  red_flags: RedFlag[];
  safe_check_steps: string[];
  family_share_summary: string;
  extracted_phone_numbers?: string[];
  phone_lookup?: PhoneLookupSummary;
}

export interface TrustedFamilyContact {
  name: string;
  phone: string;
}

export interface SubmittedInput {
  type: 'text' | 'image' | 'audio' | 'phone' | 'bank';
  text?: string;
  imageUrl?: string;
  fileName?: string;
  rawFile?: File;
  phoneNumber?: string;
  bankAccount?: string;
  bankName?: string;
  claimedIdentity?: ClaimedIdentity;
}

export interface HistoryEntry {
  id: string;
  checkedAt: number;
  language: Language;
  inputType: 'text' | 'image' | 'audio' | 'phone' | 'bank';
  inputPreview: string;
  fullText?: string;
  phoneNumber?: string;
  bankAccount?: string;
  bankName?: string;
  claimedIdentity?: ClaimedIdentity;
  result: AnalysisResult;
}

export type EmergencyScenario = 'money' | 'apk' | 'otp';
