import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Square,
  Users,
} from 'lucide-react';
import type { Language, TrustedFamilyContact } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { configureUtteranceVoice, countDigits } from '../utils/formatters';
import { BackgroundShapes } from './BackgroundShapes';
import { StackedCard } from './StackedCard';

interface OnboardingGuideProps {
  isOpen: boolean;
  language: Language;
  initialContact: TrustedFamilyContact | null;
  onSelectLanguage: (lang: Language) => void;
  onSaveFamilyAndFinish: (contact: TrustedFamilyContact) => void;
  onClose: () => void;
}

const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'zh', label: '中文' },
];

export function OnboardingGuide({
  isOpen,
  language,
  initialContact,
  onSelectLanguage,
  onSaveFamilyAndFinish,
  onClose,
}: OnboardingGuideProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [familyName, setFamilyName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = TRANSLATIONS[language];
  const ob = t.onboarding;

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setFamilyName(initialContact?.name ?? '');
      setFamilyPhone(initialContact?.phone ?? '');
      setFormError('');
      stopSpeech();
    } else {
      stopSpeech();
    }
  }, [isOpen, initialContact]);

  useEffect(() => {
    stopSpeech();
  }, [language]);

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

  if (!isOpen) return null;

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    if (step === 0) {
      textToSpeak = `${ob.slide1.title}. ${ob.slide1.message}`;
    } else if (step === 1) {
      textToSpeak = `${ob.slide2.title}. ${ob.slide2.card1Title}. ${ob.slide2.card1Desc} ${ob.slide2.card2Title}. ${ob.slide2.card2Desc} ${ob.slide2.tip}`;
    } else {
      textToSpeak = `${ob.slide3.title}. ${ob.slide3.subtitle} ${ob.slide3.homeScreenTip}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    configureUtteranceVoice(utterance, language);

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const goToStep = (nextStep: 0 | 1 | 2) => {
    stopSpeech();
    setFormError('');
    setStep(nextStep);
  };

  const handleSaveAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = familyName.trim();
    const trimmedPhone = familyPhone.trim();

    if (!trimmedName) {
      setFormError(t.familyModal.nameError);
      return;
    }
    if (countDigits(trimmedPhone) < 7) {
      setFormError(t.familyModal.phoneError);
      return;
    }

    stopSpeech();
    onSaveFamilyAndFinish({ name: trimmedName, phone: trimmedPhone });
  };

  const handleClose = () => {
    stopSpeech();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#EFEAFC] via-[#FAF5F0] to-[#DCF5EC] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.brandTitle}
    >
      <BackgroundShapes />

      <div className="relative z-10 mx-auto max-w-[680px] px-[22px] py-5 pb-12 min-h-screen flex flex-col">
        {/* Top Row: Brand Mark + Clear Skip Button */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#18181B]" strokeWidth={2.3} />
            </div>
            <span className="text-[22px] font-extrabold text-[#18181B] truncate">
              {t.brandTitle}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="min-h-[48px] px-5 py-2 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] text-[17px] font-bold text-[#18181B] cursor-pointer hover:bg-[#EFEAFC] active:scale-[0.98] transition-transform shrink-0"
          >
            {ob.skipButton}
          </button>
        </div>

        {/* Main Layered Pastel Onboarding Card */}
        <div className="flex-1 flex flex-col justify-center">
          <StackedCard surfaceColor="#FFFFFF" wrapperClassName="mb-4" className="p-6 sm:p-7">
            {/* Slide 1 Language Selector */}
            {step === 0 && (
              <div
                role="group"
                aria-label="Language"
                className="mb-6 grid grid-cols-3 gap-2"
              >
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isActive = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        stopSpeech();
                        onSelectLanguage(opt.code);
                      }}
                      aria-pressed={isActive}
                      className={`min-h-[48px] px-2.5 py-2 rounded-full border-2 border-[#18181B] flex items-center justify-center gap-1 text-[15px] sm:text-[16px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#8257E5] text-[#FFFFFF]'
                          : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#EFEAFC]'
                      }`}
                    >
                      {isActive && <Check className="w-4 h-4 shrink-0" strokeWidth={3} />}
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* SLIDE 1: Check Before You Act */}
            {step === 0 && (
              <div className="text-center">
                <div className="mx-auto inline-flex flex-col items-center gap-3 rounded-[24px] bg-[#EFEAFC] border-[1.8px] border-[#18181B] px-6 py-5">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center">
                      <ShieldCheck className="w-11 h-11 text-[#18181B]" strokeWidth={2.2} />
                    </div>
                    <div className="w-11 h-11 rounded-full bg-[#F6C344] border-2 border-[#18181B] flex items-center justify-center -ml-4 mt-8">
                      <Search className="w-5 h-5 text-[#18181B]" strokeWidth={2.6} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF3] border-[1.5px] border-[#18181B] text-[15px] font-bold text-[#14532D]">
                      <MessageCircle className="w-4 h-4" strokeWidth={2.4} />
                      WhatsApp
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] border-[1.5px] border-[#18181B] text-[15px] font-bold text-[#18181B]">
                      <Send className="w-4 h-4 text-[#8257E5]" strokeWidth={2.4} />
                      Telegram
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] border-[1.5px] border-[#18181B] text-[15px] font-bold text-[#78350F]">
                      SMS
                    </span>
                  </div>
                </div>

                <h2 className="mt-5 text-[24px] sm:text-[26px] font-extrabold leading-[32px] text-[#18181B] text-balance">
                  {ob.slide1.title}
                </h2>
                <p className="mt-3 text-[18px] sm:text-[19px] leading-[28px] text-[#18181B]">
                  {ob.slide1.message}
                </p>
              </div>
            )}

            {/* SLIDE 2: 2 Easy Ways to Check */}
            {step === 1 && (
              <div>
                <h2 className="text-[24px] sm:text-[26px] font-extrabold leading-[32px] text-[#18181B] text-center text-balance">
                  {ob.slide2.title}
                </h2>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-[22px] bg-[#ECFDF3] border-[1.8px] border-[#18181B] p-4">
                    <h3 className="text-[19px] font-extrabold leading-[26px] text-[#18181B]">
                      {ob.slide2.card1Title}
                    </h3>
                    <p className="mt-2 text-[18px] leading-[26px] text-[#14532D]">
                      {ob.slide2.card1Desc}
                    </p>
                  </div>

                  <div className="rounded-[22px] bg-[#EFEAFC] border-[1.8px] border-[#18181B] p-4">
                    <h3 className="text-[19px] font-extrabold leading-[26px] text-[#18181B]">
                      {ob.slide2.card2Title}
                    </h3>
                    <p className="mt-2 text-[18px] leading-[26px] text-[#18181B]">
                      {ob.slide2.card2Desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[18px] bg-[#FFFBEB] border-[1.6px] border-[#18181B] px-4 py-3.5 text-[18px] font-semibold leading-[26px] text-[#78350F]">
                  {ob.slide2.tip}
                </div>
              </div>
            )}

            {/* SLIDE 3: Set Up Your Safety Net (Optional) */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#EFEAFC] border-2 border-[#18181B] flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-[#8257E5]" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[23px] sm:text-[25px] font-extrabold leading-[31px] text-[#18181B]">
                    {ob.slide3.title}
                  </h2>
                </div>

                <p className="mt-2.5 text-[18px] leading-[26px] text-[#52525B]">
                  {ob.slide3.subtitle}
                </p>

                <form
                  id="onboarding-family-form"
                  onSubmit={handleSaveAndStart}
                  className="mt-4 space-y-3.5"
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="onboarding-family-name"
                      className="block text-[18px] font-bold text-[#18181B] mb-1.5"
                    >
                      {t.familyModal.nameLabel}
                    </label>
                    <input
                      id="onboarding-family-name"
                      type="text"
                      value={familyName}
                      onChange={(e) => {
                        setFamilyName(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder={t.familyModal.namePlaceholder}
                      className="w-full min-h-[54px] px-5 py-3 rounded-full bg-[#EFEAFC] border-[1.6px] border-[#18181B] text-[18px] text-[#18181B] placeholder:text-[#52525B]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="onboarding-family-phone"
                      className="block text-[18px] font-bold text-[#18181B] mb-1.5"
                    >
                      {t.familyModal.phoneLabel}
                    </label>
                    <input
                      id="onboarding-family-phone"
                      type="tel"
                      inputMode="tel"
                      value={familyPhone}
                      onChange={(e) => {
                        setFamilyPhone(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder={t.familyModal.phonePlaceholder}
                      className="w-full min-h-[54px] px-5 py-3 rounded-full bg-[#EFEAFC] border-[1.6px] border-[#18181B] text-[18px] text-[#18181B] placeholder:text-[#52525B]"
                    />
                  </div>

                  {formError && (
                    <div
                      role="alert"
                      className="rounded-[18px] bg-[#FEF2F2] border-[1.8px] border-[#DC2626] px-4 py-3 text-[18px] font-semibold text-[#7F1D1D]"
                    >
                      {formError}
                    </div>
                  )}
                </form>

                <div className="mt-4 rounded-[18px] bg-[#ECFDF3] border-[1.6px] border-[#18181B] px-4 py-3.5 text-[17px] sm:text-[18px] font-semibold leading-[26px] text-[#14532D]">
                  {ob.slide3.homeScreenTip}
                </div>
              </div>
            )}

            {/* Read Aloud Accessibility Button on Every Slide */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`w-full min-h-[54px] px-5 py-2.5 rounded-full border-2 border-[#18181B] flex items-center justify-center gap-2 text-[18px] font-bold cursor-pointer active:scale-[0.99] transition-transform ${
                  isSpeaking
                    ? 'bg-[#DC2626] text-[#FFFFFF]'
                    : 'bg-[#FAF5F0] text-[#18181B] hover:bg-[#EFEAFC]'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-5 h-5 fill-current shrink-0" />
                    <span>{ob.stopReadingButton}</span>
                  </>
                ) : (
                  <span>{ob.readAloudButton}</span>
                )}
              </button>
            </div>

            {/* 3 Progress Dots */}
            <div
              className="mt-5 flex items-center justify-center gap-2.5"
              aria-label={`Step ${step + 1} of 3`}
            >
              {[0, 1, 2].map((dotIdx) => {
                const active = step === dotIdx;
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    aria-label={`Go to step ${dotIdx + 1}`}
                    onClick={() => goToStep(dotIdx as 0 | 1 | 2)}
                    className={`h-3.5 rounded-full border-[1.8px] border-[#18181B] cursor-pointer transition-all ${
                      active ? 'w-9 bg-[#8257E5]' : 'w-3.5 bg-[#FFFFFF]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Navigation Buttons */}
            {step < 2 ? (
              <div className="mt-5 flex items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => goToStep((step - 1) as 0 | 1)}
                    aria-label={ob.backButtonLabel}
                    className="w-[58px] h-[58px] rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#4cd386] active:scale-[0.97] transition-transform"
                  >
                    <ArrowLeft className="w-6 h-6 text-[#18181B]" strokeWidth={2.6} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => goToStep((step + 1) as 1 | 2)}
                  className="flex-1 min-h-[58px] px-6 py-3 rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center gap-2 text-[20px] font-bold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.99] transition-transform"
                >
                  <span>{ob.nextButton}</span>
                  <ArrowRight className="w-5 h-5 shrink-0" strokeWidth={2.6} />
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    aria-label={ob.backButtonLabel}
                    className="w-[58px] h-[58px] rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#4cd386] active:scale-[0.97] transition-transform"
                  >
                    <ArrowLeft className="w-6 h-6 text-[#18181B]" strokeWidth={2.6} />
                  </button>

                  <button
                    type="submit"
                    form="onboarding-family-form"
                    className="flex-1 min-h-[58px] px-6 py-3 rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center text-[19px] sm:text-[20px] font-bold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.99] transition-transform"
                  >
                    {ob.slide3.saveAndStartButton}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full min-h-[54px] px-6 py-2.5 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] text-[18px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAF5F0] active:scale-[0.99] transition-transform"
                >
                  {ob.slide3.skipForNowButton}
                </button>
              </div>
            )}
          </StackedCard>
        </div>
      </div>
    </div>
  );
}
