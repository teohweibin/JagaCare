import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type {
  AnalysisResult,
  ClaimedIdentity,
  HistoryEntry,
  Language,
  Screen,
  SubmittedInput,
  TrustedFamilyContact,
} from './types';
import { TRANSLATIONS } from './i18n/translations';
import {
  buildHijackWarningUrl,
  buildWhatsAppShareUrl,
  countDigits,
} from './utils/formatters';
import { analyzeDemo, translateDemo } from './utils/demoAnalysis';
import { BackgroundShapes } from './components/BackgroundShapes';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { ResultsScreen, triggerExternalUrl } from './components/ResultsScreen';
import { EmergencyScreen } from './components/EmergencyScreen';
import { FamilyModal } from './components/FamilyModal';
import { OnboardingGuide } from './components/OnboardingGuide';

const STORAGE_LANG_KEY = 'jagacare_language';
const STORAGE_FAMILY_NAME = 'trustedFamilyName';
const STORAGE_FAMILY_PHONE = 'trustedFamilyPhone';
const STORAGE_HISTORY_KEY = 'jagacare_check_history';
const STORAGE_ONBOARDING_KEY = 'hasSeenOnboarding';
const MAX_HISTORY_ITEMS = 25;

function getShouldShowOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_ONBOARDING_KEY) !== 'true';
  } catch {
    return false;
  }
}

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved === 'en' || saved === 'ms' || saved === 'zh') {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'en';
}

function getInitialFamilyContact(): TrustedFamilyContact | null {
  try {
    const name = localStorage.getItem(STORAGE_FAMILY_NAME) || '';
    const phone = localStorage.getItem(STORAGE_FAMILY_PHONE) || '';
    if (name.trim() && phone.trim()) {
      return { name: name.trim(), phone: phone.trim() };
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

function getInitialHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is HistoryEntry =>
          Boolean(
            item &&
              typeof item.id === 'string' &&
              typeof item.checkedAt === 'number' &&
              item.result &&
              typeof item.result.verdict === 'string' &&
              typeof item.result.headline === 'string'
          )
      )
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

function buildInputPreview(input: SubmittedInput): string {
  if (input.type === 'text') {
    const collapsed = (input.text ?? '').replace(/\s+/g, ' ').trim();
    if (collapsed.length <= 100) return collapsed;
    return `${collapsed.slice(0, 100)}…`;
  }
  if (input.type === 'phone') {
    return input.phoneNumber || '';
  }
  if (input.type === 'bank') {
    return input.bankName
      ? `${input.bankAccount || ''} (${input.bankName})`
      : input.bankAccount || '';
  }
  return input.fileName || input.type;
}

export default function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [screen, setScreen] = useState<Screen>('home');
  const [homeTab, setHomeTab] = useState<'message' | 'phone' | 'bank'>('message');
  const [textInput, setTextInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [bankAccountInput, setBankAccountInput] = useState('');
  const [bankNameInput, setBankNameInput] = useState('');
  const [bankError, setBankError] = useState('');
  const [claimedIdentity, setClaimedIdentity] = useState<ClaimedIdentity>('not_sure');

  const [familyContact, setFamilyContact] = useState<TrustedFamilyContact | null>(
    getInitialFamilyContact
  );
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [pendingShareAction, setPendingShareAction] = useState<
    'none' | 'result' | 'hijack'
  >('none');
  const [toastMessage, setToastMessage] = useState('');

  const [submittedInput, setSubmittedInput] = useState<SubmittedInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [resultLang, setResultLang] = useState<Language>(language);
  const [history, setHistory] = useState<HistoryEntry[]>(getInitialHistory);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(getShouldShowOnboarding);

  const abortControllerRef = useRef<AbortController | null>(null);
  const translateAbortRef = useRef<AbortController | null>(null);
  const translateSeqRef = useRef(0);
  const resultCacheRef = useRef<Partial<Record<Language, AnalysisResult>>>({});
  const objectUrlRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const t = TRANSLATIONS[language];

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage('');
    }, 4000);
  }, []);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupObjectUrl();
      abortControllerRef.current?.abort();
      translateAbortRef.current?.abort();
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [cleanupObjectUrl]);

  // Browser back button support
  useEffect(() => {
    const handlePopState = () => {
      abortControllerRef.current?.abort();
      translateAbortRef.current?.abort();
      setIsLoading(false);
      setIsTranslating(false);
      setScreen('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((nextScreen: Screen) => {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (nextScreen !== 'home') {
      window.history.pushState({ screen: nextScreen }, '');
    }
  }, []);

  const handleBackHome = useCallback(() => {
    abortControllerRef.current?.abort();
    translateAbortRef.current?.abort();
    setIsLoading(false);
    setIsTranslating(false);
    setScreen('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setInputError('');
    setPhoneError('');
    setBankError('');

    // If the user picked one of the preset example texts and hasn't edited it,
    // swap the preset text into the newly selected language seamlessly.
    const trimmed = textInput.trim();
    if (trimmed) {
      for (const sourceLang of ['en', 'ms', 'zh'] as const) {
        const matchedIdx = TRANSLATIONS[sourceLang].home.examples.findIndex(
          (ex) => ex.text.trim() === trimmed
        );
        if (matchedIdx !== -1) {
          const nextExample = TRANSLATIONS[lang].home.examples[matchedIdx];
          if (nextExample) {
            setTextInput(nextExample.text);
          }
          break;
        }
      }
    }

    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // ignore storage errors
    }
  };

  const runAnalysis = useCallback(
    async (input: SubmittedInput, langOverride?: Language) => {
      abortControllerRef.current?.abort();
      translateAbortRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      resultCacheRef.current = {};
      setIsTranslating(false);
      setSubmittedInput(input);
      setAnalysisError(null);
      setAnalysisResult(null);
      setIsLoading(true);
      navigateTo('results');

      try {
        const activeLang = langOverride ?? language;
        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(resolve, 650);
          controller.signal.addEventListener('abort', () => {
            window.clearTimeout(timeout);
            reject(new DOMException('Cancelled', 'AbortError'));
          }, { once: true });
        });
        const parsedResult = analyzeDemo(input, activeLang);
        resultCacheRef.current = { [activeLang]: parsedResult };
        setResultLang(activeLang);
        setAnalysisResult(parsedResult);

        const newEntry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          checkedAt: Date.now(),
          language: activeLang,
          inputType: input.type,
          inputPreview: buildInputPreview(input),
          fullText: input.type === 'text' ? (input.text ?? '').slice(0, 2000) : undefined,
          phoneNumber: input.type === 'phone' ? input.phoneNumber : undefined,
          bankAccount: input.type === 'bank' ? input.bankAccount : undefined,
          bankName: input.type === 'bank' ? input.bankName : undefined,
          claimedIdentity:
            input.type === 'phone' || input.type === 'bank'
              ? input.claimedIdentity
              : undefined,
          result: parsedResult,
        };

        setHistory((prev) => {
          const updated = [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS);
          try {
            localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
          } catch {
            // ignore storage errors
          }
          return updated;
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to check this message right now. Please try again.';
        setAnalysisError(message);
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [language, navigateTo]
  );

  const handleCheckText = () => {
    const trimmed = textInput.trim();
    if (!trimmed) {
      setInputError(t.home.emptyTextError);
      return;
    }
    setInputError('');
    cleanupObjectUrl();
    runAnalysis({ type: 'text', text: trimmed });
  };

  const handleCheckPhone = () => {
    const trimmed = phoneInput.trim();
    if (!trimmed) {
      setPhoneError(t.home.phoneEmptyError);
      return;
    }
    if (countDigits(trimmed) < 7) {
      setPhoneError(t.home.phoneInvalidError);
      return;
    }
    setPhoneError('');
    cleanupObjectUrl();
    runAnalysis({
      type: 'phone',
      phoneNumber: trimmed,
      claimedIdentity,
    });
  };

  const handleCheckBank = () => {
    const trimmed = bankAccountInput.trim();
    if (!trimmed) {
      setBankError(t.home.bankEmptyError);
      return;
    }
    if (countDigits(trimmed) < 8) {
      setBankError(t.home.bankInvalidError);
      return;
    }
    setBankError('');
    cleanupObjectUrl();
    runAnalysis({
      type: 'bank',
      bankAccount: trimmed,
      bankName: bankNameInput.trim() || undefined,
      claimedIdentity,
    });
  };

  const handleUseExtractedPhone = (phone: string) => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setPhoneInput(phone);
    setPhoneError('');
    setHomeTab('phone');
    setScreen('home');
    window.setTimeout(() => {
      const el = document.getElementById('phone-checker-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  const handleUploadImage = (file: File) => {
    cleanupObjectUrl();
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    runAnalysis({
      type: 'image',
      imageUrl: previewUrl,
      fileName: file.name,
      rawFile: file,
    });
  };

  const handleUploadAudio = (file: File) => {
    cleanupObjectUrl();
    runAnalysis({
      type: 'audio',
      fileName: file.name,
      rawFile: file,
    });
  };

  const handleCancelLoading = () => {
    abortControllerRef.current?.abort();
    translateAbortRef.current?.abort();
    setIsLoading(false);
    setIsTranslating(false);
    setScreen('home');
  };

  const handleRetry = () => {
    if (submittedInput) {
      runAnalysis(submittedInput);
    } else {
      handleBackHome();
    }
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    abortControllerRef.current?.abort();
    translateAbortRef.current?.abort();
    cleanupObjectUrl();
    setIsLoading(false);
    setIsTranslating(false);
    setAnalysisError(null);
    setSubmittedInput({
      type: entry.inputType,
      text: entry.fullText ?? (entry.inputType === 'text' ? entry.inputPreview : undefined),
      fileName:
        entry.inputType === 'image' || entry.inputType === 'audio'
          ? entry.inputPreview
          : undefined,
      phoneNumber:
        entry.inputType === 'phone'
          ? entry.phoneNumber ?? entry.inputPreview
          : undefined,
      bankAccount:
        entry.inputType === 'bank'
          ? entry.bankAccount ?? entry.inputPreview
          : undefined,
      bankName: entry.inputType === 'bank' ? entry.bankName : undefined,
      claimedIdentity: entry.claimedIdentity,
    });
    resultCacheRef.current = { [entry.language]: entry.result };
    setResultLang(entry.language);
    setAnalysisResult(entry.result);
    navigateTo('results');
  };

  // Automatically translate the active result whenever the user switches UI language
  useEffect(() => {
    if (screen !== 'results' || isLoading || !analysisResult) return;
    if (resultLang === language) {
      setIsTranslating(false);
      return;
    }

    const cached = resultCacheRef.current[language];
    if (cached) {
      translateAbortRef.current?.abort();
      setIsTranslating(false);
      setAnalysisResult(cached);
      setResultLang(language);
      return;
    }

    translateAbortRef.current?.abort();
    const controller = new AbortController();
    translateAbortRef.current = controller;
    const seq = ++translateSeqRef.current;
    const sourceResult = resultCacheRef.current[resultLang] || analysisResult;
    const targetLanguage = language;

    setIsTranslating(true);

    Promise.resolve(translateDemo(sourceResult, targetLanguage))
      .then((translated) => {
        if (controller.signal.aborted || translateSeqRef.current !== seq) return;
        resultCacheRef.current[targetLanguage] = translated;
        setAnalysisResult(translated);
        setResultLang(targetLanguage);
        setIsTranslating(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (translateSeqRef.current !== seq) return;
        setIsTranslating(false);
        showToast(TRANSLATIONS[targetLanguage].results.translateErrorToast);
      });
  }, [screen, isLoading, analysisResult, resultLang, language, showToast]);

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem(STORAGE_ONBOARDING_KEY, 'true');
    } catch {
      // ignore storage errors
    }
  };

  const handleSaveFamilyFromOnboarding = (contact: TrustedFamilyContact) => {
    setFamilyContact(contact);
    try {
      localStorage.setItem(STORAGE_FAMILY_NAME, contact.name);
      localStorage.setItem(STORAGE_FAMILY_PHONE, contact.phone);
      localStorage.setItem(STORAGE_ONBOARDING_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setIsOnboardingOpen(false);
    showToast(t.familyModal.savedToast);
  };

  const handleSaveFamilyContact = (contact: TrustedFamilyContact) => {
    setFamilyContact(contact);
    try {
      localStorage.setItem(STORAGE_FAMILY_NAME, contact.name);
      localStorage.setItem(STORAGE_FAMILY_PHONE, contact.phone);
    } catch {
      // ignore storage errors
    }
    setIsFamilyModalOpen(false);

    if (pendingShareAction === 'result' && analysisResult) {
      setPendingShareAction('none');
      showToast(t.familyModal.sharedToast);
      const url = buildWhatsAppShareUrl(contact.phone, analysisResult, language);
      triggerExternalUrl(url);
    } else if (pendingShareAction === 'hijack') {
      setPendingShareAction('none');
      showToast(t.familyModal.sharedToast);
      const url = buildHijackWarningUrl(contact.phone, language);
      triggerExternalUrl(url);
    } else {
      setPendingShareAction('none');
      showToast(t.familyModal.savedToast);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#18181B] relative">
      <BackgroundShapes />

      <div className="relative z-10 mx-auto max-w-[680px] px-[22px] pb-12">
        <Header
          screen={screen}
          language={language}
          familyContact={familyContact}
          onBackHome={handleBackHome}
          onSelectLanguage={handleSelectLanguage}
          onOpenFamilyModal={() => {
            setPendingShareAction('none');
            setIsFamilyModalOpen(true);
          }}
          onOpenGuide={() => setIsOnboardingOpen(true)}
        />

        <main className="mt-2">
          {screen === 'home' && (
            <HomeScreen
              language={language}
              activeTab={homeTab}
              textInput={textInput}
              inputError={inputError}
              phoneInput={phoneInput}
              phoneError={phoneError}
              bankAccountInput={bankAccountInput}
              bankNameInput={bankNameInput}
              bankError={bankError}
              claimedIdentity={claimedIdentity}
              history={history}
              onChangeTab={setHomeTab}
              onChangeText={setTextInput}
              onSetError={setInputError}
              onChangePhone={setPhoneInput}
              onSetPhoneError={setPhoneError}
              onChangeBankAccount={setBankAccountInput}
              onChangeBankName={setBankNameInput}
              onSetBankError={setBankError}
              onChangeClaimedIdentity={setClaimedIdentity}
              onCheckText={handleCheckText}
              onCheckPhone={handleCheckPhone}
              onCheckBank={handleCheckBank}
              onUseExtractedPhone={handleUseExtractedPhone}
              onUploadImage={handleUploadImage}
              onUploadAudio={handleUploadAudio}
              onOpenEmergency={() => navigateTo('emergency')}
              onSelectHistory={handleSelectHistory}
              onClearHistory={handleClearHistory}
            />
          )}

          {screen === 'results' && (
            <ResultsScreen
              language={language}
              isLoading={isLoading}
              isTranslating={isTranslating}
              error={analysisError}
              result={analysisResult}
              submittedInput={submittedInput}
              familyContact={familyContact}
              history={history}
              onCancelLoading={handleCancelLoading}
              onRetry={handleRetry}
              onCheckAnother={handleBackHome}
              onOpenEmergency={() => navigateTo('emergency')}
              onRequestFamilyContact={() => {
                setPendingShareAction('result');
                setIsFamilyModalOpen(true);
              }}
              onShowToast={showToast}
              onCheckExtractedPhone={handleUseExtractedPhone}
            />
          )}

          {screen === 'emergency' && (
            <EmergencyScreen
              language={language}
              familyContact={familyContact}
              onRequestFamilyContact={() => {
                setPendingShareAction('hijack');
                setIsFamilyModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      <FamilyModal
        isOpen={isFamilyModalOpen}
        language={language}
        initialContact={familyContact}
        onClose={() => {
          setPendingShareAction('none');
          setIsFamilyModalOpen(false);
        }}
        onSave={handleSaveFamilyContact}
      />

      <OnboardingGuide
        isOpen={isOnboardingOpen}
        language={language}
        initialContact={familyContact}
        onSelectLanguage={handleSelectLanguage}
        onSaveFamilyAndFinish={handleSaveFamilyFromOnboarding}
        onClose={handleCloseOnboarding}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-44px)] max-w-[540px] rounded-full bg-[#5CE094] border-2 border-[#18181B] px-5 py-3.5 flex items-center gap-3 text-[17px] font-bold text-[#18181B]"
        >
          <CheckCircle2 className="w-6 h-6 shrink-0" strokeWidth={2.5} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
