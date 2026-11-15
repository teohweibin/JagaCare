import type { AnalysisResult, Language } from '../types';
import { PORTAL_URLS, TRANSLATIONS } from '../i18n/translations';
import type { PortalInfo } from '../i18n/translations';

export function countDigits(input: string): number {
  return input.replace(/\D/g, '').length;
}

export function formatMalaysianWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `60${digits.slice(1)}`;
  }
  if (digits.startsWith('60')) {
    return digits;
  }
  return digits;
}

export function truncateName(name: string, maxLength = 10): string {
  const trimmed = name.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

export function detectRelevantPortals(
  result: AnalysisResult,
  language: Language,
  sourceText = ''
): PortalInfo[] {
  const t = TRANSLATIONS[language].results.portals;
  const combined = [
    sourceText,
    result.headline,
    result.scam_category,
    result.simple_summary,
    ...result.red_flags.map((rf) => `${rf.quoted_clue} ${rf.plain_explanation}`),
    ...result.safe_check_steps,
  ]
    .join(' ')
    .toLowerCase();

  const portals: PortalInfo[] = [];
  const addPortal = (id: PortalInfo['id']) => {
    if (!portals.some((p) => p.id === id)) {
      portals.push({ id, label: t[id], url: PORTAL_URLS[id] });
    }
  };

  if (
    result.verdict === 'STOP' ||
    result.verdict === 'WAIT' ||
    /bank|account|akaun|transfer|phone|telefon|mule|semak|duit|wang|银行|账号|转账/.test(combined)
  ) {
    addPortal('semak_mule');
  }

  if (/poslaju|pos laju|pos malaysia|parcel|bungkusan|快递|包裹/.test(combined)) {
    addPortal('poslaju');
  }

  if (/j&t|j & t|jnt|jtexpress/.test(combined)) {
    addPortal('jnt');
  }

  if (
    /bank|maybank|cimb|public bank|rhb|hong leong|ambank|bank islam|ewallet|e-wallet|tng|touch 'n go|touch n go|mae|duitnow|bnm|negara|otp|tac|银行|电子钱包/.test(
      combined
    )
  ) {
    addPortal('bnm');
  }

  return portals;
}

export function buildWhatsAppShareUrl(
  phone: string,
  result: AnalysisResult,
  language: Language
): string {
  const formattedDigits = formatMalaysianWhatsApp(phone);
  const t = TRANSLATIONS[language].results;
  const topFlags = result.red_flags
    .slice(0, 3)
    .map((flag, idx) => `${idx + 1}. ${flag.plain_explanation}`)
    .join('\n');

  const lines = [
    `${t.whatsappSharePrefix}: [${result.verdict}] ${result.headline}`,
    '',
    result.family_share_summary,
  ];

  if (topFlags) {
    lines.push('', t.whatsappShareWarningsTitle, topFlags);
  }

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${formattedDigits}?text=${encoded}`;
}

export function buildHijackWarningUrl(phone: string, language: Language): string {
  const formattedDigits = formatMalaysianWhatsApp(phone);
  const message = encodeURIComponent(TRANSLATIONS[language].emergency.hijackWarningMessage);
  return `https://wa.me/${formattedDigits}?text=${message}`;
}

export function extractPhoneNumbers(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/(?:\+?\d[\d\s\-()]{6,17}\d)/g) ?? [];
  const seen = new Set<string>();
  const results: string[] = [];

  for (const raw of matches) {
    const trimmed = raw.trim();
    const digits = trimmed.replace(/\D/g, '');
    // Ignore obvious currency/dates or overly short/long digit runs
    if (digits.length < 8 || digits.length > 15) continue;
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(trimmed)) continue;
    if (!seen.has(digits)) {
      seen.add(digits);
      results.push(trimmed);
    }
  }
  return results;
}

const SPEECH_LANG_MAP: Record<Language, string> = {
  en: 'en-MY',
  ms: 'ms-MY',
  zh: 'zh-CN',
};

const VOICE_PRIORITY: Record<Language, string[]> = {
  zh: ['zh-cn', 'zh-sg', 'zh-hans', 'zh-tw', 'zh-hk', 'zh'],
  ms: ['ms-my', 'ms'],
  en: ['en-my', 'en-sg', 'en-us', 'en-gb', 'en'],
};

export function configureUtteranceVoice(
  utterance: SpeechSynthesisUtterance,
  language: Language
): void {
  const defaultLocale = SPEECH_LANG_MAP[language];
  utterance.lang = defaultLocale;
  utterance.rate = 0.88;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    if (language === 'en') {
      utterance.lang = 'en-US';
    }
    return;
  }

  const priorities = VOICE_PRIORITY[language];
  let matchedVoice: SpeechSynthesisVoice | undefined;
  for (const prefix of priorities) {
    matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (matchedVoice) break;
  }

  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang || defaultLocale;
  } else if (language === 'en') {
    utterance.lang = 'en-US';
  }
}
