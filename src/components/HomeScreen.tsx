import { useRef } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardPaste,
  History,
  Landmark,
  Mic,
  Phone,
  SearchCheck,
  Trash2,
  X,
} from 'lucide-react';
import type { ClaimedIdentity, HistoryEntry, Language, Verdict } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { extractPhoneNumbers } from '../utils/formatters';
import { getLocalScamFlag } from '../utils/localFlags';
import { StackedCard } from './StackedCard';
import { HeroIllustration } from './HeroIllustration';

interface HomeScreenProps {
  language: Language;
  activeTab: 'message' | 'phone' | 'bank';
  textInput: string;
  inputError: string;
  phoneInput: string;
  phoneError: string;
  bankAccountInput: string;
  bankNameInput: string;
  bankError: string;
  claimedIdentity: ClaimedIdentity;
  history: HistoryEntry[];
  onChangeTab: (tab: 'message' | 'phone' | 'bank') => void;
  onChangeText: (text: string) => void;
  onSetError: (err: string) => void;
  onChangePhone: (phone: string) => void;
  onSetPhoneError: (err: string) => void;
  onChangeBankAccount: (account: string) => void;
  onChangeBankName: (bankName: string) => void;
  onSetBankError: (err: string) => void;
  onChangeClaimedIdentity: (identity: ClaimedIdentity) => void;
  onCheckText: () => void;
  onCheckPhone: () => void;
  onCheckBank: () => void;
  onUseExtractedPhone: (phone: string) => void;
  onUploadImage: (file: File) => void;
  onUploadAudio: (file: File) => void;
  onOpenEmergency: () => void;
  onSelectHistory: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_AUDIO_BYTES = 18 * 1024 * 1024;

const CLAIMED_OPTIONS: ClaimedIdentity[] = [
  'bank',
  'police_gov',
  'courier',
  'family',
  'seller',
  'not_sure',
];

const BANK_NAME_CHIPS = ['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong'];

const HISTORY_BADGE_STYLE: Record<Verdict, { bg: string; text: string }> = {
  STOP: { bg: '#DC2626', text: '#FFFFFF' },
  WAIT: { bg: '#D97706', text: '#FFFFFF' },
  SAFE: { bg: '#5CE094', text: '#18181B' },
};

function formatCheckTime(timestamp: number, language: Language): string {
  const locale = language === 'zh' ? 'zh-CN' : language === 'ms' ? 'ms-MY' : 'en-MY';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleDateString();
  }
}

export function HomeScreen({
  language,
  activeTab,
  textInput,
  inputError,
  phoneInput,
  phoneError,
  bankAccountInput,
  bankNameInput,
  bankError,
  claimedIdentity,
  history,
  onChangeTab,
  onChangeText,
  onSetError,
  onChangePhone,
  onSetPhoneError,
  onChangeBankAccount,
  onChangeBankName,
  onSetBankError,
  onChangeClaimedIdentity,
  onCheckText,
  onCheckPhone,
  onCheckBank,
  onUseExtractedPhone,
  onUploadImage,
  onUploadAudio,
  onOpenEmergency,
  onSelectHistory,
  onClearHistory,
}: HomeScreenProps) {
  const t = TRANSLATIONS[language];
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const extractedNumbers = extractPhoneNumbers(textInput);
  const phoneLocalFlag = getLocalScamFlag('phone', phoneInput, language);
  const bankLocalFlag = getLocalScamFlag('bank', bankAccountInput, language);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(clipText);
        onSetError('');
      } else {
        onSetError(t.home.clipboardError);
      }
    } catch {
      onSetError(t.home.clipboardError);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      onSetError(t.home.imageTooLargeError);
      return;
    }
    onSetError('');
    onUploadImage(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_AUDIO_BYTES) {
      onSetError(t.home.audioTooLargeError);
      return;
    }
    onSetError('');
    onUploadAudio(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stacked Hero Card */}
      <StackedCard surfaceColor="#FFFFFF" wrapperClassName="mb-2" className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[23px] sm:text-[25px] font-extrabold leading-[31px] text-[#18181B] text-balance">
              {t.hero.title}
            </h2>
            <p className="mt-2 text-[18px] leading-[26px] text-[#52525B]">
              {t.hero.subtitle}
            </p>
          </div>
          <HeroIllustration />
        </div>
      </StackedCard>

      <div className="rounded-2xl border-2 border-[#18181B] bg-[#FFF7D6] px-5 py-4 text-[15px] font-semibold leading-6 text-[#3F3F46]">
        {language === 'ms'
          ? 'Demo percuma: keputusan menggunakan contoh dan peraturan pada peranti ini sahaja. Foto serta nota suara tidak dihantar atau dibaca.'
          : language === 'zh'
            ? '免费演示：结果只使用此设备上的示例和规则。照片和语音不会被上传或读取。'
            : 'Free demo: results use examples and rules on this device only. Photos and voice notes are not uploaded or read.'}
      </div>

      {/* Action 1: Giant Primary Pill Button — Upload Screenshot or Photo */}
      <div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="sr-only"
          aria-label={t.home.uploadPhotoTitle}
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="w-full min-h-[84px] px-6 py-4 rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center gap-4 text-left cursor-pointer hover:bg-[#4cd386] active:scale-[0.99] transition-transform"
        >
          <span className="w-12 h-12 rounded-full bg-[#FFFFFF] border-[1.8px] border-[#18181B] flex items-center justify-center shrink-0">
            <Camera className="w-6 h-6 text-[#18181B]" strokeWidth={2.3} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[20px] sm:text-[21px] font-extrabold leading-[26px] text-[#18181B]">
              {t.home.uploadPhotoTitle}
            </span>
            <span className="block mt-0.5 text-[16px] sm:text-[17px] font-medium leading-[23px] text-[#18181B]/85">
              {t.home.uploadPhotoSub}
            </span>
          </span>
        </button>
      </div>

      {/* Mode Tabs: Check Message vs Check Phone vs Check Bank Account */}
      <div
        role="tablist"
        aria-label="Check Mode"
        className="flex flex-wrap gap-2.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'message'}
          onClick={() => onChangeTab('message')}
          className={`flex-1 min-w-[155px] min-h-[54px] px-4 py-2.5 rounded-full border-2 border-[#18181B] text-[17px] sm:text-[18px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
            activeTab === 'message'
              ? 'bg-[#8257E5] text-[#FFFFFF]'
              : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#EFEAFC]'
          }`}
        >
          {t.home.tabMessage}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'phone'}
          onClick={() => onChangeTab('phone')}
          className={`flex-1 min-w-[155px] min-h-[54px] px-4 py-2.5 rounded-full border-2 border-[#18181B] text-[17px] sm:text-[18px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
            activeTab === 'phone'
              ? 'bg-[#8257E5] text-[#FFFFFF]'
              : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#EFEAFC]'
          }`}
        >
          {t.home.tabPhone}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'bank'}
          onClick={() => onChangeTab('bank')}
          className={`flex-1 min-w-[180px] min-h-[54px] px-4 py-2.5 rounded-full border-2 border-[#18181B] text-[17px] sm:text-[18px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
            activeTab === 'bank'
              ? 'bg-[#8257E5] text-[#FFFFFF]'
              : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#EFEAFC]'
          }`}
        >
          {t.home.tabBank}
        </button>
      </div>

      {/* Action 2A: Message / Voice Note Checker Card */}
      {activeTab === 'message' && (
        <section className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="message-textarea"
              className="text-[20px] font-extrabold leading-[28px] text-[#18181B]"
            >
              {t.home.pasteSectionTitle}
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePaste}
                className="min-h-[48px] px-4 py-2 rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] flex items-center gap-2 text-[16px] font-bold text-[#18181B] cursor-pointer hover:bg-[#e4dbfa] active:scale-[0.98] transition-transform"
              >
                <ClipboardPaste className="w-4 h-4 text-[#8257E5]" strokeWidth={2.5} />
                <span>{t.home.pasteButton}</span>
              </button>

              {textInput.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeText('');
                    onSetError('');
                  }}
                  aria-label={t.home.clearButton}
                  className="min-h-[48px] px-4 py-2 rounded-full bg-[#FAF5F0] border-[1.8px] border-[#18181B] flex items-center gap-1.5 text-[16px] font-bold text-[#18181B] cursor-pointer hover:bg-[#f0e8df] active:scale-[0.98] transition-transform"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                  <span>{t.home.clearButton}</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            id="message-textarea"
            rows={4}
            value={textInput}
            onChange={(e) => {
              onChangeText(e.target.value);
              if (inputError) onSetError('');
            }}
            placeholder={t.home.textareaPlaceholder}
            className="mt-4 w-full rounded-[18px] bg-[#EFEAFC] border-[1.8px] border-[#18181B] p-4 text-[19px] leading-[28px] text-[#18181B] placeholder:text-[#52525B] resize-y"
          />

          {/* Quick Extracted Phone Number Shortcut */}
          {extractedNumbers.length > 0 && (
            <div className="mt-3 rounded-[18px] bg-[#ECFDF3] border-[1.6px] border-[#18181B] p-3.5">
              <p className="text-[16px] font-bold text-[#14532D] mb-2">
                {t.home.extractedFoundLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedNumbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onUseExtractedPhone(num)}
                    className="min-h-[46px] px-4 py-2 rounded-full bg-[#5CE094] border-[1.6px] border-[#18181B] inline-flex items-center gap-2 text-[16px] font-bold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.98] transition-transform tabular-nums"
                  >
                    <Phone className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    <span>
                      {t.home.checkExtractedPrefix} {num}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {inputError && (
            <div
              role="alert"
              className="mt-3 rounded-[18px] bg-[#FEF2F2] border-[1.8px] border-[#DC2626] px-4 py-3 text-[18px] font-semibold leading-[25px] text-[#7F1D1D]"
            >
              {inputError}
            </div>
          )}

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={onCheckText}
              className="w-full min-h-[60px] px-6 py-3 rounded-full bg-[#8257E5] border-2 border-[#18181B] flex items-center justify-center gap-2.5 text-[20px] font-bold text-[#FFFFFF] cursor-pointer hover:bg-[#7446dd] active:scale-[0.99] transition-transform"
            >
              <SearchCheck className="w-6 h-6 shrink-0" strokeWidth={2.4} />
              <span>{t.home.checkMessageButton}</span>
            </button>

            <div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="sr-only"
                aria-label={t.home.uploadAudioButton}
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="w-full min-h-[58px] px-6 py-3 rounded-full bg-[#FAF5F0] border-2 border-[#18181B] flex items-center justify-center gap-2.5 text-[19px] font-bold text-[#18181B] cursor-pointer hover:bg-[#f1e8df] active:scale-[0.99] transition-transform"
              >
                <Mic className="w-5 h-5 shrink-0 text-[#18181B]" strokeWidth={2.4} />
                <span>{t.home.uploadAudioButton}</span>
              </button>
            </div>
          </div>

          {/* 3 Quick Example Chips */}
          <div className="mt-5 pt-4 border-t-[1.5px] border-[#18181B]/15">
            <p className="text-[16px] font-bold text-[#52525B] mb-3">
              {t.home.tryExampleLabel}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {t.home.examples.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => {
                    onChangeText(example.text);
                    onSetError('');
                  }}
                  className="min-h-[48px] px-4 py-2 rounded-full bg-[#EFEAFC] border-[1.6px] border-[#18181B] text-[16px] font-bold text-[#18181B] cursor-pointer hover:bg-[#e1d7f9] active:scale-[0.98] transition-transform"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Action 2B: Check Phone Number Card */}
      {activeTab === 'phone' && (
        <section
          id="phone-checker-card"
          className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="phone-check-input"
              className="text-[20px] font-extrabold leading-[28px] text-[#18181B]"
            >
              {t.home.phoneInputLabel}
            </label>

            {phoneInput.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onChangePhone('');
                  onSetPhoneError('');
                }}
                aria-label={t.home.clearButton}
                className="min-h-[48px] px-4 py-2 rounded-full bg-[#FAF5F0] border-[1.8px] border-[#18181B] flex items-center gap-1.5 text-[16px] font-bold text-[#18181B] cursor-pointer hover:bg-[#f0e8df] active:scale-[0.98] transition-transform"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
                <span>{t.home.clearButton}</span>
              </button>
            )}
          </div>

          <input
            id="phone-check-input"
            type="tel"
            inputMode="tel"
            value={phoneInput}
            onChange={(e) => {
              onChangePhone(e.target.value);
              if (phoneError) onSetPhoneError('');
            }}
            placeholder={t.home.phoneInputPlaceholder}
            className="mt-4 w-full min-h-[62px] px-5 py-3 rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] text-[20px] font-bold text-[#18181B] placeholder:text-[#52525B] placeholder:font-normal tabular-nums"
          />

          {phoneLocalFlag && (
            <div
              role="alert"
              className="mt-3 rounded-[18px] bg-[#FEF2F2] border-[1.8px] border-[#DC2626] px-4 py-3 text-[17px] font-bold leading-[24px] text-[#7F1D1D]"
            >
              <p>{t.results.localFlagBadgeTitle}</p>
              <p className="mt-0.5 text-[15px] font-medium">{phoneLocalFlag.reason}</p>
            </div>
          )}

          {phoneError && (
            <div
              role="alert"
              className="mt-3 rounded-[18px] bg-[#FEF2F2] border-[1.8px] border-[#DC2626] px-4 py-3 text-[18px] font-semibold leading-[25px] text-[#7F1D1D]"
            >
              {phoneError}
            </div>
          )}

          {/* Claimed Identity Selector Chips */}
          <div className="mt-5">
            <p className="text-[18px] font-bold text-[#18181B] mb-3">
              {t.home.claimedByLabel}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {CLAIMED_OPTIONS.map((optionKey) => {
                const isSelected = claimedIdentity === optionKey;
                return (
                  <button
                    key={optionKey}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onChangeClaimedIdentity(optionKey)}
                    className={`min-h-[48px] px-4 py-2 rounded-full border-[1.8px] border-[#18181B] inline-flex items-center gap-1.5 text-[16px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#8257E5] text-[#FFFFFF]'
                        : 'bg-[#EFEAFC] text-[#18181B] hover:bg-[#e1d7f9]'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 shrink-0" strokeWidth={3} />}
                    <span>{t.home.claimedOptions[optionKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckPhone}
            className="mt-6 w-full min-h-[64px] px-6 py-3.5 rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center gap-2.5 text-[20px] font-extrabold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.99] transition-transform"
          >
            <Phone className="w-6 h-6 shrink-0" strokeWidth={2.5} />
            <span>{t.home.checkPhoneButton}</span>
          </button>

          {/* Subtle Test Demo Chip */}
          <div className="mt-4 pt-4 border-t-[1.5px] border-[#18181B]/15 flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-[#52525B]">
              {t.home.tryTestPhoneLabel}
            </span>
            <button
              type="button"
              onClick={() => {
                onChangePhone('011-5555 8888');
                onChangeClaimedIdentity('police_gov');
                onSetPhoneError('');
              }}
              className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-[#EFEAFC] border-[1.6px] border-[#18181B] text-[15px] font-bold text-[#18181B] cursor-pointer hover:bg-[#e1d7f9] active:scale-[0.98] transition-transform tabular-nums"
            >
              011-5555 8888
            </button>
          </div>
        </section>
      )}

      {/* Action 2C: Check Bank Account Card */}
      {activeTab === 'bank' && (
        <section
          id="bank-checker-card"
          className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="bank-check-input"
              className="text-[20px] font-extrabold leading-[28px] text-[#18181B]"
            >
              {t.home.bankInputLabel}
            </label>

            {bankAccountInput.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onChangeBankAccount('');
                  onSetBankError('');
                }}
                aria-label={t.home.clearButton}
                className="min-h-[48px] px-4 py-2 rounded-full bg-[#FAF5F0] border-[1.8px] border-[#18181B] flex items-center gap-1.5 text-[16px] font-bold text-[#18181B] cursor-pointer hover:bg-[#f0e8df] active:scale-[0.98] transition-transform"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
                <span>{t.home.clearButton}</span>
              </button>
            )}
          </div>

          <input
            id="bank-check-input"
            type="text"
            inputMode="numeric"
            value={bankAccountInput}
            onChange={(e) => {
              onChangeBankAccount(e.target.value);
              if (bankError) onSetBankError('');
            }}
            placeholder={t.home.bankInputPlaceholder}
            className="mt-4 w-full min-h-[62px] px-5 py-3 rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] text-[20px] font-bold text-[#18181B] placeholder:text-[#52525B] placeholder:font-normal tabular-nums"
          />

          {bankLocalFlag && (
            <div
              role="alert"
              className="mt-3 rounded-[18px] bg-[#FEF2F2] border-[1.8px] border-[#DC2626] px-4 py-3 text-[17px] font-bold leading-[24px] text-[#7F1D1D]"
            >
              <p>{t.results.localFlagBadgeTitle}</p>
              <p className="mt-0.5 text-[15px] font-medium">{bankLocalFlag.reason}</p>
            </div>
          )}

          {bankError && (
            <div
              role="alert"
              className="mt-3 rounded-[18px] bg-[#FEF2F2] border-[1.8px] border-[#DC2626] px-4 py-3 text-[18px] font-semibold leading-[25px] text-[#7F1D1D]"
            >
              {bankError}
            </div>
          )}

          {/* Optional Bank Selector Chips */}
          <div className="mt-5">
            <p className="text-[18px] font-bold text-[#18181B] mb-3">
              {t.home.bankNameLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {BANK_NAME_CHIPS.map((bank) => {
                const isSelected = bankNameInput === bank;
                return (
                  <button
                    key={bank}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onChangeBankName(isSelected ? '' : bank)}
                    className={`min-h-[44px] px-4 py-1.5 rounded-full border-[1.8px] border-[#18181B] inline-flex items-center gap-1.5 text-[15px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#8257E5] text-[#FFFFFF]'
                        : 'bg-[#FAF5F0] text-[#18181B] hover:bg-[#EFEAFC]'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 shrink-0" strokeWidth={3} />}
                    <span>{bank}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Claimed Identity Selector Chips */}
          <div className="mt-5">
            <p className="text-[18px] font-bold text-[#18181B] mb-3">
              {t.home.bankClaimedByLabel}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {CLAIMED_OPTIONS.map((optionKey) => {
                const isSelected = claimedIdentity === optionKey;
                return (
                  <button
                    key={optionKey}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onChangeClaimedIdentity(optionKey)}
                    className={`min-h-[48px] px-4 py-2 rounded-full border-[1.8px] border-[#18181B] inline-flex items-center gap-1.5 text-[16px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#8257E5] text-[#FFFFFF]'
                        : 'bg-[#EFEAFC] text-[#18181B] hover:bg-[#e1d7f9]'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 shrink-0" strokeWidth={3} />}
                    <span>{t.home.claimedOptions[optionKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckBank}
            className="mt-6 w-full min-h-[64px] px-6 py-3.5 rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center gap-2.5 text-[20px] font-extrabold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.99] transition-transform"
          >
            <Landmark className="w-6 h-6 shrink-0" strokeWidth={2.5} />
            <span>{t.home.checkBankButton}</span>
          </button>

          {/* Subtle Test Demo Chip */}
          <div className="mt-4 pt-4 border-t-[1.5px] border-[#18181B]/15 flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-[#52525B]">
              {t.home.tryTestBankLabel}
            </span>
            <button
              type="button"
              onClick={() => {
                onChangeBankAccount('1122 3344 5566');
                onChangeBankName('Maybank');
                onChangeClaimedIdentity('police_gov');
                onSetBankError('');
              }}
              className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-[#EFEAFC] border-[1.6px] border-[#18181B] text-[15px] font-bold text-[#18181B] cursor-pointer hover:bg-[#e1d7f9] active:scale-[0.98] transition-transform tabular-nums"
            >
              1122 3344 5566
            </button>
          </div>
        </section>
      )}

      {/* Action 3: Prominent Emergency Pill Button */}
      <button
        type="button"
        onClick={onOpenEmergency}
        className="w-full min-h-[72px] px-6 py-4 rounded-full bg-[#FEF2F2] border-[2.2px] border-[#DC2626] flex items-center gap-4 text-left cursor-pointer hover:bg-[#fee2e2] active:scale-[0.99] transition-transform"
      >
        <span className="w-12 h-12 rounded-full bg-[#DC2626] border-[1.8px] border-[#18181B] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-[#FFFFFF]" strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] sm:text-[20px] font-extrabold leading-[26px] text-[#DC2626]">
            {t.home.emergencyTitle}
          </span>
          <span className="block mt-0.5 text-[16px] font-semibold leading-[22px] text-[#7F1D1D]">
            {t.home.emergencySub}
          </span>
        </span>
      </button>

      {/* Recent Checks History Section (Last 5) */}
      <section
        aria-labelledby="recent-checks-heading"
        className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-[#8257E5]" strokeWidth={2.4} />
            </span>
            <h2
              id="recent-checks-heading"
              className="text-[20px] font-extrabold leading-[28px] text-[#18181B]"
            >
              {t.home.recentChecksTitle}
            </h2>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="min-h-[44px] px-4 py-1.5 rounded-full bg-[#FAF5F0] border-[1.8px] border-[#18181B] inline-flex items-center gap-1.5 text-[16px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FEF2F2] active:scale-[0.98] transition-transform"
            >
              <Trash2 className="w-4 h-4 shrink-0" strokeWidth={2.3} />
              <span>{t.home.recentChecksClear}</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="mt-3 text-[18px] leading-[26px] text-[#52525B]">
            {t.home.recentChecksEmpty}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.map((entry) => {
              const badge = HISTORY_BADGE_STYLE[entry.result.verdict];
              const VerdictIcon =
                entry.result.verdict === 'STOP'
                  ? AlertOctagon
                  : entry.result.verdict === 'WAIT'
                  ? AlertTriangle
                  : CheckCircle2;

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => onSelectHistory(entry)}
                    className="w-full min-h-[76px] rounded-[20px] border-[1.8px] border-[#18181B] bg-[#FAF5F0] hover:bg-[#EFEAFC] p-4 flex items-center justify-between gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border-[1.5px] border-[#18181B] text-[14px] font-extrabold shrink-0"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          <VerdictIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.6} />
                          <span>{t.home.verdictLabels[entry.result.verdict]}</span>
                        </span>

                        <span className="text-[15px] font-semibold text-[#52525B] tabular-nums">
                          {t.home.inputTypeLabels[entry.inputType]} ·{' '}
                          {formatCheckTime(entry.checkedAt, language)}
                        </span>
                      </div>

                      <p className="mt-1.5 text-[18px] sm:text-[19px] font-extrabold leading-[25px] text-[#18181B] truncate">
                        {entry.result.headline}
                      </p>

                      <p className="mt-0.5 text-[16px] leading-[22px] text-[#52525B] truncate">
                        {entry.inputPreview}
                      </p>
                    </div>

                    <ChevronRight
                      className="w-6 h-6 text-[#18181B] shrink-0"
                      strokeWidth={2.5}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
