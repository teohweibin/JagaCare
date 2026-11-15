import { useState } from 'react';
import { PhoneCall, ShieldAlert, Smartphone, Share2 } from 'lucide-react';
import type {
  EmergencyScenario,
  Language,
  TrustedFamilyContact,
} from '../types';
import { BANK_HOTLINES, TRANSLATIONS } from '../i18n/translations';
import { buildHijackWarningUrl } from '../utils/formatters';
import { triggerExternalUrl } from './ResultsScreen';

interface EmergencyScreenProps {
  language: Language;
  familyContact: TrustedFamilyContact | null;
  onRequestFamilyContact: () => void;
}

const SCENARIO_ORDER: EmergencyScenario[] = ['money', 'apk', 'otp'];

export function EmergencyScreen({
  language,
  familyContact,
  onRequestFamilyContact,
}: EmergencyScreenProps) {
  const t = TRANSLATIONS[language].emergency;
  const [scenario, setScenario] = useState<EmergencyScenario>('money');

  const activeScenario = t.scenarios[scenario];

  const handleWarnFamily = () => {
    if (!familyContact || !familyContact.phone.trim()) {
      onRequestFamilyContact();
      return;
    }
    const url = buildHijackWarningUrl(familyContact.phone, language);
    triggerExternalUrl(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Red Alert Card */}
      <section className="rounded-[26px] bg-[#FEF2F2] border-2 border-[#DC2626] p-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#DC2626] border-2 border-[#18181B] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7 text-[#FFFFFF]" strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="text-[24px] font-extrabold leading-[31px] text-[#7F1D1D]">
              {t.alertTitle}
            </h2>
            <p className="mt-1 text-[18px] leading-[26px] font-medium text-[#7F1D1D]">
              {t.alertSub}
            </p>
          </div>
        </div>
      </section>

      {/* 3 Pill Scenario Selector Tabs */}
      <div
        role="tablist"
        aria-label={t.alertTitle}
        className="flex flex-col sm:flex-row gap-2.5"
      >
        {SCENARIO_ORDER.map((key) => {
          const isActive = scenario === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setScenario(key)}
              className={`flex-1 min-h-[54px] px-4 py-2.5 rounded-full text-[16px] sm:text-[17px] font-bold cursor-pointer transition-colors active:scale-[0.98] ${
                isActive
                  ? 'bg-[#DC2626] text-[#FFFFFF] border-2 border-[#18181B]'
                  : 'bg-[#FFFFFF] text-[#DC2626] border-2 border-[#DC2626] hover:bg-[#FEF2F2]'
              }`}
            >
              {t.scenarios[key].tabLabel}
            </button>
          );
        })}
      </div>

      {/* Active Scenario Steps Card */}
      <section className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6">
        <ol className="space-y-4">
          {activeScenario.steps.map((step, idx) => (
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

        {scenario === 'money' && (
          <a
            href="tel:997"
            className="mt-6 w-full min-h-[72px] px-6 py-4 rounded-full bg-[#DC2626] border-2 border-[#18181B] flex items-center justify-center gap-3 text-[20px] sm:text-[21px] font-extrabold text-[#FFFFFF] hover:bg-[#b91c1c] active:scale-[0.99] transition-transform"
          >
            <PhoneCall className="w-6 h-6 shrink-0" strokeWidth={2.5} />
            <span>{t.call997Cta}</span>
          </a>
        )}

        {scenario === 'apk' && (
          <div className="mt-6 rounded-[18px] bg-[#FFFBEB] border-[1.8px] border-[#18181B] p-4 flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-[#D97706] shrink-0" strokeWidth={2.3} />
            <span className="text-[17px] font-bold text-[#78350F]">
              {activeScenario.steps[0]}
            </span>
          </div>
        )}

        {scenario === 'otp' && (
          <button
            type="button"
            onClick={handleWarnFamily}
            className="mt-6 w-full min-h-[64px] px-6 py-3.5 rounded-full bg-[#8257E5] border-2 border-[#18181B] flex items-center justify-center gap-3 text-[19px] sm:text-[20px] font-bold text-[#FFFFFF] cursor-pointer hover:bg-[#7446dd] active:scale-[0.99] transition-transform"
          >
            <Share2 className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <span>{t.warnFamilyCta}</span>
          </button>
        )}
      </section>

      {/* Official Malaysian Bank 24/7 Hotlines Card */}
      <section className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6">
        <h3 className="text-[21px] font-extrabold leading-[28px] text-[#18181B]">
          {t.bankHotlinesTitle}
        </h3>
        <p className="mt-1 text-[17px] leading-[24px] text-[#52525B]">
          {t.bankHotlinesSub}
        </p>

        <div className="mt-4 space-y-2.5">
          {BANK_HOTLINES.map((bank) => (
            <a
              key={bank.name}
              href={bank.telHref}
              className="w-full min-h-[54px] px-5 py-3 rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] flex items-center justify-between gap-3 hover:bg-[#e1d7f9] active:scale-[0.99] transition-transform"
            >
              <span className="text-[17px] sm:text-[18px] font-bold text-[#18181B]">
                {bank.name}
              </span>
              <span className="inline-flex items-center gap-2 text-[17px] sm:text-[18px] font-extrabold text-[#8257E5] shrink-0 tabular-nums">
                <PhoneCall className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span>{bank.displayPhone}</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
