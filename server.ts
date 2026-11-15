import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_AUDIO_BYTES = 18 * 1024 * 1024;
const GEMINI_TIMEOUT_MS = 60_000;

const SYSTEM_PROMPT = `You are JagaCare, a calm, protective, and patient scam-detection assistant built especially to protect elderly users from WhatsApp, Telegram, SMS, and social media scams in Malaysia and Southeast Asia.
Analyze the user's uploaded screenshot, image, audio, or pasted text for signs of fraud, impersonation, urgency manipulation, suspicious links, malicious .apk files, fake receipts, or requests for money/OTP codes.

RULES:
1. Audience & Tone: Write as if gently explaining to a 70-year-old parent. Use short, reassuring sentences. NEVER use technical jargon ("phishing", "spoofing", "malware", "social engineering", "typosquatting", "sideloading"). Always use simple words ("fake website", "trick", "harmful app file", "trying to scare you").
2. STRICT OUTPUT LANGUAGE: You MUST write EVERY explanatory field ("headline", "scam_category", "simple_summary", "red_flags[].plain_explanation", "safe_check_steps[]", and "family_share_summary") STRICTLY in the Target Response Language requested by the user (English, Bahasa Melayu, or Simplified Chinese / 简体中文), EVEN IF the suspicious message, screenshot, audio, or Manglish text is written in English or another language. NEVER leave "scam_category", "headline", "simple_summary", "plain_explanation", "safe_check_steps", or "family_share_summary" in English when Bahasa Melayu or Simplified Chinese is requested. ONLY "red_flags[].quoted_clue" should keep the exact original phrase, link, or phone number spotted in the message so the user recognizes it.
3. Conservative Safety: If a message asks for money, bank details, 6-digit OTP/TAC codes, installing an .apk file, or clicking an unfamiliar link with urgency, NEVER label it "SAFE". Label it "STOP" or "WAIT".
4. Local Context: Recognize Malaysian entities (PDRM, LHDN, KWSP, TNB, PosLaju, J&T, Maybank, CIMB, Public Bank, RHB, Hong Leong, Touch 'n Go eWallet, NSRC 997, Semak Mule). Never invent fake bank phone numbers.
5. Output ONLY valid JSON matching this exact structure:
{
  "verdict": "STOP" | "WAIT" | "SAFE",
  "headline": "Short 5-8 word headline in plain language, strictly in the Target Response Language",
  "scam_category": "Short category name strictly in the Target Response Language (e.g., Fake Bank Alert / Penipuan Bank Palsu / 假银行警报)",
  "simple_summary": "1-2 short, calm sentences explaining what is happening, strictly in the Target Response Language.",
  "red_flags": [
    {
      "quoted_clue": "Exact phrase, link, or visual detail spotted in the message (verbatim from source)",
      "plain_explanation": "1 simple sentence explaining why this is risky, strictly in the Target Response Language"
    }
  ],
  "safe_check_steps": [
    "Step 1 strictly in the Target Response Language: Concrete, safe action the user should take before doing anything",
    "Step 2 strictly in the Target Response Language: Next safe verification step"
  ],
  "family_share_summary": "Short 2-sentence summary strictly in the Target Response Language ready to send via WhatsApp to a family member asking them to double-check."
}`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ["STOP", "WAIT", "SAFE"],
      description: "Conservative safety verdict for the message.",
    },
    headline: {
      type: Type.STRING,
      description: "Short 5-8 word headline in plain language, strictly in the Target Response Language.",
    },
    scam_category: {
      type: Type.STRING,
      description:
        "Short scam category label strictly in the Target Response Language.",
    },
    simple_summary: {
      type: Type.STRING,
      description: "1-2 short, calm sentences explaining what is happening, strictly in the Target Response Language.",
    },
    red_flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          quoted_clue: {
            type: Type.STRING,
            description: "Exact phrase, link, or visual detail spotted in the message.",
          },
          plain_explanation: {
            type: Type.STRING,
            description: "1 simple sentence explaining why this is risky or what was checked, strictly in the Target Response Language.",
          },
        },
        required: ["quoted_clue", "plain_explanation"],
      },
    },
    safe_check_steps: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Concrete, safe verification steps for an elderly user, strictly in the Target Response Language.",
    },
    family_share_summary: {
      type: Type.STRING,
      description: "Short 2-sentence summary ready to send via WhatsApp to a family member, strictly in the Target Response Language.",
    },
    extracted_phone_numbers: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Any phone numbers spotted in the message, screenshot, or audio (empty array if none).",
    },
  },
  required: [
    "verdict",
    "headline",
    "scam_category",
    "simple_summary",
    "red_flags",
    "safe_check_steps",
    "family_share_summary",
    "extracted_phone_numbers",
  ],
};

const TRANSLATE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headline: {
      type: Type.STRING,
      description: "Translated headline strictly in the Target Language.",
    },
    scam_category: {
      type: Type.STRING,
      description: "Translated scam category label strictly in the Target Language.",
    },
    simple_summary: {
      type: Type.STRING,
      description: "Translated simple summary strictly in the Target Language.",
    },
    red_flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          quoted_clue: {
            type: Type.STRING,
            description: "Keep the exact original quoted_clue string unchanged.",
          },
          plain_explanation: {
            type: Type.STRING,
            description: "Translated explanation strictly in the Target Language.",
          },
        },
        required: ["quoted_clue", "plain_explanation"],
      },
    },
    safe_check_steps: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Translated list of safe verification steps strictly in the Target Language.",
    },
    family_share_summary: {
      type: Type.STRING,
      description: "Translated WhatsApp family summary strictly in the Target Language.",
    },
  },
  required: [
    "headline",
    "scam_category",
    "simple_summary",
    "red_flags",
    "safe_check_steps",
    "family_share_summary",
  ],
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ms: "Bahasa Melayu",
  zh: "Simplified Chinese (简体中文)",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_BYTES,
  },
});

const CLAIMED_IDENTITY_LABELS: Record<string, string> = {
  bank: "Bank",
  police_gov: "Police / Government / LHDN / MCMC",
  courier: "Courier / Parcel Delivery",
  family: "Friend / Family Member",
  seller: "Online Seller / Stranger",
  not_sure: "Not Sure",
};

const OFFICIAL_BANK_HOTLINE_DIGITS = new Set([
  "1300886688",
  "0362047788",
  "60362047788",
  "0321773555",
  "60321773555",
  "0392068118",
  "60392068118",
  "0376268899",
  "60376268899",
  "0321788888",
  "60321788888",
  "0326900900",
  "60326900900",
]);

interface PenipuMYLookupResult {
  available: boolean;
  phone?: string;
  police_report_count: number;
  verified_report_count: number;
  unverified_report_count: number;
  spam: boolean;
  fraud: boolean;
  risk_level?: string;
  risk_score?: number;
  risk_reasons?: string[];
  business_tier?: string;
  business_name?: string;
  spoofing_report_count?: number;
  reason?: string;
}

function cleanPhoneForLookup(raw: string): string {
  const trimmed = raw.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}

async function lookupPenipuMY(rawPhone: string): Promise<PenipuMYLookupResult> {
  const emptyResult = (reason?: string): PenipuMYLookupResult => ({
    available: false,
    police_report_count: 0,
    verified_report_count: 0,
    unverified_report_count: 0,
    spam: false,
    fraud: false,
    ...(reason ? { reason } : {}),
  });

  const apiKey = process.env.PENIPUMY_KEY?.trim();
  if (!apiKey) {
    return emptyResult();
  }

  const cleaned = cleanPhoneForLookup(rawPhone);
  if (cleaned.replace(/\D/g, "").length < 7) {
    return emptyResult();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(
      `https://api.penipu.my/v1/phone?q=${encodeURIComponent(cleaned)}`,
      {
        method: "GET",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );

    if (response.status === 429) {
      return emptyResult("Live database is temporarily busy. Using safety rules instead.");
    }
    if (!response.ok) {
      return emptyResult(`Live database returned status ${response.status}.`);
    }

    const rawJson = (await response.json()) as Record<string, unknown>;
    const payload =
      rawJson && typeof rawJson.data === "object" && rawJson.data !== null
        ? (rawJson.data as Record<string, unknown>)
        : rawJson;

    const policeReportCount = Number(payload.police_report_count) || 0;
    const verifiedReportCount = Number(payload.verified_report_count) || 0;
    const unverifiedReportCount = Number(payload.unverified_report_count) || 0;
    const spam = Boolean(payload.spam);
    const fraud = Boolean(payload.fraud);

    const riskObj =
      payload.risk && typeof payload.risk === "object"
        ? (payload.risk as Record<string, unknown>)
        : undefined;
    const businessObj =
      payload.business && typeof payload.business === "object"
        ? (payload.business as Record<string, unknown>)
        : undefined;

    return {
      available: true,
      phone: cleaned,
      police_report_count: policeReportCount,
      verified_report_count: verifiedReportCount,
      unverified_report_count: unverifiedReportCount,
      spam,
      fraud,
      risk_level: typeof riskObj?.level === "string" ? riskObj.level : undefined,
      risk_score: typeof riskObj?.score === "number" ? riskObj.score : undefined,
      risk_reasons: Array.isArray(riskObj?.reasons)
        ? riskObj.reasons.filter((r): r is string => typeof r === "string")
        : undefined,
      business_tier: typeof businessObj?.tier === "string" ? businessObj.tier : undefined,
      business_name: typeof businessObj?.name === "string" ? businessObj.name : undefined,
      spoofing_report_count:
        typeof businessObj?.spoofing_report_count === "number"
          ? businessObj.spoofing_report_count
          : undefined,
    };
  } catch {
    return emptyResult("Could not reach the live database right now.");
  } finally {
    clearTimeout(timeoutId);
  }
}

interface PhoneRuleAssessment {
  enforcedVerdict: "STOP" | "WAIT";
  isMalaysianMobile: boolean;
  isForeignCountryCode: boolean;
  matchesOfficialBankHotline: boolean;
  ruleSummaryForPrompt: string;
}

function assessPhoneNumber(
  rawPhone: string,
  claimedIdentity: string,
  penipu: PenipuMYLookupResult,
  localFlagReason?: string
): PhoneRuleAssessment {
  const compact = rawPhone.replace(/[\s\-().]/g, "");
  const digits = compact.replace(/\D/g, "");

  const isMalaysianMobile =
    /^01[0-9]\d{7,8}$/.test(digits) || /^601[0-9]\d{7,8}$/.test(digits);

  const hasPlusForeign = compact.startsWith("+") && !compact.startsWith("+60");
  const hasDoubleZeroForeign = compact.startsWith("00") && !compact.startsWith("0060");
  const isLocalMalaysianPattern =
    digits.startsWith("0") ||
    digits.startsWith("60") ||
    digits.startsWith("1300") ||
    digits.startsWith("1800") ||
    digits === "997" ||
    digits === "999";
  const isForeignCountryCode =
    hasPlusForeign || hasDoubleZeroForeign || (!isLocalMalaysianPattern && digits.length >= 8);

  const matchesOfficialBankHotline = OFFICIAL_BANK_HOTLINE_DIGITS.has(digits);

  const claimsAuthorityOrBank = claimedIdentity === "bank" || claimedIdentity === "police_gov";
  const claimsLocalService =
    claimedIdentity === "bank" ||
    claimedIdentity === "police_gov" ||
    claimedIdentity === "courier";

  let enforcedVerdict: "STOP" | "WAIT" = "WAIT";
  const reasons: string[] = [
    "CRITICAL HONESTY RULE: You CANNOT verify a private random phone number as SAFE. NEVER output verdict 'SAFE' for a phone number check.",
  ];

  if (localFlagReason) {
    enforcedVerdict = "STOP";
    reasons.push(
      `LOCAL DEVICE WARNING -> MUST BE 'STOP': This number was previously flagged as suspicious (${localFlagReason}). Warn the senior clearly NOT to reply, answer, or transfer money.`
    );
  }

  // Live PenipuMY Database Signals (when key is configured and lookup succeeded)
  if (penipu.available) {
    const communityTotal = penipu.verified_report_count + penipu.unverified_report_count;
    reasons.push(
      `LIVE PENIPUMY DATABASE RESULT: police_report_count=${penipu.police_report_count}, verified_report_count=${penipu.verified_report_count}, unverified_report_count=${penipu.unverified_report_count}, spam=${penipu.spam}, fraud=${penipu.fraud}, risk_level=${penipu.risk_level ?? "unknown"}, risk_score=${penipu.risk_score ?? "unknown"}, risk_reasons=${(penipu.risk_reasons ?? []).join("; ") || "none"}, business_name=${penipu.business_name ?? "none"}, business_tier=${penipu.business_tier ?? "none"}, spoofing_report_count=${penipu.spoofing_report_count ?? 0}.`
    );

    if (penipu.police_report_count > 0 || penipu.verified_report_count > 0 || penipu.fraud) {
      enforcedVerdict = "STOP";
      reasons.push(
        `DATABASE RULE -> MUST BE 'STOP': Scam reports were found! Explain clearly in plain, calm language: this number has ${penipu.police_report_count} police report(s) and ${communityTotal} community scam report(s). Warn the user NOT to reply, answer, or transfer money.`
      );
    } else if (penipu.business_tier === "verified_spoofing") {
      enforcedVerdict = "WAIT";
      reasons.push(
        `DATABASE RULE -> MUST BE 'WAIT' or 'STOP': This looks like a real company's number (${penipu.business_name ?? "official organization"}), but scammers often fake caller IDs to pretend to be them (${penipu.spoofing_report_count ?? 0} faking reports). Explain calmly: hang up and call their official number yourself.`
      );
    } else if (penipu.unverified_report_count > 0 || penipu.spam) {
      enforcedVerdict = "WAIT";
      reasons.push(
        `DATABASE RULE -> MUST BE 'WAIT': Suspicious community/spam reports were found (${penipu.unverified_report_count} unverified report(s)). Advise checking carefully before replying or sending money.`
      );
    } else {
      reasons.push(
        `DATABASE RULE -> NO REPORTS FOUND (MUST STILL BE 'WAIT', NEVER 'SAFE'): 0 scam reports were found in the community database yet, but remind the senior calmly that scammers constantly switch to new SIM cards, so still double-check before sending money or sharing OTP codes.`
      );
    }
  } else {
    reasons.push(
      `CONTEXT & PREFIX ANALYSIS MODE: Analyze the phone number format, Malaysian prefix (010-019 personal mobile vs 1300/1800/03 official landline vs foreign code), and claimed identity. Do NOT mention any missing database, API key, or system limitation to the user. Simply give calm, clear advice and remind them they can use the Semak Mule and Penipu.my buttons below to double-check public police/community records.`
    );
  }

  // Structural & Identity Rules
  if (claimsAuthorityOrBank && isMalaysianMobile) {
    enforcedVerdict = "STOP";
    reasons.push(
      "IDENTITY RULE -> MUST BE 'STOP': They claim to be Bank or Police/Gov/LHDN/MCMC, yet they are using a personal Malaysian mobile number (010-019). Real Malaysian authorities and banks NEVER conduct investigations or ask for OTP/TAC codes or money transfers over personal mobile numbers or WhatsApp."
    );
  } else if (isForeignCountryCode && claimsLocalService) {
    enforcedVerdict = "STOP";
    reasons.push(
      "IDENTITY RULE -> MUST BE 'STOP': This number uses a foreign country code while claiming to be a local Malaysian service or authority."
    );
  } else if (matchesOfficialBankHotline && enforcedVerdict !== "STOP") {
    enforcedVerdict = "WAIT";
    reasons.push(
      "HOTLINE RULE -> MUST BE 'WAIT': This number matches a known official Malaysian bank hotline, BUT scammers can fake or copy the Caller ID shown on incoming calls. Advise the senior to hang up right away and call the official number printed on the back of their own bank card directly."
    );
  }

  return {
    enforcedVerdict,
    isMalaysianMobile,
    isForeignCountryCode,
    matchesOfficialBankHotline,
    ruleSummaryForPrompt: reasons.join("\n"),
  };
}

interface BankRuleAssessment {
  enforcedVerdict: "STOP" | "WAIT";
  ruleSummaryForPrompt: string;
}

function assessBankAccount(
  rawAccount: string,
  bankName: string,
  claimedIdentity: string,
  localFlagReason?: string
): BankRuleAssessment {
  const digits = rawAccount.replace(/\D/g, "");
  const claimsAuthorityOrBank = claimedIdentity === "bank" || claimedIdentity === "police_gov";

  let enforcedVerdict: "STOP" | "WAIT" = "WAIT";
  const reasons: string[] = [
    "CRITICAL HONESTY RULE: You CANNOT verify an unfamiliar bank account as SAFE from its account number alone. NEVER output verdict 'SAFE' for a bank account check.",
  ];

  if (localFlagReason) {
    enforcedVerdict = "STOP";
    reasons.push(
      `LOCAL DEVICE WARNING -> MUST BE 'STOP': This bank account was previously flagged as suspicious (${localFlagReason}). Warn the senior clearly NOT to transfer any money.`
    );
  }

  if (claimsAuthorityOrBank) {
    enforcedVerdict = "STOP";
    reasons.push(
      "IDENTITY RULE -> MUST BE 'STOP': Someone claiming to be Police, Government (LHDN/MCMC/Court), or a Bank is asking for a transfer to this account. Real Malaysian police, government agencies, and banks NEVER ask citizens to transfer money to a 'safe account', 'audit account', or personal bank account for investigation or verification."
    );
  } else {
    reasons.push(
      `BANK ACCOUNT CHECK GUIDANCE (MUST BE 'WAIT' or 'STOP', NEVER 'SAFE'): Account digits length=${digits.length}, bank=${bankName || "Not specified"}. Explain calmly that scammers often use rented personal bank accounts ('mule accounts') to receive stolen money. Do NOT mention any missing API or technical limitation. Advise the user to tap the 'Copy & Check on PDRM Semak Mule' and 'Copy & Check on Penipu.my' buttons below before transferring any money, and verify directly with a trusted family member.`
    );
  }

  return {
    enforcedVerdict,
    ruleSummaryForPrompt: reasons.join("\n"),
  };
}

function getLanguageName(code: unknown): string {
  if (typeof code === "string" && LANGUAGE_LABELS[code]) {
    return LANGUAGE_LABELS[code];
  }
  return "English";
}

function getFriendlyErrorMessage(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (lower.includes("timeout") || lower.includes("aborted")) {
    return {
      status: 504,
      message: "The check took too long. Please try again in a moment.",
    };
  }
  if (lower.includes("api_key_invalid") || lower.includes("permission_denied") || lower.includes("api key")) {
    return {
      status: 500,
      message: "AI service key is missing or invalid. Please check the Secrets configuration.",
    };
  }
  if (lower.includes("resource_exhausted") || lower.includes("429") || lower.includes("unavailable") || lower.includes("503") || lower.includes("high demand")) {
    return {
      status: 503,
      message: "The checking service is busy right now. Please wait a moment and try again.",
    };
  }
  return {
    status: 500,
    message: "Unable to complete the check right now. Please try again.",
  };
}

async function generateWithRetry(
  fn: () => ReturnType<GoogleGenAI["models"]["generateContent"]>,
  signal: AbortSignal,
  maxRetries = 2
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      const isTransient =
        msg.includes("503") ||
        msg.includes("unavailable") ||
        msg.includes("high demand") ||
        msg.includes("econnreset");
      if (!isTransient || signal.aborted || attempt === maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 650 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "22mb" }));
  app.use(express.urlencoded({ extended: true, limit: "22mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get("/api/check-phone", async (req: Request, res: Response) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    if (!q.trim()) {
      res.status(400).json({
        available: false,
        reason: "Missing phone number query parameter.",
      });
      return;
    }
    const lookup = await lookupPenipuMY(q);
    res.json(lookup);
  });

  app.post(
    "/api/analyze",
    (req: Request, res: Response, next: NextFunction) => {
      const contentType = req.headers["content-type"] || "";
      if (contentType.includes("multipart/form-data")) {
        upload.fields([
          { name: "image", maxCount: 1 },
          { name: "audio", maxCount: 1 },
        ])(req, res, (err: unknown) => {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              res.status(400).json({
                error: "The uploaded file is too large. Images must be under 20MB and voice notes under 18MB.",
              });
              return;
            }
            res.status(400).json({ error: err.message });
            return;
          }
          if (err) {
            res.status(400).json({ error: "Could not read the uploaded file." });
            return;
          }
          next();
        });
      } else {
        next();
      }
    },
    async (req: Request, res: Response) => {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          res.status(500).json({
            error: "GEMINI_API_KEY is not configured on the server.",
          });
          return;
        }

        const files = (req.files as Record<string, Express.Multer.File[]> | undefined) || {};
        const imageFile = files.image?.[0];
        const audioFile = files.audio?.[0];

        const body = (req.body || {}) as Record<string, unknown>;
        const rawText = typeof body.text === "string" ? body.text.trim() : "";
        const rawPhone = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
        const rawBankAccount = typeof body.bankAccount === "string" ? body.bankAccount.trim() : "";
        const rawBankName = typeof body.bankName === "string" ? body.bankName.trim() : "";
        const localFlagReason =
          typeof body.localFlagReason === "string" ? body.localFlagReason.trim() : "";
        const claimedIdentity =
          typeof body.claimedIdentity === "string" ? body.claimedIdentity : "not_sure";
        const isPhoneCheck = body.type === "phone" || Boolean(rawPhone);
        const isBankCheck = body.type === "bank" || Boolean(rawBankAccount);
        const targetLang = getLanguageName(body.language);

        if (imageFile && imageFile.size > MAX_IMAGE_BYTES) {
          res.status(400).json({ error: "Image must be 20MB or smaller." });
          return;
        }
        if (audioFile && audioFile.size > MAX_AUDIO_BYTES) {
          res.status(400).json({ error: "Voice note or audio file must be 18MB or smaller." });
          return;
        }

        if (!rawText && !imageFile && !audioFile && !rawPhone && !rawBankAccount) {
          res.status(400).json({
            error: "Please paste a message, enter a phone number or bank account, upload a screenshot, or upload a voice note.",
          });
          return;
        }

        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const parts: Array<
          | { text: string }
          | { inlineData: { mimeType: string; data: string } }
        > = [];

        if (imageFile) {
          parts.push({
            inlineData: {
              mimeType: imageFile.mimetype || "image/jpeg",
              data: imageFile.buffer.toString("base64"),
            },
          });
        }

        if (audioFile) {
          parts.push({
            inlineData: {
              mimeType: audioFile.mimetype || "audio/mpeg",
              data: audioFile.buffer.toString("base64"),
            },
          });
        }

        const instructionLines = [
          `TARGET RESPONSE LANGUAGE: ${targetLang}.`,
          `MANDATORY LANGUAGE RULE: The user's selected UI language is ${targetLang}. Write ALL values of "headline", "scam_category", "simple_summary", "red_flags[].plain_explanation", "safe_check_steps", and "family_share_summary" 100% in ${targetLang} — even if the message or guidance notes below are in English or another language. Keep ONLY "red_flags[].quoted_clue" verbatim from the original message, link, number, or visual clue.`,
          `Always populate extracted_phone_numbers with any phone numbers visible or heard in the content (or an empty array if none).`,
        ];

        let phoneAssessment: PhoneRuleAssessment | null = null;
        let bankAssessment: BankRuleAssessment | null = null;
        let penipuLookup: PenipuMYLookupResult | null = null;

        if (isPhoneCheck && rawPhone) {
          penipuLookup = await lookupPenipuMY(rawPhone);
          phoneAssessment = assessPhoneNumber(
            rawPhone,
            claimedIdentity,
            penipuLookup,
            localFlagReason || undefined
          );
          const claimedLabel = CLAIMED_IDENTITY_LABELS[claimedIdentity] || "Not Sure";
          instructionLines.push(
            `PHONE NUMBER CHECK REQUEST:`,
            `Phone number entered: ${rawPhone}`,
            `Who the caller/sender claims to be: ${claimedLabel}`,
            phoneAssessment.ruleSummaryForPrompt,
            `Remember: NEVER use technical jargon like "spoofing" or "phishing" — use plain words like "fake the caller name/number" or "trick". Keep explanations calm and clear for a 70-year-old, and write EVERY output field strictly in ${targetLang}.`
          );
        } else if (isBankCheck && rawBankAccount) {
          bankAssessment = assessBankAccount(
            rawBankAccount,
            rawBankName,
            claimedIdentity,
            localFlagReason || undefined
          );
          const claimedLabel = CLAIMED_IDENTITY_LABELS[claimedIdentity] || "Not Sure";
          instructionLines.push(
            `BANK ACCOUNT CHECK REQUEST:`,
            `Bank account number entered: ${rawBankAccount}`,
            `Bank name (if provided): ${rawBankName || "Not specified"}`,
            `Who asked them to transfer to this account: ${claimedLabel}`,
            bankAssessment.ruleSummaryForPrompt,
            `Remember: NEVER use technical jargon like "mule account" without explaining it simply as "a bank account used by scammers to collect money". Keep explanations calm and clear for a 70-year-old, and write EVERY output field strictly in ${targetLang}.`
          );
        } else if (rawText) {
          instructionLines.push(
            `Message text to check (remember: write all JSON explanations, category, headline, summary, steps, and family summary strictly in ${targetLang}):\n"""\n${rawText}\n"""`
          );
        } else if (imageFile) {
          instructionLines.push(
            `Please carefully examine all text, links, sender details, phone numbers, QR codes, receipts, and visual clues inside this screenshot or photo. Write all JSON explanations, category, headline, summary, steps, and family summary strictly in ${targetLang}.`
          );
        } else if (audioFile) {
          instructionLines.push(
            `Please listen carefully to this voice note or audio recording, transcribe/understand what is being asked or threatened, and check it for scam signs. Write all JSON explanations, category, headline, summary, steps, and family summary strictly in ${targetLang}.`
          );
        }

        parts.push({ text: instructionLines.join("\n\n") });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

        try {
          const geminiCall = generateWithRetry(
            () =>
              ai.models.generateContent({
                model: "gemini-4-hydrogen",
                contents: { parts },
                config: {
                  systemInstruction: SYSTEM_PROMPT,
                  responseMimeType: "application/json",
                  responseSchema: RESPONSE_SCHEMA,
                  thinkingConfig: {
                    thinkingLevel: ThinkingLevel.LOW,
                  },
                  abortSignal: controller.signal,
                },
              }),
            controller.signal
          );

          const timeoutPromise = new Promise<never>((_resolve, reject) => {
            controller.signal.addEventListener("abort", () => {
              reject(new Error("Request timeout after 60 seconds"));
            });
          });

          const response = await Promise.race([geminiCall, timeoutPromise]);
          const responseText = (response.text ?? "").trim();

          if (!responseText) {
            res.status(502).json({
              error: "No analysis was returned. Please try again.",
            });
            return;
          }

          const parsed = JSON.parse(responseText);

          // Server-side safety guardrail for phone number checks: never hallucinate SAFE
          if (phoneAssessment) {
            if (phoneAssessment.enforcedVerdict === "STOP") {
              parsed.verdict = "STOP";
            } else if (parsed.verdict === "SAFE") {
              parsed.verdict = phoneAssessment.enforcedVerdict;
            }
            if (penipuLookup?.available) {
              parsed.phone_lookup = {
                available: true,
                police_report_count: penipuLookup.police_report_count,
                verified_report_count: penipuLookup.verified_report_count,
                unverified_report_count: penipuLookup.unverified_report_count,
                spam: penipuLookup.spam,
                fraud: penipuLookup.fraud,
                business_tier: penipuLookup.business_tier,
                business_name: penipuLookup.business_name,
                spoofing_report_count: penipuLookup.spoofing_report_count,
              };
            }
          }

          // Server-side safety guardrail for bank account checks: never hallucinate SAFE
          if (bankAssessment) {
            if (bankAssessment.enforcedVerdict === "STOP") {
              parsed.verdict = "STOP";
            } else if (parsed.verdict === "SAFE") {
              parsed.verdict = bankAssessment.enforcedVerdict;
            }
          }

          res.json(parsed);
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err) {
        console.error("Analysis error:", err);
        const { status, message } = getFriendlyErrorMessage(err);
        res.status(status).json({ error: message });
      }
    }
  );

  app.post("/api/translate-result", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server.",
        });
        return;
      }

      const body = (req.body || {}) as Record<string, unknown>;
      const rawResult = body.result as Record<string, unknown> | undefined;
      const targetLanguageCode = typeof body.targetLanguage === "string" ? body.targetLanguage : "";

      if (!rawResult || typeof rawResult !== "object" || !LANGUAGE_LABELS[targetLanguageCode]) {
        res.status(400).json({ error: "Invalid result payload or target language." });
        return;
      }

      const targetLang = getLanguageName(targetLanguageCode);
      const sourceRedFlags = Array.isArray(rawResult.red_flags)
        ? rawResult.red_flags.map((rf) => {
            const item = (rf && typeof rf === "object" ? rf : {}) as Record<string, unknown>;
            return {
              quoted_clue: typeof item.quoted_clue === "string" ? item.quoted_clue : "",
              plain_explanation:
                typeof item.plain_explanation === "string" ? item.plain_explanation : "",
            };
          })
        : [];

      const translatableInput = {
        headline: typeof rawResult.headline === "string" ? rawResult.headline : "",
        scam_category: typeof rawResult.scam_category === "string" ? rawResult.scam_category : "",
        simple_summary: typeof rawResult.simple_summary === "string" ? rawResult.simple_summary : "",
        red_flags: sourceRedFlags,
        safe_check_steps: Array.isArray(rawResult.safe_check_steps)
          ? rawResult.safe_check_steps.filter((s): s is string => typeof s === "string")
          : [],
        family_share_summary:
          typeof rawResult.family_share_summary === "string"
            ? rawResult.family_share_summary
            : "",
      };

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

      try {
        const translatePrompt = [
          `Translate EVERY field in the following scam-check result JSON into natural, warm, elderly-friendly ${targetLang}.`,
          `RULES:`,
          `1. Write "headline", "scam_category", "simple_summary", "red_flags[].plain_explanation", "safe_check_steps[]", and "family_share_summary" 100% in ${targetLang}. Leave NO English sentences behind if ${targetLang} is Bahasa Melayu or Simplified Chinese (简体中文).`,
          `2. Keep "red_flags[].quoted_clue" EXACTLY unchanged from the input so the original suspicious phrase, link, or phone number stays recognizable.`,
          `3. Preserve numbers, Malaysian entity acronyms (PDRM, LHDN, BNM, MCMC, NSRC 997, Semak Mule, Penipu.my), and plain-language reassurance suitable for a 70-year-old parent.`,
          `Input JSON:\n${JSON.stringify(translatableInput)}`,
        ].join("\n\n");

        const geminiCall = generateWithRetry(
          () =>
            ai.models.generateContent({
              model: "gemini-4-hydrogen",
              contents: translatePrompt,
              config: {
                systemInstruction:
                  "You are JagaCare's protective translator for elderly users in Malaysia. Output only valid JSON strictly in the requested target language, keeping quoted_clue verbatim.",
                responseMimeType: "application/json",
                responseSchema: TRANSLATE_RESPONSE_SCHEMA,
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.LOW,
                },
                abortSignal: controller.signal,
              },
            }),
          controller.signal
        );

        const timeoutPromise = new Promise<never>((_resolve, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new Error("Request timeout after 60 seconds"));
          });
        });

        const response = await Promise.race([geminiCall, timeoutPromise]);
        const responseText = (response.text ?? "").trim();

        if (!responseText) {
          res.status(502).json({ error: "No translation was returned." });
          return;
        }

        const translated = JSON.parse(responseText) as Record<string, unknown>;
        const translatedFlags = Array.isArray(translated.red_flags)
          ? translated.red_flags.map((rf, idx) => {
              const item = (rf && typeof rf === "object" ? rf : {}) as Record<string, unknown>;
              return {
                quoted_clue:
                  sourceRedFlags[idx]?.quoted_clue ??
                  (typeof item.quoted_clue === "string" ? item.quoted_clue : ""),
                plain_explanation:
                  typeof item.plain_explanation === "string"
                    ? item.plain_explanation
                    : sourceRedFlags[idx]?.plain_explanation ?? "",
              };
            })
          : sourceRedFlags;

        res.json({
          ...rawResult,
          headline:
            typeof translated.headline === "string" && translated.headline.trim()
              ? translated.headline
              : translatableInput.headline,
          scam_category:
            typeof translated.scam_category === "string" && translated.scam_category.trim()
              ? translated.scam_category
              : translatableInput.scam_category,
          simple_summary:
            typeof translated.simple_summary === "string" && translated.simple_summary.trim()
              ? translated.simple_summary
              : translatableInput.simple_summary,
          red_flags: translatedFlags,
          safe_check_steps: Array.isArray(translated.safe_check_steps)
            ? translated.safe_check_steps.filter((s): s is string => typeof s === "string")
            : translatableInput.safe_check_steps,
          family_share_summary:
            typeof translated.family_share_summary === "string" &&
            translated.family_share_summary.trim()
              ? translated.family_share_summary
              : translatableInput.family_share_summary,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.error("Translate result error:", err);
      const { status, message } = getFriendlyErrorMessage(err);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JagaCare server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
