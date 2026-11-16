import type { Language } from '../types';

export interface ExampleItem {
  id: string;
  label: string;
  text: string;
}

export interface EmergencyScenarioContent {
  tabLabel: string;
  steps: string[];
}

export interface BankHotline {
  name: string;
  displayPhone: string;
  telHref: string;
}

export interface PortalInfo {
  id: 'semak_mule' | 'poslaju' | 'jnt' | 'bnm';
  label: string;
  url: string;
}

export interface TranslationBundle {
  brandTitle: string;
  brandSubtitle: string;
  backToHome: string;
  guideButton: string;
  familyButtonEmpty: string;
  speechLocale: string;
  hero: {
    title: string;
    subtitle: string;
  };
  home: {
    uploadPhotoTitle: string;
    uploadPhotoSub: string;
    pasteSectionTitle: string;
    pasteButton: string;
    clearButton: string;
    textareaPlaceholder: string;
    emptyTextError: string;
    clipboardError: string;
    checkMessageButton: string;
    uploadAudioButton: string;
    audioTooLargeError: string;
    imageTooLargeError: string;
    tryExampleLabel: string;
    examples: ExampleItem[];
    emergencyTitle: string;
    emergencySub: string;
    recentChecksTitle: string;
    recentChecksClear: string;
    recentChecksEmpty: string;
    verdictLabels: {
      STOP: string;
      WAIT: string;
      SAFE: string;
    };
    inputTypeLabels: {
      text: string;
      image: string;
      audio: string;
      phone: string;
      bank: string;
    };
    tabMessage: string;
    tabPhone: string;
    tabBank: string;
    phoneInputLabel: string;
    phoneInputPlaceholder: string;
    phoneEmptyError: string;
    phoneInvalidError: string;
    claimedByLabel: string;
    claimedOptions: {
      bank: string;
      police_gov: string;
      courier: string;
      family: string;
      seller: string;
      not_sure: string;
    };
    checkPhoneButton: string;
    tryTestPhoneLabel: string;
    bankInputLabel: string;
    bankInputPlaceholder: string;
    bankEmptyError: string;
    bankInvalidError: string;
    bankNameLabel: string;
    bankClaimedByLabel: string;
    checkBankButton: string;
    tryTestBankLabel: string;
    extractedFoundLabel: string;
    checkExtractedPrefix: string;
  };
  familyModal: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    nameError: string;
    phoneError: string;
    saveButton: string;
    cancelButton: string;
    savedToast: string;
    sharedToast: string;
  };
  results: {
    loadingTitle: string;
    loadingSub: string;
    cancelButton: string;
    errorTitle: string;
    tryAgainButton: string;
    checkingAudioPrefix: string;
    checkingImagePrefix: string;
    checkingPhonePrefix: string;
    checkingBankPrefix: string;
    extractedNumberTitle: string;
    checkExtractedButtonPrefix: string;
    copySemakMuleButton: string;
    copiedSemakMuleToast: string;
    copyPenipuMyButton: string;
    copiedPenipuMyToast: string;
    truecallerButton: string;
    dbSummaryTitle: string;
    dbPoliceReports: string;
    dbCommunityReports: string;
    dbBnmAlert: string;
    dbBnmYes: string;
    dbSpoofingBadge: string;
    dbZeroReportsNote: string;
    dbUnavailableNote: string;
    localFlagBadgeTitle: string;
    markAsScamButton: string;
    markScamCardTitle: string;
    markScamQuickReasons: string[];
    markScamReasonPlaceholder: string;
    markScamSaveButton: string;
    markScamCancelButton: string;
    markScamSavedToast: string;
    removeLocalFlagButton: string;
    removeLocalFlagToast: string;
    phoneVerdictBanner: {
      reportsFound: string;
      suspiciousFound: string;
      noReportsFound: string;
    };
    bankVerdictBanner: {
      reportsFound: string;
      suspiciousFound: string;
      noReportsFound: string;
    };
    verdictBanner: {
      STOP: string;
      WAIT: string;
      SAFE: string;
    };
    readAloudButton: string;
    stopReadingButton: string;
    speechUnsupported: string;
    translatingBanner: string;
    translateErrorToast: string;
    whyRiskyTitle: string;
    whatCheckedTitle: string;
    safeStepsTitle: string;
    portalsTitle: string;
    sendToFamilyButton: string;
    checkAnotherButton: string;
    emergencyButton: string;
    portals: Record<PortalInfo['id'], string>;
    whatsappSharePrefix: string;
    whatsappShareWarningsTitle: string;
    copyResultButton: string;
    copiedResultToast: string;
    trends: {
      title: string;
      checksUnitSingular: string;
      checksUnitPlural: string;
      flaggedRiskySuffix: string;
      emptyText: string;
      footerNote: string;
      chartAriaLabel: string;
      categories: {
        impersonation: string;
        phishing: string;
        investment: string;
        payment: string;
        safe: string;
        other: string;
      };
    };
  };
  emergency: {
    alertTitle: string;
    alertSub: string;
    scenarios: {
      money: EmergencyScenarioContent;
      apk: EmergencyScenarioContent;
      otp: EmergencyScenarioContent;
    };
    call997Cta: string;
    warnFamilyCta: string;
    hijackWarningMessage: string;
    bankHotlinesTitle: string;
    bankHotlinesSub: string;
  };
  onboarding: {
    skipButton: string;
    readAloudButton: string;
    stopReadingButton: string;
    backButtonLabel: string;
    nextButton: string;
    slide1: {
      title: string;
      message: string;
      channelsLabel: string;
    };
    slide2: {
      title: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
      tip: string;
    };
    slide3: {
      title: string;
      subtitle: string;
      homeScreenTip: string;
      saveAndStartButton: string;
      skipForNowButton: string;
    };
  };
}

export const BANK_HOTLINES: BankHotline[] = [
  { name: 'Maybank 24/7 Fraud', displayPhone: '1300-88-6688', telHref: 'tel:1300886688' },
  { name: 'CIMB Fraud Hotline', displayPhone: '03-6204-7788', telHref: 'tel:0362047788' },
  { name: 'Public Bank Hotline', displayPhone: '03-2177-3555', telHref: 'tel:0321773555' },
  { name: 'RHB Customer Care', displayPhone: '03-9206-8118', telHref: 'tel:0392068118' },
  { name: 'Hong Leong Bank', displayPhone: '03-7626-8899', telHref: 'tel:0376268899' },
  { name: 'AmBank Contact Centre', displayPhone: '03-2178-8888', telHref: 'tel:0321788888' },
  { name: 'Bank Islam Hotline', displayPhone: '03-2690-0900', telHref: 'tel:0326900900' },
];

export const PORTAL_URLS: Record<PortalInfo['id'], string> = {
  semak_mule: 'https://semakmule.rmp.gov.my',
  poslaju: 'https://tracking.pos.com.my',
  jnt: 'https://www.jtexpress.my/tracking',
  bnm: 'https://www.bnm.gov.my/scam-alert',
};

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en: {
    brandTitle: 'JagaCare',
    brandSubtitle: 'Calm scam checker for seniors',
    backToHome: 'Back to Home',
    guideButton: '❓ Guide',
    familyButtonEmpty: 'Family',
    speechLocale: 'en-MY',
    hero: {
      title: 'Unsure about a message?',
      subtitle: 'Check WhatsApp, Telegram, SMS, or voice notes before you reply, click, or pay.',
    },
    home: {
      uploadPhotoTitle: 'Upload Screenshot or Photo',
      uploadPhotoSub: 'Chat screenshots, letters, QR codes, or receipts',
      pasteSectionTitle: 'Paste Message Text',
      pasteButton: 'Paste',
      clearButton: 'Clear',
      textareaPlaceholder: 'Paste the suspicious WhatsApp, Telegram, or SMS message here...',
      emptyTextError: 'Please paste or type a message first before checking.',
      clipboardError: 'Could not read your clipboard automatically. Please tap inside the box and paste.',
      checkMessageButton: 'Check Message',
      uploadAudioButton: 'Upload Voice Note / Audio',
      audioTooLargeError: 'This audio file is too large. Please choose a file smaller than 18MB.',
      imageTooLargeError: 'This photo is too large. Please choose an image smaller than 20MB.',
      tryExampleLabel: 'Try an example:',
      examples: [
        {
          id: 'bank',
          label: 'Fake Bank SMS',
          text: 'RM0.00 MAYBANK: Your MAE account is suspended due to suspicious transaction RM2,450.00. Verify within 2 hours at http://maybank2u-verify-my.com or funds will be frozen.',
        },
        {
          id: 'job',
          label: 'Telegram Job Scam',
          text: 'Hi! Join our Telegram VIP part-time task team. Just like 3 TikTok videos and get RM50 instant Touch n Go transfer! Upgrade RM300 VIP task to earn RM1,200 daily guaranteed! Contact @HR_Jason88 now.',
        },
        {
          id: 'safe',
          label: 'Safe Family Message',
          text: 'Hi Ma, I just reached KL safely. Remember to take your afternoon medicine and drink more water. I will bring dinner back at 6:30pm!',
        },
      ],
      emergencyTitle: 'Help! I Already Paid or Clicked a Link',
      emergencySub: 'Calm step-by-step rescue & 997 hotline',
      recentChecksTitle: 'Recent Checks (Last 5)',
      recentChecksClear: 'Clear',
      recentChecksEmpty: 'No checks yet. Your last 5 message checks will be saved here so you can view them again anytime.',
      verdictLabels: {
        STOP: 'STOP',
        WAIT: 'WAIT',
        SAFE: 'SAFE',
      },
      inputTypeLabels: {
        text: 'Message',
        image: 'Photo',
        audio: 'Voice Note',
        phone: 'Phone Number',
        bank: 'Bank Account',
      },
      tabMessage: '💬 Check Message',
      tabPhone: '📞 Check Phone',
      tabBank: '🏦 Check Bank Account',
      phoneInputLabel: 'Enter Phone Number',
      phoneInputPlaceholder: 'e.g., 012-3456789 or +6011...',
      phoneEmptyError: 'Please type or paste a phone number first.',
      phoneInvalidError: 'Please enter a valid phone number (at least 7 digits).',
      claimedByLabel: 'Who do they claim to be?',
      claimedOptions: {
        bank: 'Bank',
        police_gov: 'Police / Gov / LHDN / MCMC',
        courier: 'Courier / Parcel',
        family: 'Friend / Family',
        seller: 'Online Seller / Stranger',
        not_sure: 'Not Sure',
      },
      checkPhoneButton: 'Check This Number',
      tryTestPhoneLabel: 'Try test scam number:',
      bankInputLabel: 'Enter Bank Account Number',
      bankInputPlaceholder: 'e.g., 1122 3344 5566 or 5140...',
      bankEmptyError: 'Please type or paste a bank account number first.',
      bankInvalidError: 'Please enter a valid bank account number (at least 8 digits).',
      bankNameLabel: 'Which bank? (Optional)',
      bankClaimedByLabel: 'Who asked you to transfer to this account?',
      checkBankButton: 'Check This Bank Account',
      tryTestBankLabel: 'Try test scam account:',
      extractedFoundLabel: 'Phone number found in message:',
      checkExtractedPrefix: 'Check extracted number:',
    },
    familyModal: {
      title: 'Trusted Family Member',
      subtitle: 'Save a trusted family member so you can send suspicious messages to them in one tap.',
      nameLabel: "Family Member's Name",
      namePlaceholder: 'e.g., Mei Ling / Ah Boy',
      phoneLabel: 'WhatsApp Phone Number',
      phonePlaceholder: 'e.g., 012-345 6789',
      nameError: 'Please enter your family member’s name.',
      phoneError: 'Please enter a valid phone number with at least 7 digits.',
      saveButton: 'Save Contact',
      cancelButton: 'Cancel',
      savedToast: 'Trusted family contact saved!',
      sharedToast: 'Contact saved! Opening WhatsApp to share with your family member.',
    },
    results: {
      loadingTitle: 'Checking safely for you...',
      loadingSub: 'Please wait a moment. Do not reply or click anything yet.',
      cancelButton: 'Cancel',
      errorTitle: 'Could not complete check',
      tryAgainButton: 'Try Again',
      checkingAudioPrefix: 'Checking audio:',
      checkingImagePrefix: 'Checked photo:',
      checkingPhonePrefix: 'Checking phone number:',
      checkingBankPrefix: 'Checking bank account:',
      extractedNumberTitle: 'Phone number found in this message',
      checkExtractedButtonPrefix: '📞 Check extracted number:',
      copySemakMuleButton: '📋 Copy & Check on PDRM Semak Mule',
      copiedSemakMuleToast: 'Copied! Paste it into Semak Mule to check police reports',
      copyPenipuMyButton: '📋 Copy & Check on Penipu.my',
      copiedPenipuMyToast: 'Copied! Paste it into Penipu.my to check community reports',
      truecallerButton: '🔍 Check on Truecaller Scam Checker',
      dbSummaryTitle: 'Database Check Summary',
      dbPoliceReports: 'Police Reports:',
      dbCommunityReports: 'Community Reports:',
      dbBnmAlert: 'BNM Alert:',
      dbBnmYes: 'Yes',
      dbSpoofingBadge: 'Official Number Often Faked',
      dbZeroReportsNote: '0 reports found yet — still be careful, scammers constantly switch SIM cards.',
      dbUnavailableNote: '',
      localFlagBadgeTitle: '⚠️ Previously Flagged as Suspicious on This Device',
      markAsScamButton: '🚩 Mark This Number/Account as Scam',
      markScamCardTitle: 'Save a local warning on this device',
      markScamQuickReasons: [
        'Fake Police / Bank Call',
        'Asked for Money / OTP',
        'Fake Online Seller / Parcel',
      ],
      markScamReasonPlaceholder: 'Short note (e.g., Pretended to be LHDN)',
      markScamSaveButton: 'Save Warning on This Device',
      markScamCancelButton: 'Cancel',
      markScamSavedToast: 'Saved warning on this device so you stay protected next time!',
      removeLocalFlagButton: 'Remove local warning',
      removeLocalFlagToast: 'Local warning removed.',
      phoneVerdictBanner: {
        reportsFound: '🛑 STOP — Scam Reports Found. Do NOT reply, answer, or pay.',
        suspiciousFound: '⚠️ WAIT — Suspicious Reports Found. Check safely first.',
        noReportsFound: 'WAIT — No Reports Found Yet. Still Be Careful.',
      },
      bankVerdictBanner: {
        reportsFound: '🛑 STOP — Scam Reports Found for This Bank Account. Do NOT transfer money.',
        suspiciousFound: '⚠️ WAIT — Suspicious Reports Found for This Account. Check safely first.',
        noReportsFound: 'WAIT — No Reports Found Yet. Verify Carefully Before Transferring.',
      },
      verdictBanner: {
        STOP: 'STOP — Likely a Scam. Do NOT reply, click, or pay.',
        WAIT: 'WAIT — Looks Suspicious. Check safely first.',
        SAFE: 'NO OBVIOUS DANGER — Still never share OTP codes or transfer money to strangers.',
      },
      readAloudButton: 'Read This Aloud',
      stopReadingButton: 'Stop Reading',
      speechUnsupported: 'Voice reading is not supported on this browser.',
      translatingBanner: 'Translating result into English…',
      translateErrorToast: 'Could not translate this result right now. Please try again.',
      whyRiskyTitle: 'Why This Looks Risky',
      whatCheckedTitle: 'What We Checked',
      safeStepsTitle: 'How to Check Safely Before Acting',
      portalsTitle: 'Official Safe Check Portals',
      sendToFamilyButton: 'Send to Family to Double-Check',
      checkAnotherButton: 'Check Another Message',
      emergencyButton: 'Help! I Already Paid or Clicked a Link',
      portals: {
        semak_mule: 'PDRM Semak Mule',
        poslaju: 'Official PosLaju Tracker',
        jnt: 'Official J&T Express Tracker',
        bnm: 'Bank Negara Scam Alert',
      },
      whatsappSharePrefix: 'JagaCare Scam Check',
      whatsappShareWarningsTitle: 'Warning signs spotted:',
      copyResultButton: '📋 Copy Result Summary',
      copiedResultToast: 'Result copied to clipboard! Ready to paste into notes or chat.',
      trends: {
        title: 'Scam Detection Trends',
        checksUnitSingular: 'local check',
        checksUnitPlural: 'local checks',
        flaggedRiskySuffix: 'flagged STOP or WAIT',
        emptyText: 'Your check history is empty. Run checks to see your personal scam category trends here.',
        footerNote: 'Calculated privately from your saved local check history on this device.',
        chartAriaLabel: 'Bar chart showing the distribution of scam types from your local check history',
        categories: {
          impersonation: 'Impersonation',
          phishing: 'Phishing & Fake Links',
          investment: 'Investment & Job Scams',
          payment: 'Mule & Seller Risk',
          safe: 'Safe / No Threat',
          other: 'Other Suspicious',
        },
      },
    },
    emergency: {
      alertTitle: 'Calm Rescue Guide',
      alertSub: 'Take a deep breath. Follow these clear steps right now.',
      scenarios: {
        money: {
          tabLabel: 'Sent Money / Bank Info',
          steps: [
            "Call your bank's 24/7 Fraud Hotline using the official numbers below (never use phone numbers from the scam message).",
            "Call Malaysia's National Scam Response Centre (NSRC) at 997 immediately (open 24/7).",
            'Take screenshots of all chat messages, phone numbers, and transfer receipts for a police report.',
          ],
        },
        apk: {
          tabLabel: 'Installed App / .APK',
          steps: [
            'Turn OFF Wi-Fi and Mobile Data immediately (turn on Airplane Mode).',
            'Do NOT open any banking or eWallet apps on this phone.',
            'Ask a trusted family member to help remove the unknown app or reset the phone, and call your bank from a different phone.',
          ],
        },
        otp: {
          tabLabel: 'Shared OTP / WhatsApp',
          steps: [
            'Call your bank immediately to freeze online access and protect your savings.',
            'Warn your family and friends right away that your WhatsApp or Telegram may be hijacked.',
            'Never share another 6-digit code with anyone, even if they claim to be from a bank or friend.',
          ],
        },
      },
      call997Cta: 'Call NSRC 997 Now (24/7)',
      warnFamilyCta: 'Warn Family About Account Hijack',
      hijackWarningMessage:
        'URGENT: My WhatsApp or Telegram may have been hijacked. Please ignore any messages asking for money or OTP codes from my account until I call you.',
      bankHotlinesTitle: 'Official Malaysian Bank 24/7 Hotlines',
      bankHotlinesSub: 'Tap any number below to call directly',
    },
    onboarding: {
      skipButton: 'Skip',
      readAloudButton: '🔊 Read Aloud',
      stopReadingButton: 'Stop Reading',
      backButtonLabel: 'Back',
      nextButton: 'Next',
      slide1: {
        title: 'Check Before You Act',
        message:
          "Got a worrying WhatsApp, Telegram, or SMS message? Don't rush. Check it here safely before clicking links, replying, or transferring money.",
        channelsLabel: 'Works for WhatsApp, Telegram & SMS',
      },
      slide2: {
        title: '2 Easy Ways to Check',
        card1Title: '📷 Easiest: Take a Screenshot',
        card1Desc: 'Take a screenshot of the chat or fake letter and upload it here.',
        card2Title: '📋 Or Paste Text / Voice Note',
        card2Desc: 'Copy the message text or upload a suspicious voice note.',
        tip: 'Tip: Tap 🔊 Read Aloud on any result if you prefer listening instead of reading.',
      },
      slide3: {
        title: 'Set Up Your Safety Net (Optional)',
        subtitle:
          'Save a trusted family member now so you can ask them to double-check suspicious messages in one tap.',
        homeScreenTip:
          "📱 Tip: Save this app to your phone's Home Screen (tap your browser menu ⋮ or Share icon → 'Add to Home Screen') so it's always easy to find next to WhatsApp!",
        saveAndStartButton: 'Save & Start Checking',
        skipForNowButton: 'Skip for Now',
      },
    },
  },
  ms: {
    brandTitle: 'JagaCare',
    brandSubtitle: 'Penyemak penipuan untuk warga emas',
    backToHome: 'Kembali ke Laman Utama',
    guideButton: '❓ Panduan',
    familyButtonEmpty: 'Keluarga',
    speechLocale: 'ms-MY',
    hero: {
      title: 'Ragu-ragu tentang mesej?',
      subtitle: 'Semak WhatsApp, Telegram, SMS, atau rakaman suara sebelum anda balas, tekan pautan, atau bayar.',
    },
    home: {
      uploadPhotoTitle: 'Muat Naik Tangkapan Skrin atau Gambar',
      uploadPhotoSub: 'Tangkapan skrin sembang, surat, kod QR, atau resit',
      pasteSectionTitle: 'Tampal Teks Mesej',
      pasteButton: 'Tampal',
      clearButton: 'Padam',
      textareaPlaceholder: 'Tampal mesej WhatsApp, Telegram, atau SMS yang mencurigakan di sini...',
      emptyTextError: 'Sila tampal atau taip mesej terlebih dahulu sebelum menyemak.',
      clipboardError: 'Tidak dapat membaca papan keratan secara automatik. Sila tekan kotak dan tampal.',
      checkMessageButton: 'Semak Mesej',
      uploadAudioButton: 'Muat Naik Nota Suara / Audio',
      audioTooLargeError: 'Fail audio ini terlalu besar. Sila pilih fail yang kurang daripada 18MB.',
      imageTooLargeError: 'Gambar ini terlalu besar. Sila pilih gambar yang kurang daripada 20MB.',
      tryExampleLabel: 'Cuba contoh:',
      examples: [
        {
          id: 'bank',
          label: 'SMS Bank Palsu',
          text: 'RM0.00 MAYBANK: Akaun MAE anda telah digantung kerana transaksi mencurigakan RM2,450.00. Sahkan dalam masa 2 jam di http://maybank2u-verify-my.com atau wang anda akan dibekukan.',
        },
        {
          id: 'job',
          label: 'Penipuan Kerja Telegram',
          text: 'Hai! Sertai pasukan tugasan sambilan VIP Telegram kami. Cuma like 3 video TikTok dan dapat bayaran segera RM50 ke Touch n Go! Naik taraf tugasan VIP RM300 untuk jana RM1,200 sehari dijamin! Hubungi @HR_Jason88 sekarang.',
        },
        {
          id: 'safe',
          label: 'Mesej Keluarga Selamat',
          text: 'Hai Mak, saya baru sampai di KL dengan selamat. Ingat makan ubat petang dan minum banyak air ya. Nanti saya bawa balik makan malam pukul 6:30 petang!',
        },
      ],
      emergencyTitle: 'Tolong! Saya Sudah Bayar atau Tekan Pautan',
      emergencySub: 'Panduan penyelamatan tenang & talian 997',
      recentChecksTitle: 'Semakan Terkini (5 Terakhir)',
      recentChecksClear: 'Padam',
      recentChecksEmpty: 'Belum ada semakan lagi. 5 semakan mesej terakhir anda akan disimpan di sini supaya anda boleh melihatnya semula bila-bila masa.',
      verdictLabels: {
        STOP: 'BERHENTI',
        WAIT: 'TUNGGU',
        SAFE: 'SELAMAT',
      },
      inputTypeLabels: {
        text: 'Mesej',
        image: 'Gambar',
        audio: 'Nota Suara',
        phone: 'Nombor Telefon',
        bank: 'Akaun Bank',
      },
      tabMessage: '💬 Semak Mesej',
      tabPhone: '📞 Semak Telefon',
      tabBank: '🏦 Semak Akaun Bank',
      phoneInputLabel: 'Masukkan Nombor Telefon',
      phoneInputPlaceholder: 'cth., 012-3456789 atau +6011...',
      phoneEmptyError: 'Sila taip atau tampal nombor telefon dahulu.',
      phoneInvalidError: 'Sila masukkan nombor telefon yang sah (sekurang-kurangnya 7 digit).',
      claimedByLabel: 'Mereka mengaku sebagai siapa?',
      claimedOptions: {
        bank: 'Bank',
        police_gov: 'Polis / Kerajaan / LHDN / MCMC',
        courier: 'Kurier / Bungkusan',
        family: 'Kawan / Keluarga',
        seller: 'Penjual Online / Orang Asing',
        not_sure: 'Tidak Pasti',
      },
      checkPhoneButton: 'Semak Nombor Ini',
      tryTestPhoneLabel: 'Cuba nombor ujian penipu:',
      bankInputLabel: 'Masukkan Nombor Akaun Bank',
      bankInputPlaceholder: 'cth., 1122 3344 5566 atau 5140...',
      bankEmptyError: 'Sila taip atau tampal nombor akaun bank dahulu.',
      bankInvalidError: 'Sila masukkan nombor akaun bank yang sah (sekurang-kurangnya 8 digit).',
      bankNameLabel: 'Bank mana? (Pilihan)',
      bankClaimedByLabel: 'Siapa yang meminta anda pindahkan wang ke akaun ini?',
      checkBankButton: 'Semak Akaun Bank Ini',
      tryTestBankLabel: 'Cuba akaun ujian penipu:',
      extractedFoundLabel: 'Nombor telefon dikesan dalam mesej:',
      checkExtractedPrefix: 'Semak nombor dikesan:',
    },
    familyModal: {
      title: 'Ahli Keluarga Dipercayai',
      subtitle: 'Simpan nombor ahli keluarga supaya anda boleh hantar mesej mencurigakan kepada mereka dengan satu tekan.',
      nameLabel: 'Nama Ahli Keluarga',
      namePlaceholder: 'cth., Mei Ling / Ah Boy',
      phoneLabel: 'Nombor Telefon WhatsApp',
      phonePlaceholder: 'cth., 012-345 6789',
      nameError: 'Sila masukkan nama ahli keluarga anda.',
      phoneError: 'Sila masukkan nombor telefon yang sah (sekurang-kurangnya 7 digit).',
      saveButton: 'Simpan Kenalan',
      cancelButton: 'Batal',
      savedToast: 'Kenalan keluarga dipercayai telah disimpan!',
      sharedToast: 'Kenalan disimpan! Membuka WhatsApp untuk berkongsi dengan keluarga anda.',
    },
    results: {
      loadingTitle: 'Sedang menyemak dengan selamat...',
      loadingSub: 'Sila tunggu sebentar. Jangan balas atau tekan apa-apa lagi.',
      cancelButton: 'Batal',
      errorTitle: 'Tidak dapat melengkapkan semakan',
      tryAgainButton: 'Cuba Lagi',
      checkingAudioPrefix: 'Menyemak audio:',
      checkingImagePrefix: 'Gambar disemak:',
      checkingPhonePrefix: 'Menyemak nombor telefon:',
      checkingBankPrefix: 'Menyemak akaun bank:',
      extractedNumberTitle: 'Nombor telefon dikesan dalam mesej ini',
      checkExtractedButtonPrefix: '📞 Semak nombor dikesan:',
      copySemakMuleButton: '📋 Salin & Semak di PDRM Semak Mule',
      copiedSemakMuleToast: 'Disalin! Tampal ke Semak Mule untuk semak laporan polis',
      copyPenipuMyButton: '📋 Salin & Semak di Penipu.my',
      copiedPenipuMyToast: 'Disalin! Tampal ke Penipu.my untuk semak laporan komuniti',
      truecallerButton: '🔍 Semak di Truecaller Scam Checker',
      dbSummaryTitle: 'Ringkasan Semakan Pangkalan Data',
      dbPoliceReports: 'Laporan Polis:',
      dbCommunityReports: 'Laporan Komuniti:',
      dbBnmAlert: 'Amaran BNM:',
      dbBnmYes: 'Ya',
      dbSpoofingBadge: 'Nombor Rasmi Sering Dipalsukan',
      dbZeroReportsNote: '0 laporan ditemui setakat ini — tetap berhati-hati kerana penipu sering tukar kad SIM baharu.',
      dbUnavailableNote: '',
      localFlagBadgeTitle: '⚠️ Pernah Ditanda Mencurigakan pada Peranti Ini',
      markAsScamButton: '🚩 Tandakan Nombor/Akaun Ini Sebagai Penipu',
      markScamCardTitle: 'Simpan amaran setempat pada peranti ini',
      markScamQuickReasons: [
        'Panggilan Polis / Bank Palsu',
        'Minta Wang / Kod OTP',
        'Penjual Online / Bungkusan Palsu',
      ],
      markScamReasonPlaceholder: 'Nota ringkas (cth., Mengaku dari LHDN)',
      markScamSaveButton: 'Simpan Amaran pada Peranti Ini',
      markScamCancelButton: 'Batal',
      markScamSavedToast: 'Amaran disimpan pada peranti ini supaya anda dilindungi lain kali!',
      removeLocalFlagButton: 'Buang amaran setempat',
      removeLocalFlagToast: 'Amaran setempat dibuang.',
      phoneVerdictBanner: {
        reportsFound: '🛑 BERHENTI — Laporan Penipuan Ditemui. JANGAN balas, jawab, atau bayar.',
        suspiciousFound: '⚠️ TUNGGU — Laporan Mencurigakan Ditemui. Semak dengan selamat dahulu.',
        noReportsFound: 'TUNGGU — Tiada Laporan Ditemui Setakat Ini. Tetap Berhati-hati.',
      },
      bankVerdictBanner: {
        reportsFound: '🛑 BERHENTI — Laporan Penipuan Ditemui untuk Akaun Bank Ini. JANGAN pindah wang.',
        suspiciousFound: '⚠️ TUNGGU — Laporan Mencurigakan Ditemui untuk Akaun Ini. Semak dahulu.',
        noReportsFound: 'TUNGGU — Tiada Laporan Ditemui Setakat Ini. Sahkan Sebelum Pindah Wang.',
      },
      verdictBanner: {
        STOP: 'BERHENTI — Kemungkinan Penipuan. JANGAN balas, tekan pautan, atau bayar.',
        WAIT: 'TUNGGU — Kelihatan Mencurigakan. Semak dengan selamat dahulu.',
        SAFE: 'TIADA BAHAYA KETARA — Tetap jangan kongsi kod OTP atau pindah wang kepada orang tidak dikenali.',
      },
      readAloudButton: 'Bacakan Dengan Kuat',
      stopReadingButton: 'Berhenti Membaca',
      speechUnsupported: 'Bacaan suara tidak disokong pada pelayar ini.',
      translatingBanner: 'Sedang menterjemah keputusan ke Bahasa Melayu…',
      translateErrorToast: 'Tidak dapat menterjemah keputusan ini buat masa ini. Sila cuba lagi.',
      whyRiskyTitle: 'Mengapa Ini Kelihatan Berisiko',
      whatCheckedTitle: 'Apa Yang Kami Semak',
      safeStepsTitle: 'Cara Semak Dengan Selamat Sebelum Bertindak',
      portalsTitle: 'Portal Semakan Rasmi',
      sendToFamilyButton: 'Hantar Kepada Keluarga Untuk Semakan',
      checkAnotherButton: 'Semak Mesej Lain',
      emergencyButton: 'Tolong! Saya Sudah Bayar atau Tekan Pautan',
      portals: {
        semak_mule: 'PDRM Semak Mule',
        poslaju: 'Penjejak Rasmi PosLaju',
        jnt: 'Penjejak Rasmi J&T Express',
        bnm: 'Amaran Penipuan Bank Negara',
      },
      whatsappSharePrefix: 'Semakan Penipuan JagaCare',
      whatsappShareWarningsTitle: 'Tanda amaran yang dikesan:',
      copyResultButton: '📋 Salin Ringkasan Keputusan',
      copiedResultToast: 'Keputusan disalin ke papan keratan! Sedia untuk ditampal ke nota atau chat.',
      trends: {
        title: 'Trend Pengesanan Penipuan',
        checksUnitSingular: 'semakan setempat',
        checksUnitPlural: 'semakan setempat',
        flaggedRiskySuffix: 'ditanda BERHENTI atau TUNGGU',
        emptyText: 'Sejarah semakan anda kosong. Jalankan semakan untuk melihat pecahan jenis penipuan anda di sini.',
        footerNote: 'Dikira secara peribadi daripada sejarah semakan pada peranti ini sahaja.',
        chartAriaLabel: 'Carta bar menunjukkan pecahan jenis penipuan daripada sejarah semakan anda',
        categories: {
          impersonation: 'Penyamaran',
          phishing: 'Pancingan & Pautan Palsu',
          investment: 'Pelaburan & Kerja Palsu',
          payment: 'Akaun Keldai & Penjual',
          safe: 'Selamat / Tiada Bahaya',
          other: 'Risiko Lain',
        },
      },
    },
    emergency: {
      alertTitle: 'Panduan Penyelamatan Tenang',
      alertSub: 'Tarik nafas dalam-dalam. Ikuti langkah jelas ini sekarang.',
      scenarios: {
        money: {
          tabLabel: 'Hantar Wang / Maklumat Bank',
          steps: [
            'Hubungi Talian Penipuan 24/7 bank anda menggunakan nombor rasmi di bawah (jangan guna nombor dari mesej penipu).',
            'Hubungi Pusat Respons Penipuan Kebangsaan (NSRC) di talian 997 dengan segera (24/7).',
            'Simpan tangkapan skrin semua mesej sembang, nombor telefon, dan resit pemindahan wang untuk laporan polis.',
          ],
        },
        apk: {
          tabLabel: 'Pasang Aplikasi / .APK',
          steps: [
            'MATIKAN Wi-Fi dan Data Mudah Alih dengan segera (aktifkan Mod Pesawat / Airplane Mode).',
            'JANGAN buka sebarang aplikasi bank atau eDompet pada telefon ini.',
            'Minta ahli keluarga yang dipercayai untuk membuang aplikasi tidak dikenali atau tetapkan semula telefon, dan hubungi bank menggunakan telefon lain.',
          ],
        },
        otp: {
          tabLabel: 'Kongsi OTP / WhatsApp',
          steps: [
            'Hubungi bank anda dengan segera untuk membekukan akses perbankan dalam talian.',
            'Maklumkan kepada keluarga dan rakan bahawa akaun WhatsApp atau Telegram anda mungkin telah digodam.',
            'Jangan sekali-kali berkongsi kod 6 digit lagi dengan sesiapa pun.',
          ],
        },
      },
      call997Cta: 'Hubungi NSRC 997 Sekarang (24/7)',
      warnFamilyCta: 'Beri Amaran Akaun Digodam Kepada Keluarga',
      hijackWarningMessage:
        'SEGERA: WhatsApp atau Telegram saya mungkin telah diambil alih. Sila abaikan sebarang mesej daripada akaun saya yang meminta wang atau kod OTP sehingga saya menghubungi anda.',
      bankHotlinesTitle: 'Talian Rasmi 24/7 Bank Malaysia',
      bankHotlinesSub: 'Tekan mana-mana nombor di bawah untuk terus menelefon',
    },
    onboarding: {
      skipButton: 'Langkau',
      readAloudButton: '🔊 Baca Dengan Kuat',
      stopReadingButton: 'Berhenti Membaca',
      backButtonLabel: 'Kembali',
      nextButton: 'Seterusnya',
      slide1: {
        title: 'Semak Sebelum Bertindak',
        message:
          'Terima mesej WhatsApp, Telegram, atau SMS yang merisaukan? Jangan tergesa-gesa. Semak di sini dengan selamat sebelum tekan pautan, membalas, atau pindah wang.',
        channelsLabel: 'Untuk WhatsApp, Telegram & SMS',
      },
      slide2: {
        title: '2 Cara Mudah Untuk Semak',
        card1Title: '📷 Paling Mudah: Tangkapan Skrin',
        card1Desc: 'Ambil tangkapan skrin sembang atau surat palsu dan muat naik di sini.',
        card2Title: '📋 Atau Tampal Teks / Nota Suara',
        card2Desc: 'Salin teks mesej atau muat naik rakaman suara yang mencurigakan.',
        tip: 'Petua: Tekan 🔊 Baca Dengan Kuat pada mana-mana keputusan jika anda lebih suka mendengar.',
      },
      slide3: {
        title: 'Sediakan Ahli Keluarga Dipercayai (Pilihan)',
        subtitle:
          'Simpan nombor ahli keluarga sekarang supaya anda boleh hantar mesej mencurigakan kepada mereka dengan satu tekan.',
        homeScreenTip:
          "📱 Petua: Simpan aplikasi ini ke Skrin Utama telefon anda (tekan menu pelayar ⋮ atau ikon Kongsi → 'Tambah ke Skrin Utama') supaya mudah dicari di sebelah WhatsApp!",
        saveAndStartButton: 'Simpan & Mula Semak',
        skipForNowButton: 'Langkau Buat Masa Ini',
      },
    },
  },
  zh: {
    brandTitle: 'JagaCare 安心查',
    brandSubtitle: '长辈防诈骗小帮手',
    backToHome: '返回首页',
    guideButton: '❓ 指南',
    familyButtonEmpty: '家人',
    speechLocale: 'zh-CN',
    hero: {
      title: '不确定这条消息安不安全？',
      subtitle: '回复、点击链接或转账前，先查一查 WhatsApp、Telegram、短信或语音消息。',
    },
    home: {
      uploadPhotoTitle: '上传截图或照片',
      uploadPhotoSub: '聊天截图、信件、二维码或转账收据',
      pasteSectionTitle: '粘贴消息文字',
      pasteButton: '粘贴',
      clearButton: '清空',
      textareaPlaceholder: '请把可疑的 WhatsApp、Telegram 或短信内容粘贴到这里……',
      emptyTextError: '请先粘贴或输入消息内容，再点击检查。',
      clipboardError: '无法自动读取剪贴板，请点击输入框后手动粘贴。',
      checkMessageButton: '检查消息',
      uploadAudioButton: '上传语音 / 录音文件',
      audioTooLargeError: '这个语音文件太大了，请选择小于 18MB 的文件。',
      imageTooLargeError: '这张图片太大了，请选择小于 20MB 的图片。',
      tryExampleLabel: '试试例子：',
      examples: [
        {
          id: 'bank',
          label: '假银行短信',
          text: 'RM0.00 MAYBANK：您的 MAE 账户因出现 RM2,450.00 可疑交易已被暂停。请在2小时内前往 http://maybank2u-verify-my.com 验证，否则资金将被冻结。',
        },
        {
          id: 'job',
          label: 'Telegram 兼职骗局',
          text: '你好！欢迎加入我们的 Telegram VIP 兼职任务群。只需给 3 个 TikTok 视频点赞，即可马上收到 RM50 Touch n Go 转账！升级 RM300 VIP 任务保证每天赚 RM1,200！马上联系 @HR_Jason88。',
        },
        {
          id: 'safe',
          label: '家人安全消息',
          text: '妈，我刚安全到吉隆坡了。记得吃下午的药，多喝水。我晚上6点半带晚饭回来！',
        },
      ],
      emergencyTitle: '救命！我已经转钱或点了链接',
      emergencySub: '冷静急救步骤与 997 热线',
      recentChecksTitle: '最近检查记录（最近 5 条）',
      recentChecksClear: '清空',
      recentChecksEmpty: '还没有检查记录。您最近检查过的 5 条消息会自动保存在这里，方便随时回来查看。',
      verdictLabels: {
        STOP: '停止',
        WAIT: '等待',
        SAFE: '安全',
      },
      inputTypeLabels: {
        text: '文字消息',
        image: '图片截图',
        audio: '语音消息',
        phone: '电话号码',
        bank: '银行账号',
      },
      tabMessage: '💬 检查消息',
      tabPhone: '📞 查电话号码',
      tabBank: '🏦 查银行账号',
      phoneInputLabel: '输入电话号码',
      phoneInputPlaceholder: '例如：012-3456789 或 +6011...',
      phoneEmptyError: '请先输入或粘贴电话号码。',
      phoneInvalidError: '请输入有效的电话号码（至少 7 位数字）。',
      claimedByLabel: '对方自称是谁？',
      claimedOptions: {
        bank: '银行',
        police_gov: '警方 / 政府 / 税收局 / MCMC',
        courier: '快递 / 包裹公司',
        family: '朋友 / 家人',
        seller: '网购卖家 / 陌生人',
        not_sure: '不确定',
      },
      checkPhoneButton: '检查这个号码',
      tryTestPhoneLabel: '试试测试诈骗号码：',
      bankInputLabel: '输入银行账号',
      bankInputPlaceholder: '例如：1122 3344 5566 或 5140...',
      bankEmptyError: '请先输入或粘贴银行账号。',
      bankInvalidError: '请输入有效的银行账号（至少 8 位数字）。',
      bankNameLabel: '哪家银行？（可选）',
      bankClaimedByLabel: '是谁要求您转账到这个账号？',
      checkBankButton: '检查这个银行账号',
      tryTestBankLabel: '试试测试诈骗账号：',
      extractedFoundLabel: '在消息里发现电话号码：',
      checkExtractedPrefix: '查询提取的号码：',
    },
    familyModal: {
      title: '信任的家人联系人',
      subtitle: '保存家人的联系方式，以后一键就能把可疑消息发给家人帮忙确认。',
      nameLabel: '家人称呼 / 姓名',
      namePlaceholder: '例如：美玲 / 阿伟',
      phoneLabel: 'WhatsApp 电话号码',
      phonePlaceholder: '例如：012-345 6789',
      nameError: '请输入家人的称呼或姓名。',
      phoneError: '请输入至少 7 位数字的有效电话号码。',
      saveButton: '保存联系人',
      cancelButton: '取消',
      savedToast: '已保存信任的家人联系人！',
      sharedToast: '已保存联系人！正在打开 WhatsApp 发给家人。',
    },
    results: {
      loadingTitle: '正在为您安全检查中……',
      loadingSub: '请稍等片刻，先不要回复或点击任何链接。',
      cancelButton: '取消',
      errorTitle: '暂时无法完成检查',
      tryAgainButton: '再试一次',
      checkingAudioPrefix: '正在检查语音：',
      checkingImagePrefix: '已检查图片：',
      checkingPhonePrefix: '正在检查电话号码：',
      checkingBankPrefix: '正在检查银行账号：',
      extractedNumberTitle: '在这条消息中发现电话号码',
      checkExtractedButtonPrefix: '📞 查询发现的号码：',
      copySemakMuleButton: '📋 复制并前往警方 Semak Mule 查询',
      copiedSemakMuleToast: '已复制！打开 Semak Mule 后粘贴即可查看警方报案记录',
      copyPenipuMyButton: '📋 复制并前往 Penipu.my 查询',
      copiedPenipuMyToast: '已复制！打开 Penipu.my 后粘贴即可查看民众举报',
      truecallerButton: '🔍 在 Truecaller 诈骗查询网站检查',
      dbSummaryTitle: '数据库查证摘要',
      dbPoliceReports: '警方报案记录：',
      dbCommunityReports: '民众举报记录：',
      dbBnmAlert: '国家银行 (BNM) 警报：',
      dbBnmYes: '是',
      dbSpoofingBadge: '官方号码常被冒充伪造',
      dbZeroReportsNote: '暂未查到举报记录 — 但骗子经常更换新电话卡，仍请务必小心核实。',
      dbUnavailableNote: '',
      localFlagBadgeTitle: '⚠️ 此号码/账号此前已在本设备被标记为可疑',
      markAsScamButton: '🚩 将此号码/账号标记为诈骗',
      markScamCardTitle: '在本设备保存本地提醒',
      markScamQuickReasons: [
        '假冒警察 / 银行来电',
        '索要钱财 / 验证码',
        '假网购卖家 / 快递诈骗',
      ],
      markScamReasonPlaceholder: '简短备注（例如：冒充税收局）',
      markScamSaveButton: '保存在本设备',
      markScamCancelButton: '取消',
      markScamSavedToast: '已保存在本设备，下次再遇到会自动提醒您！',
      removeLocalFlagButton: '移除本地提醒',
      removeLocalFlagToast: '已移除本地提醒。',
      phoneVerdictBanner: {
        reportsFound: '🛑 立刻停止 — 查到诈骗举报记录！千万不要回复、接听或转账。',
        suspiciousFound: '⚠️ 先等一等 — 查到可疑举报记录。请先安全核实。',
        noReportsFound: '先等一等 — 暂未查到举报记录，仍需保持警惕。',
      },
      bankVerdictBanner: {
        reportsFound: '🛑 立刻停止 — 查到此银行账号有诈骗举报记录！千万不要转账。',
        suspiciousFound: '⚠️ 先等一等 — 查到此账号有可疑举报记录。请先核实再决定。',
        noReportsFound: '先等一等 — 暂未查到举报记录，转账前仍请务必核实清楚。',
      },
      verdictBanner: {
        STOP: '立刻停止 — 很可能是诈骗。千万不要回复、点击或转账。',
        WAIT: '先等一等 — 看起来很可疑。请先安全核实。',
        SAFE: '暂未发现明显危险 — 但仍绝不要把 OTP 验证码告诉陌生人或随便转账。',
      },
      readAloudButton: '语音朗读结果',
      stopReadingButton: '停止朗读',
      speechUnsupported: '当前浏览器不支持语音朗读功能。',
      translatingBanner: '正在将检查结果翻译为简体中文……',
      translateErrorToast: '暂时无法翻译此检查结果，请稍后再试。',
      whyRiskyTitle: '为什么这条消息有风险',
      whatCheckedTitle: '我们检查了什么',
      safeStepsTitle: '行动前如何安全核实',
      portalsTitle: '官方安全查证网站',
      sendToFamilyButton: '发给家人帮忙再确认',
      checkAnotherButton: '检查另一条消息',
      emergencyButton: '救命！我已经转钱或点了链接',
      portals: {
        semak_mule: '警方 Semak Mule 查账号',
        poslaju: 'PosLaju 官方快递查询',
        jnt: 'J&T Express 官方快递查询',
        bnm: '国家银行防诈骗警报',
      },
      whatsappSharePrefix: 'JagaCare 安心查结果',
      whatsappShareWarningsTitle: '发现的可疑之处：',
      copyResultButton: '📋 复制检查结果摘要',
      copiedResultToast: '已复制检查结果到剪贴板！可直接粘贴到笔记或聊天中。',
      trends: {
        title: '诈骗类型趋势',
        checksUnitSingular: '条本地检查记录',
        checksUnitPlural: '条本地检查记录',
        flaggedRiskySuffix: '条被标记为停止或等待',
        emptyText: '暂无检查记录。完成检查后，这里会显示您查过的诈骗类型分布。',
        footerNote: '仅根据本设备保存的本地检查记录在本地统计，不会上传任何隐私。',
        chartAriaLabel: '展示您本地检查记录中各类诈骗分布的条形图',
        categories: {
          impersonation: '冒充身份（银行/警方/快递）',
          phishing: '钓鱼链接与假网站',
          investment: '投资与兼职骗局',
          payment: '人头账户与网购风险',
          safe: '安全 / 无明显危险',
          other: '其他可疑情况',
        },
      },
    },
    emergency: {
      alertTitle: '冷静急救指南',
      alertSub: '请先深呼吸，现在就一步一步照着下面做。',
      scenarios: {
        money: {
          tabLabel: '已转账 / 给了银行资料',
          steps: [
            '马上使用下方官方电话拨打银行 24 小时防诈骗热线（千万不要拨打骗子消息里的号码）。',
            '立刻拨打马来西亚国家诈骗应对中心（NSRC）24 小时热线 997。',
            '把聊天记录、对方电话号码和转账收据都截图保存，方便报警报案。',
          ],
        },
        apk: {
          tabLabel: '安装了陌生软件 / .APK',
          steps: [
            '马上关闭手机 Wi-Fi 和移动数据（打开飞行模式）。',
            '千万不要再打开手机上的任何银行或电子钱包软件。',
            '请信任的家人帮忙删除陌生软件或重置手机，并用另一部电话拨打银行热线。',
          ],
        },
        otp: {
          tabLabel: '泄露了验证码 / WhatsApp',
          steps: [
            '立刻拨打银行电话，暂时冻结网上银行账户。',
            '马上通知家人和朋友，提醒他们您的 WhatsApp 或 Telegram 可能被盗号。',
            '绝不要再把任何 6 位数字验证码告诉任何人。',
          ],
        },
      },
      call997Cta: '立即拨打 NSRC 997 热线 (24小时)',
      warnFamilyCta: '通知家人账号可能被盗',
      hijackWarningMessage:
        '紧急通知：我的 WhatsApp 或 Telegram 账号可能被盗用了。在接到我亲自电话确认之前，千万不要相信我账号发出的借钱、转账或索要验证码消息！',
      bankHotlinesTitle: '马来西亚各大银行 24 小时官方热线',
      bankHotlinesSub: '点击下方任意号码即可直接拨打',
    },
    onboarding: {
      skipButton: '跳过',
      readAloudButton: '🔊 语音朗读',
      stopReadingButton: '停止朗读',
      backButtonLabel: '上一步',
      nextButton: '下一步',
      slide1: {
        title: '先查一查，再行动',
        message:
          '收到让人担心的 WhatsApp、Telegram 或短信？千万别着急。先在这里安全查一查，再去点击链接、回复或转账。',
        channelsLabel: '适用于 WhatsApp、Telegram 和短信',
      },
      slide2: {
        title: '2 种超简单的检查方法',
        card1Title: '📷 最简单：上传截图',
        card1Desc: '把聊天界面或可疑信件截图下来，直接上传到这里检查。',
        card2Title: '📋 或粘贴文字 / 语音消息',
        card2Desc: '复制可疑消息文字，或上传别人发来的语音录音。',
        tip: '小贴士：如果您更喜欢用听的，任何检查结果页面都可以点击 🔊 语音朗读。',
      },
      slide3: {
        title: '设置您的家人守护网（可选）',
        subtitle:
          '现在先保存一位信任家人的名字和 WhatsApp 号码，以后一键就能把可疑消息发给家人帮忙确认。',
        homeScreenTip:
          '📱 小贴士：把本应用添加到手机主屏幕（点击浏览器菜单 ⋮ 或分享图标 →「添加到主屏幕」），以后放在 WhatsApp 旁边随时一按就能用！',
        saveAndStartButton: '保存并开始检查',
        skipForNowButton: '暂时跳过',
      },
    },
  },
};
