import { ArrowLeft, Check, ShieldCheck, Users } from 'lucide-react';
import type { Language, Screen, TrustedFamilyContact } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { truncateName } from '../utils/formatters';

interface HeaderProps {
  screen: Screen;
  language: Language;
  familyContact: TrustedFamilyContact | null;
  onBackHome: () => void;
  onSelectLanguage: (lang: Language) => void;
  onOpenFamilyModal: () => void;
  onOpenGuide: () => void;
}

const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'zh', label: '中文' },
];

export function Header({
  screen,
  language,
  familyContact,
  onBackHome,
  onSelectLanguage,
  onOpenFamilyModal,
  onOpenGuide,
}: HeaderProps) {
  const t = TRANSLATIONS[language];
  const hasFamily = Boolean(familyContact && familyContact.name.trim());

  return (
    <header className="w-full pt-[18px] pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {screen === 'home' ? (
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#18181B]" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[21px] sm:text-[26px] font-extrabold leading-[28px] sm:leading-[30px] tracking-tight text-[#18181B] truncate">
                {t.brandTitle}
              </h1>
              <p className="text-[14px] sm:text-[16px] font-medium leading-[20px] sm:leading-[22px] text-[#52525B] truncate">
                {t.brandSubtitle}
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2.5 min-h-[54px] pr-1 rounded-full text-left group cursor-pointer active:scale-[0.98] transition-transform min-w-0 flex-1"
          >
            <span className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] rounded-full bg-[#5CE094] border-2 border-[#18181B] flex items-center justify-center shrink-0 group-hover:bg-[#4cd386] transition-colors">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#18181B]" strokeWidth={2.5} />
            </span>
            <span className="text-[17px] sm:text-[20px] font-bold text-[#18181B] truncate">
              {t.backToHome}
            </span>
          </button>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenGuide}
            className="min-h-[48px] px-3 sm:px-3.5 py-2 rounded-full border-2 border-[#18181B] bg-[#FFFFFF] text-[#18181B] hover:bg-[#EFEAFC] flex items-center gap-1 text-[15px] sm:text-[16px] font-bold whitespace-nowrap cursor-pointer transition-colors active:scale-[0.98]"
          >
            <span>{t.guideButton}</span>
          </button>

          <button
            type="button"
            onClick={onOpenFamilyModal}
            className={`min-h-[48px] px-3 sm:px-4 py-2 rounded-full border-2 border-[#18181B] flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors active:scale-[0.98] ${
              hasFamily
                ? 'bg-[#EFEAFC] text-[#18181B] hover:bg-[#e5dbf9]'
                : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#FAF5F0]'
            }`}
            aria-label={hasFamily ? familyContact!.name : t.familyButtonEmpty}
          >
            <Users
              className={`w-5 h-5 shrink-0 ${hasFamily ? 'text-[#8257E5]' : 'text-[#18181B]'}`}
              strokeWidth={2.3}
            />
            <span className="text-[15px] sm:text-[16px] font-bold whitespace-nowrap">
              {hasFamily ? truncateName(familyContact!.name, 8) : t.familyButtonEmpty}
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Pill Language Selector */}
      <div
        role="group"
        aria-label="Language"
        className="mt-4 grid grid-cols-3 gap-2.5"
      >
        {LANGUAGE_OPTIONS.map((opt) => {
          const isActive = language === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => onSelectLanguage(opt.code)}
              aria-pressed={isActive}
              className={`min-h-[48px] px-3 py-2 rounded-full border-2 border-[#18181B] flex items-center justify-center gap-1.5 text-[16px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
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
    </header>
  );
}
