import { useEffect, useState } from 'react';
import { Users, X } from 'lucide-react';
import type { Language, TrustedFamilyContact } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { countDigits } from '../utils/formatters';

interface FamilyModalProps {
  isOpen: boolean;
  language: Language;
  initialContact: TrustedFamilyContact | null;
  onClose: () => void;
  onSave: (contact: TrustedFamilyContact) => void;
}

export function FamilyModal({
  isOpen,
  language,
  initialContact,
  onClose,
  onSave,
}: FamilyModalProps) {
  const t = TRANSLATIONS[language].familyModal;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialContact?.name ?? '');
      setPhone(initialContact?.phone ?? '');
      setError('');
    }
  }, [isOpen, initialContact]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError(t.nameError);
      return;
    }
    if (countDigits(trimmedPhone) < 7) {
      setError(t.phoneError);
      return;
    }

    onSave({ name: trimmedName, phone: trimmedPhone });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[#18181B]/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-modal-title"
    >
      <div className="w-full max-w-[520px] rounded-[28px] bg-[#FFFFFF] border-2 border-[#18181B] p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EFEAFC] border-2 border-[#18181B] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#8257E5]" strokeWidth={2.2} />
            </div>
            <h2
              id="family-modal-title"
              className="text-[23px] font-bold leading-[31px] text-[#18181B]"
            >
              {t.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelButton}
            className="w-11 h-11 rounded-full border-[1.8px] border-[#18181B] bg-[#FAF5F0] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#EFEAFC]"
          >
            <X className="w-5 h-5 text-[#18181B]" strokeWidth={2.5} />
          </button>
        </div>

        <p className="mt-3 text-[18px] leading-[26px] text-[#52525B]">
          {t.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label
              htmlFor="family-name-input"
              className="block text-[18px] font-bold text-[#18181B] mb-2"
            >
              {t.nameLabel}
            </label>
            <input
              id="family-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder={t.namePlaceholder}
              className="w-full min-h-[54px] px-5 py-3 rounded-full bg-[#EFEAFC] border-[1.6px] border-[#18181B] text-[18px] text-[#18181B] placeholder:text-[#52525B]"
            />
          </div>

          <div>
            <label
              htmlFor="family-phone-input"
              className="block text-[18px] font-bold text-[#18181B] mb-2"
            >
              {t.phoneLabel}
            </label>
            <input
              id="family-phone-input"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError('');
              }}
              placeholder={t.phonePlaceholder}
              className="w-full min-h-[54px] px-5 py-3 rounded-full bg-[#EFEAFC] border-[1.6px] border-[#18181B] text-[18px] text-[#18181B] placeholder:text-[#52525B]"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[18px] bg-[#FEF2F2] border-[1.8px] border-[#DC2626] px-4 py-3 text-[18px] font-semibold text-[#7F1D1D]"
            >
              {error}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 min-h-[58px] px-6 py-3 rounded-full bg-[#5CE094] border-2 border-[#18181B] text-[19px] font-bold text-[#18181B] cursor-pointer hover:bg-[#4cd386] active:scale-[0.99] transition-transform"
            >
              {t.saveButton}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:w-auto min-h-[58px] px-6 py-3 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] text-[19px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAF5F0] active:scale-[0.99] transition-transform"
            >
              {t.cancelButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
