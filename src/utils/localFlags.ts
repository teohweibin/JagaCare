import type { Language } from '../types';

export type FlagTargetKind = 'phone' | 'bank';

export interface LocalScamFlag {
  key: string;
  kind: FlagTargetKind;
  displayValue: string;
  reason: string;
  flaggedAt: number;
  source: 'device' | 'demo';
}

const STORAGE_LOCAL_FLAGS_KEY = 'jagacare_local_scam_flags';

const BUILT_IN_DEMO_SCAM_FLAGS: Array<{
  kind: FlagTargetKind;
  displayValue: string;
  reasons: Record<Language, string>;
}> = [
  {
    kind: 'phone',
    displayValue: '011-5555 8888',
    reasons: {
      en: 'Test scam number: Fake Police / Macau Scam test number',
      ms: 'Nombor ujian penipu: Nombor ujian Polis Palsu / Macau Scam',
      zh: '测试诈骗号码：假冒警察 / 澳门骗局测试号码',
    },
  },
  {
    kind: 'phone',
    displayValue: '018-999 4444',
    reasons: {
      en: 'Test scam number: Fake Parcel / LHDN test number',
      ms: 'Nombor ujian penipu: Nombor ujian Bungkusan Palsu / LHDN',
      zh: '测试诈骗号码：假包裹 / 假冒税收局测试号码',
    },
  },
  {
    kind: 'bank',
    displayValue: '1122 3344 5566',
    reasons: {
      en: 'Test scam account: Reported mule account test number',
      ms: 'Akaun ujian penipu: Nombor ujian akaun keldai yang dilaporkan',
      zh: '测试诈骗账号：被举报的钱骡测试银行账号',
    },
  },
  {
    kind: 'bank',
    displayValue: '8800 1122 3344',
    reasons: {
      en: 'Test scam account: Fake investment transfer test account',
      ms: 'Akaun ujian penipu: Akaun ujian pindahan pelaburan palsu',
      zh: '测试诈骗账号：假投资转账测试账号',
    },
  },
];

export function normalizeFlagKey(kind: FlagTargetKind, rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) return '';
  if (kind === 'phone') {
    if (digits.startsWith('0060') && digits.length > 6) {
      return `0${digits.slice(4)}`;
    }
    if (digits.startsWith('60') && digits.length >= 10 && digits.length <= 13) {
      return `0${digits.slice(2)}`;
    }
  }
  return digits;
}

function readStoredFlags(): LocalScamFlag[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_FLAGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is LocalScamFlag =>
        Boolean(
          item &&
            typeof item.key === 'string' &&
            (item.kind === 'phone' || item.kind === 'bank') &&
            typeof item.displayValue === 'string' &&
            typeof item.reason === 'string'
        )
    );
  } catch {
    return [];
  }
}

export function getLocalScamFlag(
  kind: FlagTargetKind,
  rawValue?: string,
  language: Language = 'en'
): LocalScamFlag | null {
  if (!rawValue) return null;
  const key = normalizeFlagKey(kind, rawValue);
  if (!key) return null;

  const stored = readStoredFlags();
  const deviceMatch = stored.find((item) => item.kind === kind && item.key === key);
  if (deviceMatch) {
    return { ...deviceMatch, source: 'device' };
  }

  const demoMatch = BUILT_IN_DEMO_SCAM_FLAGS.find(
    (item) => item.kind === kind && normalizeFlagKey(kind, item.displayValue) === key
  );
  if (demoMatch) {
    return {
      key,
      kind,
      displayValue: demoMatch.displayValue,
      reason: demoMatch.reasons[language] || demoMatch.reasons.en,
      flaggedAt: 0,
      source: 'demo',
    };
  }

  return null;
}

export function saveLocalScamFlag(
  kind: FlagTargetKind,
  rawValue: string,
  reason: string
): LocalScamFlag | null {
  const key = normalizeFlagKey(kind, rawValue);
  if (!key) return null;

  const newEntry: LocalScamFlag = {
    key,
    kind,
    displayValue: rawValue.trim(),
    reason: reason.trim() || 'Marked as suspicious on this device',
    flaggedAt: Date.now(),
    source: 'device',
  };

  try {
    const existing = readStoredFlags().filter(
      (item) => !(item.kind === kind && item.key === key)
    );
    const updated = [newEntry, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_LOCAL_FLAGS_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  return newEntry;
}

export function removeLocalScamFlag(kind: FlagTargetKind, rawValue: string): void {
  const key = normalizeFlagKey(kind, rawValue);
  if (!key) return;
  try {
    const remaining = readStoredFlags().filter(
      (item) => !(item.kind === kind && item.key === key)
    );
    localStorage.setItem(STORAGE_LOCAL_FLAGS_KEY, JSON.stringify(remaining));
  } catch {
    // ignore storage errors
  }
}
