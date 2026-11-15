import { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileAudio,
  Landmark,
  Loader2,
  Phone,
  RotateCcw,
  Share2,
  ShieldAlert,
  Square,
  Volume2,
} from 'lucide-react';
import type {
  AnalysisResult,
  Language,
  SubmittedInput,
  TrustedFamilyContact,
  Verdict,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  buildWhatsAppShareUrl,
  configureUtteranceVoice,
  detectRelevantPortals,
  extractPhoneNumbers,
} from '../utils/formatters';
import {
  getLocalScamFlag,
  removeLocalScamFlag,
  saveLocalScamFlag,
} from '../utils/localFlags';
import type { FlagTargetKind, LocalScamFlag } from '../utils/localFlags';
import { StackedCard } from './StackedCard';

interface ResultsScreenProps {
  language: Language;
  isLoading: boolean;
  isTranslating?: boolean;
  error: string | null;
  result: AnalysisResult | null;
  submittedInput: SubmittedInput | null;
  familyContact: TrustedFamilyContact | null;
  onCancelLoading: () => void;
  onRetry: () => void;
  onCheckAnother: () => void;
  onOpenEmergency: () => void;
  onRequestFamilyContact: () => void;
  onShowToast: (message: string) => void;
  onCheckExtractedPhone: (phone: string) => void;
}

const VERDICT_PALETTE: Record<
  Verdict,
  {
    bannerBg: string;
    bannerText: string;
    surfaceBg: string;
    bodyText: string;
  }
> = {
  STOP: {
    bannerBg: '#DC2626',
    bannerText: '#FFFFFF',
    surfaceBg: '#FEF2F2',
    bodyText: '#7F1D1D',
  },
  WAIT: {
    bannerBg: '#D97706',
    bannerText: '#FFFFFF',
    surfaceBg: '#FFFBEB',
    bodyText: '#78350F',
  },
  SAFE: {
    bannerBg: '#5CE094',
    bannerText: '#18181B',
    surfaceBg: '#ECFDF3',
    bodyText: '#14532D',
  },
};

export function triggerExternalUrl(url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ResultsScreen({
  language,
  isLoading,
  isTranslating = false,
  error,
  result,
  submittedInput,
  familyContact,
  onCancelLoading,
  onRetry,
  onCheckAnother,
  onOpenEmergency,
  onRequestFamilyContact,
  onShowToast,
  onCheckExtractedPhone,
}: ResultsScreenProps) {
  const t = TRANSLATIONS[language];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [localFlag, setLocalFlag] = useState<LocalScamFlag | null>(null);
  const [isFlagFormOpen, setIsFlagFormOpen] = useState(false);
  const [flagReasonInput, setFlagReasonInput] = useState('');

  const targetKind: FlagTargetKind | null =
    submittedInput?.type === 'phone'
      ? 'phone'
      : submittedInput?.type === 'bank'
      ? 'bank'
      : null;
  const targetValue =
    submittedInput?.type === 'phone'
      ? submittedInput.phoneNumber ?? ''
      : submittedInput?.type === 'bank'
      ? submittedInput.bankAccount ?? ''
      : '';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeechError('');
    setIsFlagFormOpen(false);
    setFlagReasonInput('');
    if (targetKind && targetValue) {
      setLocalFlag(getLocalScamFlag(targetKind, targetValue, language));
    } else {
      setLocalFlag(null);
    }
  }, [result, language, targetKind, targetValue]);

  const handleToggleSpeech = () => {
    if (!result || isTranslating) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechError(t.results.speechUnsupported);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechError('');

    const db = result.phone_lookup;
    const verdictPrefix =
      submittedInput?.type === 'phone' && db?.available
        ? db.police_report_count > 0 || db.verified_report_count > 0 || db.fraud
          ? t.results.phoneVerdictBanner.reportsFound
          : db.unverified_report_count > 0 || db.spam
          ? t.results.phoneVerdictBanner.suspiciousFound
          : result.verdict === 'WAIT' && db.business_tier !== 'verified_spoofing'
          ? t.results.phoneVerdictBanner.noReportsFound
          : t.results.verdictBanner[result.verdict]
        : t.results.verdictBanner[result.verdict];
    const flagExplanations = result.red_flags
      .map((rf) => rf.plain_explanation)
      .join('. ');
    const stepsText = result.safe_check_steps
      .map((step, i) => `${i + 1}. ${step}`)
      .join('. ');

    const fullSpeech = [
      verdictPrefix,
      result.headline,
      result.simple_summary,
      flagExplanations,
      stepsText,
    ]
      .filter(Boolean)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    configureUtteranceVoice(utterance, language);

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendToFamily = () => {
    if (!result) return;
    if (!familyContact || !familyContact.phone.trim()) {
      onRequestFamilyContact();
      return;
    }
    const url = buildWhatsAppShareUrl(familyContact.phone, result, language);
    triggerExternalUrl(url);
  };

  const handleCopySummary = async () => {
    if (!result) return;
    const topFlags = result.red_flags
      .slice(0, 4)
      .map((f, idx) => `${idx + 1}. ${f.plain_explanation}${f.quoted_clue ? ` (Clue: "${f.quoted_clue}")` : ''}`)
      .join('\n');
    const steps = result.safe_check_steps
      .map((s, idx) => `${idx + 1}. ${s}`)
      .join('\n');

    const summaryText = [
      `🛡️ [${result.verdict}] ${result.headline}`,
      `Category: ${result.scam_category}`,
      '',
      result.simple_summary,
      topFlags ? `\n⚠️ Warning Signs:\n${topFlags}` : '',
      steps ? `\n📋 How to Check Safely:\n${steps}` : '',
      '',
      `Checked via JagaCare (安心查)`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
    } catch {
      // clipboard fallback ignored; still show toast
    }
    onShowToast(t.results.copiedResultToast);
  };

  if (isLoading) {
    return (
      <StackedCard surfaceColor="#FFFFFF" wrapperClassName="mb-2" className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-[#EFEAFC] border-2 border-[#18181B] flex items-center justify-center">
            <Loader2 className="w-9 h-9 text-[#8257E5] animate-spin" strokeWidth={2.5} />
          </div>
          <h2 className="mt-5 text-[24px] font-extrabold leading-[32px] text-[#18181B]">
            {t.results.loadingTitle}
          </h2>
          <p className="mt-2 text-[18px] leading-[26px] text-[#52525B] max-w-[440px]">
            {t.results.loadingSub}
          </p>
          <button
            type="button"
            onClick={onCancelLoading}
            className="mt-6 min-h-[56px] px-8 py-3 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] text-[19px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAF5F0] active:scale-[0.98] transition-transform"
          >
            {t.results.cancelButton}
          </button>
        </div>
      </StackedCard>
    );
  }

  if (error) {
    return (
      <div className="rounded-[26px] bg-[#FEF2F2] border-2 border-[#DC2626] p-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#DC2626] border-2 border-[#18181B] flex items-center justify-center">
          <AlertOctagon className="w-7 h-7 text-[#FFFFFF]" strokeWidth={2.4} />
        </div>
        <h2 className="mt-4 text-[23px] font-extrabold leading-[31px] text-[#7F1D1D]">
          {t.results.errorTitle}
        </h2>
        <p className="mt-2 text-[18px] leading-[26px] text-[#7F1D1D]">{error}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[58px] px-8 py-3 rounded-full bg-[#5CE094] border-2 border-[#18181B] text-[19px] font-bold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.98] transition-transform"
          >
            {t.results.tryAgainButton}
          </button>
          <button
            type="button"
            onClick={onCheckAnother}
            className="min-h-[58px] px-8 py-3 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] text-[19px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAF5F0] active:scale-[0.98] transition-transform"
          >
            {t.results.checkAnotherButton}
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const palette = VERDICT_PALETTE[result.verdict];
  const isPhoneOrBank =
    submittedInput?.type === 'phone' || submittedInput?.type === 'bank';
  const relevantPortals = detectRelevantPortals(
    result,
    language,
    submittedInput?.text ?? ''
  ).filter((p) => !(isPhoneOrBank && p.id === 'semak_mule'));

  const handleCopyAndOpen = async (url: string, toastText: string) => {
    const valueToCopy = targetValue.trim();
    if (valueToCopy) {
      try {
        await navigator.clipboard.writeText(valueToCopy);
      } catch {
        // clipboard fallback ignored; still notify and open portal
      }
    }
    onShowToast(toastText);
    triggerExternalUrl(url);
  };

  const handleSaveLocalFlag = () => {
    if (!targetKind || !targetValue) return;
    const saved = saveLocalScamFlag(
      targetKind,
      targetValue,
      flagReasonInput.trim() || t.results.markScamQuickReasons[0]
    );
    setLocalFlag(saved);
    setIsFlagFormOpen(false);
    setFlagReasonInput('');
    onShowToast(t.results.markScamSavedToast);
  };

  const handleRemoveLocalFlag = () => {
    if (!targetKind || !targetValue) return;
    removeLocalScamFlag(targetKind, targetValue);
    setLocalFlag(getLocalScamFlag(targetKind, targetValue));
    onShowToast(t.results.removeLocalFlagToast);
  };

  const VerdictIcon =
    result.verdict === 'STOP'
      ? AlertOctagon
      : result.verdict === 'WAIT'
      ? AlertTriangle
      : CheckCircle2;

  return (
    <div className="flex flex-col gap-6">
      {isTranslating && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-full bg-[#EFEAFC] border-2 border-[#18181B] px-5 py-3 flex items-center justify-center gap-3 text-[17px] font-extrabold text-[#18181B]"
        >
          <Loader2 className="w-5 h-5 text-[#8257E5] animate-spin shrink-0" strokeWidth={2.6} />
          <span>{t.results.translatingBanner}</span>
        </div>
      )}

      {/* 1. Media Preview (if image, audio, phone, or bank) */}
      {submittedInput?.type === 'image' && submittedInput.imageUrl && (
        <div className="rounded-[24px] bg-[#FFFFFF] border-2 border-[#18181B] p-3 flex justify-center">
          <img
            src={submittedInput.imageUrl}
            alt={submittedInput.fileName || 'Uploaded screenshot'}
            className="max-h-[180px] w-auto rounded-[16px] border-[1.5px] border-[#18181B] object-contain"
          />
        </div>
      )}

      {submittedInput?.type === 'image' && !submittedInput.imageUrl && submittedInput.fileName && (
        <div className="rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] px-5 py-3 flex items-center gap-3">
          <Camera className="w-6 h-6 text-[#8257E5] shrink-0" strokeWidth={2.3} />
          <span className="text-[17px] font-bold text-[#18181B] truncate">
            {t.results.checkingImagePrefix} {submittedInput.fileName}
          </span>
        </div>
      )}

      {submittedInput?.type === 'audio' && submittedInput.fileName && (
        <div className="rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] px-5 py-3 flex items-center gap-3">
          <FileAudio className="w-6 h-6 text-[#8257E5] shrink-0" strokeWidth={2.3} />
          <span className="text-[17px] font-bold text-[#18181B] truncate">
            {t.results.checkingAudioPrefix} {submittedInput.fileName}
          </span>
        </div>
      )}

      {submittedInput?.type === 'phone' && submittedInput.phoneNumber && (
        <div className="rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] px-5 py-3 flex items-center gap-3">
          <Phone className="w-6 h-6 text-[#8257E5] shrink-0" strokeWidth={2.3} />
          <span className="text-[17px] font-bold text-[#18181B] truncate tabular-nums">
            {t.results.checkingPhonePrefix} {submittedInput.phoneNumber}
          </span>
        </div>
      )}

      {submittedInput?.type === 'bank' && submittedInput.bankAccount && (
        <div className="rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] px-5 py-3 flex items-center gap-3">
          <Landmark className="w-6 h-6 text-[#8257E5] shrink-0" strokeWidth={2.3} />
          <span className="text-[17px] font-bold text-[#18181B] truncate tabular-nums">
            {t.results.checkingBankPrefix} {submittedInput.bankAccount}
            {submittedInput.bankName ? ` (${submittedInput.bankName})` : ''}
          </span>
        </div>
      )}

      {/* 2. Stacked Verdict Banner Card */}
      <StackedCard surfaceColor={palette.surfaceBg} wrapperClassName="mb-2">
        <div
          className="px-6 py-4 border-b-2 border-[#18181B] flex items-center gap-3"
          style={{ backgroundColor: palette.bannerBg, color: palette.bannerText }}
        >
          <VerdictIcon className="w-7 h-7 shrink-0" strokeWidth={2.5} />
          <p className="text-[19px] sm:text-[20px] font-extrabold leading-[26px]">
            {(() => {
              const db = result.phone_lookup;
              if (submittedInput?.type === 'phone' && db?.available) {
                if (db.police_report_count > 0 || db.verified_report_count > 0 || db.fraud) {
                  return t.results.phoneVerdictBanner.reportsFound;
                }
                if (db.unverified_report_count > 0 || db.spam) {
                  return t.results.phoneVerdictBanner.suspiciousFound;
                }
                if (result.verdict === 'WAIT' && db.business_tier !== 'verified_spoofing') {
                  return t.results.phoneVerdictBanner.noReportsFound;
                }
              }
              return t.results.verdictBanner[result.verdict];
            })()}
          </p>
        </div>

        <div className="p-6">
          <span className="inline-flex items-center min-h-[36px] px-4 py-1 rounded-full bg-[#FFFFFF] border-[1.6px] border-[#18181B] text-[16px] font-bold text-[#18181B]">
            {result.scam_category}
          </span>

          <h2
            className="mt-3 text-[24px] sm:text-[26px] font-extrabold leading-[32px] text-balance"
            style={{ color: palette.bodyText }}
          >
            {result.headline}
          </h2>

          <p
            className="mt-2.5 text-[18px] sm:text-[19px] font-medium leading-[27px]"
            style={{ color: palette.bodyText }}
          >
            {result.simple_summary}
          </p>

          {/* Local Device Flag Warning Badge */}
          {localFlag && (
            <div className="mt-4 rounded-[20px] bg-[#FEF2F2] border-2 border-[#DC2626] p-4">
              <p className="text-[17px] sm:text-[18px] font-extrabold text-[#7F1D1D]">
                {t.results.localFlagBadgeTitle}
              </p>
              {localFlag.reason && (
                <p className="mt-1 text-[16px] leading-[23px] font-medium text-[#7F1D1D]">
                  {localFlag.reason}
                </p>
              )}
              {localFlag.source === 'device' && (
                <button
                  type="button"
                  onClick={handleRemoveLocalFlag}
                  className="mt-2.5 inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border-[1.6px] border-[#18181B] text-[14px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAF5F0]"
                >
                  {t.results.removeLocalFlagButton}
                </button>
              )}
            </div>
          )}

          {/* Live PenipuMY Database Summary Badge Box (only shown when live database responded) */}
          {result.phone_lookup?.available && (
            <div className="mt-4 rounded-[20px] bg-[#FFFFFF] border-[1.8px] border-[#18181B] p-4">
              <p className="text-[16px] font-extrabold text-[#18181B]">
                {t.results.dbSummaryTitle}
              </p>

              <div className="mt-2.5 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.6px] border-[#18181B] text-[16px] font-bold tabular-nums ${
                    result.phone_lookup.police_report_count > 0
                      ? 'bg-[#FEE2E2] text-[#7F1D1D]'
                      : 'bg-[#FAF5F0] text-[#18181B]'
                  }`}
                >
                  <span>{t.results.dbPoliceReports}</span>
                  <span>{result.phone_lookup.police_report_count}</span>
                </span>

                {(() => {
                  const communityCount =
                    result.phone_lookup.verified_report_count +
                    result.phone_lookup.unverified_report_count;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.6px] border-[#18181B] text-[16px] font-bold tabular-nums ${
                        communityCount > 0
                          ? 'bg-[#FEF3C7] text-[#78350F]'
                          : 'bg-[#FAF5F0] text-[#18181B]'
                      }`}
                    >
                      <span>{t.results.dbCommunityReports}</span>
                      <span>{communityCount}</span>
                    </span>
                  );
                })()}

                {result.phone_lookup.business_tier === 'verified_spoofing' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.6px] border-[#18181B] bg-[#FFFBEB] text-[16px] font-bold text-[#78350F]">
                    <span>{t.results.dbSpoofingBadge}</span>
                    {result.phone_lookup.business_name && (
                      <span>({result.phone_lookup.business_name})</span>
                    )}
                  </span>
                )}
              </div>

              {result.phone_lookup.police_report_count === 0 &&
                result.phone_lookup.verified_report_count === 0 &&
                result.phone_lookup.unverified_report_count === 0 &&
                !result.phone_lookup.fraud &&
                !result.phone_lookup.spam &&
                result.phone_lookup.business_tier !== 'verified_spoofing' && (
                  <p className="mt-2.5 text-[16px] leading-[23px] text-[#52525B] font-medium">
                    {t.results.dbZeroReportsNote}
                  </p>
                )}
            </div>
          )}
        </div>
      </StackedCard>

      {/* 3. Read This Aloud / Stop Reading Pill Button */}
      <div>
        <button
          type="button"
          onClick={handleToggleSpeech}
          disabled={isTranslating}
          className={`w-full min-h-[60px] px-6 py-3 rounded-full border-2 border-[#18181B] flex items-center justify-center gap-3 text-[20px] font-bold cursor-pointer active:scale-[0.99] transition-transform disabled:opacity-60 disabled:cursor-not-allowed ${
            isSpeaking
              ? 'bg-[#DC2626] text-[#FFFFFF] hover:bg-[#b91c1c]'
              : 'bg-[#5CE094] text-[#18181B] hover:bg-[#4cd386]'
          }`}
        >
          {isSpeaking ? (
            <>
              <Square className="w-5 h-5 fill-current shrink-0" />
              <span>{t.results.stopReadingButton}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-6 h-6 shrink-0" strokeWidth={2.4} />
              <span>{t.results.readAloudButton}</span>
            </>
          )}
        </button>

        {speechError && (
          <p className="mt-2 text-[16px] font-semibold text-[#7F1D1D] text-center">
            {speechError}
          </p>
        )}
      </div>

      {/* Extracted Phone Number Shortcut (for text, screenshots, or audio) */}
      {(() => {
        if (submittedInput?.type === 'phone' || submittedInput?.type === 'bank') return null;
        const fromModel = result.extracted_phone_numbers ?? [];
        const fromText = extractPhoneNumbers(submittedInput?.text ?? '');
        const merged: string[] = [];
        const seen = new Set<string>();
        for (const num of [...fromModel, ...fromText]) {
          const digits = num.replace(/\D/g, '');
          if (digits.length >= 7 && !seen.has(digits)) {
            seen.add(digits);
            merged.push(num);
          }
        }
        if (merged.length === 0) return null;
        return (
          <section className="rounded-[24px] bg-[#ECFDF3] border-2 border-[#18181B] p-5">
            <p className="text-[18px] font-extrabold text-[#14532D] mb-3">
              {t.results.extractedNumberTitle}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {merged.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onCheckExtractedPhone(num)}
                  className="min-h-[50px] px-5 py-2.5 rounded-full bg-[#5CE094] border-[1.8px] border-[#18181B] inline-flex items-center gap-2 text-[17px] font-bold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.98] transition-transform tabular-nums"
                >
                  <span>
                    {t.results.checkExtractedButtonPrefix} {num}
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })()}

      {/* 4. Why This Looks Risky / What We Checked Card */}
      {result.red_flags.length > 0 && (
        <section className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6">
          <h3 className="text-[21px] font-extrabold leading-[28px] text-[#18181B]">
            {result.verdict === 'SAFE'
              ? t.results.whatCheckedTitle
              : t.results.whyRiskyTitle}
          </h3>

          <ul className="mt-4 space-y-4">
            {result.red_flags.map((flag, idx) => (
              <li key={idx} className="space-y-2">
                {flag.quoted_clue && (
                  <div
                    className={`rounded-[16px] border-[1.6px] border-[#18181B] px-4 py-3 text-[17px] font-bold leading-[24px] break-words ${
                      result.verdict === 'SAFE'
                        ? 'bg-[#ECFDF3] text-[#14532D]'
                        : result.verdict === 'WAIT'
                        ? 'bg-[#FFFBEB] text-[#78350F]'
                        : 'bg-[#FEF2F2] text-[#7F1D1D]'
                    }`}
                  >
                    “{flag.quoted_clue}”
                  </div>
                )}
                <p className="flex items-start gap-2.5 text-[18px] leading-[26px] text-[#18181B]">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 w-2.5 h-2.5 rounded-full bg-[#18181B] shrink-0"
                  />
                  <span>{flag.plain_explanation}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. How to Check Safely Before Acting Card */}
      <section className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6">
        <h3 className="text-[21px] font-extrabold leading-[28px] text-[#18181B]">
          {t.results.safeStepsTitle}
        </h3>

        <ol className="mt-4 space-y-4">
          {result.safe_check_steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3.5">
              <span className="w-[34px] h-[34px] rounded-full bg-[#5CE094] border-[1.8px] border-[#18181B] flex items-center justify-center text-[17px] font-extrabold text-[#18181B] shrink-0 mt-0.5 tabular-nums">
                {idx + 1}
              </span>
              <span className="text-[18px] sm:text-[19px] leading-[27px] text-[#18181B]">
                {step}
              </span>
            </li>
          ))}
        </ol>

        {isPhoneOrBank && targetValue && (
          <div className="mt-6 pt-5 border-t-[1.5px] border-[#18181B]/15 space-y-3">
            <button
              type="button"
              onClick={() =>
                handleCopyAndOpen(
                  'https://semakmule.rmp.gov.my/',
                  t.results.copiedSemakMuleToast
                )
              }
              className="w-full min-h-[58px] px-5 py-3 rounded-full bg-[#EFEAFC] border-2 border-[#18181B] flex items-center justify-center gap-2 text-[18px] font-bold text-[#18181B] cursor-pointer hover:bg-[#e1d7f9] active:scale-[0.99] transition-transform text-center"
            >
              <span>{t.results.copySemakMuleButton}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopyAndOpen(
                  'https://penipu.my/',
                  t.results.copiedPenipuMyToast
                )
              }
              className="w-full min-h-[58px] px-5 py-3 rounded-full bg-[#FAF5F0] border-2 border-[#18181B] flex items-center justify-center gap-2 text-[18px] font-bold text-[#18181B] cursor-pointer hover:bg-[#f0e8df] active:scale-[0.99] transition-transform text-center"
            >
              <span>{t.results.copyPenipuMyButton}</span>
            </button>

            {submittedInput?.type === 'phone' && (
              <a
                href="https://www.truecaller.com/scam-checker"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[54px] px-5 py-3 rounded-full bg-[#FFFFFF] border-[1.8px] border-[#18181B] flex items-center justify-center gap-2 text-[17px] font-bold text-[#18181B] hover:bg-[#FAF5F0] active:scale-[0.99] transition-transform text-center"
              >
                <span>{t.results.truecallerButton}</span>
                <ExternalLink className="w-4 h-4 text-[#8257E5] shrink-0" strokeWidth={2.5} />
              </a>
            )}
          </div>
        )}

        {relevantPortals.length > 0 && (
          <div className="mt-6 pt-5 border-t-[1.5px] border-[#18181B]/15">
            <p className="text-[17px] font-bold text-[#52525B] mb-3">
              {t.results.portalsTitle}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {relevantPortals.map((portal) => (
                <a
                  key={portal.id}
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[50px] px-5 py-2.5 rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] inline-flex items-center gap-2 text-[16px] sm:text-[17px] font-bold text-[#18181B] hover:bg-[#e1d7f9] active:scale-[0.98] transition-transform"
                >
                  <span>{portal.label}</span>
                  <ExternalLink className="w-4 h-4 text-[#8257E5] shrink-0" strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Copy Result Summary Button */}
      <button
        type="button"
        onClick={handleCopySummary}
        className="w-full min-h-[60px] px-6 py-3.5 rounded-full bg-[#EFEAFC] border-2 border-[#18181B] flex items-center justify-center gap-3 text-[19px] sm:text-[20px] font-bold text-[#18181B] cursor-pointer hover:bg-[#e2d7fa] active:scale-[0.99] transition-transform"
      >
        <Clipboard className="w-5 h-5 text-[#8257E5] shrink-0" strokeWidth={2.5} />
        <span>{t.results.copyResultButton}</span>
      </button>

      {/* 6. Send to Family to Double-Check */}
      <button
        type="button"
        onClick={handleSendToFamily}
        className="w-full min-h-[60px] px-6 py-3.5 rounded-full bg-[#8257E5] border-2 border-[#18181B] flex items-center justify-center gap-3 text-[19px] sm:text-[20px] font-bold text-[#FFFFFF] cursor-pointer hover:bg-[#7446dd] active:scale-[0.99] transition-transform"
      >
        <Share2 className="w-5 h-5 shrink-0" strokeWidth={2.5} />
        <span>{t.results.sendToFamilyButton}</span>
      </button>

      {/* 7. Footer Actions */}
      <div className="flex flex-col gap-4 pt-1">
        <button
          type="button"
          onClick={onCheckAnother}
          className="w-full min-h-[58px] px-6 py-3 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] flex items-center justify-center gap-2.5 text-[19px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAF5F0] active:scale-[0.99] transition-transform"
        >
          <RotateCcw className="w-5 h-5 shrink-0" strokeWidth={2.4} />
          <span>{t.results.checkAnotherButton}</span>
        </button>

        {(result.verdict === 'STOP' || result.verdict === 'WAIT') && (
          <button
            type="button"
            onClick={onOpenEmergency}
            className="w-full min-h-[68px] px-6 py-3.5 rounded-full bg-[#FEF2F2] border-[2.2px] border-[#DC2626] flex items-center justify-center gap-3 text-[19px] font-extrabold text-[#DC2626] cursor-pointer hover:bg-[#fee2e2] active:scale-[0.99] transition-transform"
          >
            <ShieldAlert className="w-6 h-6 shrink-0" strokeWidth={2.5} />
            <span>{t.results.emergencyButton}</span>
          </button>
        )}

        {/* Subtle Local "Warn Others (Save Locally)" Option for Phone / Bank results */}
        {isPhoneOrBank && targetValue && !localFlag && (
          <div className="pt-1">
            {!isFlagFormOpen ? (
              <button
                type="button"
                onClick={() => {
                  setFlagReasonInput(t.results.markScamQuickReasons[0]);
                  setIsFlagFormOpen(true);
                }}
                className="w-full min-h-[52px] px-5 py-2.5 rounded-full bg-[#FAF5F0] border-[1.8px] border-[#18181B] flex items-center justify-center gap-2 text-[17px] font-bold text-[#18181B] cursor-pointer hover:bg-[#EFEAFC] active:scale-[0.99] transition-transform"
              >
                <span>{t.results.markAsScamButton}</span>
              </button>
            ) : (
              <div className="rounded-[24px] bg-[#FFFFFF] border-2 border-[#18181B] p-5 space-y-3.5">
                <p className="text-[18px] font-extrabold text-[#18181B]">
                  {t.results.markScamCardTitle}
                </p>

                <div className="flex flex-wrap gap-2">
                  {t.results.markScamQuickReasons.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFlagReasonInput(preset)}
                      className={`min-h-[42px] px-3.5 py-1.5 rounded-full border-[1.6px] border-[#18181B] text-[15px] font-bold cursor-pointer transition-colors ${
                        flagReasonInput === preset
                          ? 'bg-[#8257E5] text-[#FFFFFF]'
                          : 'bg-[#EFEAFC] text-[#18181B] hover:bg-[#e1d7f9]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={flagReasonInput}
                  onChange={(e) => setFlagReasonInput(e.target.value)}
                  placeholder={t.results.markScamReasonPlaceholder}
                  className="w-full min-h-[52px] px-4 py-2.5 rounded-full bg-[#FAF5F0] border-[1.8px] border-[#18181B] text-[17px] text-[#18181B] placeholder:text-[#52525B]"
                />

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveLocalFlag}
                    className="flex-1 min-w-[180px] min-h-[52px] px-5 py-2.5 rounded-full bg-[#5CE094] border-2 border-[#18181B] text-[17px] font-extrabold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.98] transition-transform"
                  >
                    {t.results.markScamSaveButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFlagFormOpen(false)}
                    className="min-h-[52px] px-5 py-2.5 rounded-full bg-[#FFFFFF] border-[1.8px] border-[#18181B] text-[17px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAF5F0]"
                  >
                    {t.results.markScamCancelButton}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
