# JagaCare

> Calm, elderly-friendly anti-scam checker for WhatsApp, Telegram, SMS, screenshots, and voice notes.

JagaCare lets a senior (or the family member helping them) paste a suspicious message, upload a screenshot or voice note, or type in a phone number or bank account — and get back a plain-language verdict: **STOP**, **WAIT**, or **SAFE**. Explanations are written the way you'd explain something to a 70-year-old parent, in **English, Bahasa Melayu, or 简体中文**, with no technical jargon.

Built around Malaysian scam patterns: fake PDRM/LHDN calls, Macau Scam, mule accounts, fake parcel notices, `.apk` installers, and OTP/TAC requests.

---

## Features

**Five ways to check something**

| Tab | What it takes | What it does |
| --- | --- | --- |
| Message | Pasted text | Analyses wording, links, urgency tactics |
| Message | Screenshot (≤20 MB) | Reads the image for fake bank alerts, fake receipts, suspicious links |
| Message | Voice note (≤18 MB) | Listens for scam scripts and pressure tactics |
| Phone | Malaysian or foreign number | Rule checks + live PenipuMY scam-report lookup |
| Bank | Account number + bank | Mule-account guidance; never returns SAFE |

**Safety rules enforced in code, not just in the prompt**

The server computes its own assessment before calling the model and injects it as a hard constraint:

- A bank account check can **never** come back `SAFE` — an unfamiliar account can't be cleared from its number alone.
- If the sender claims to be a bank, police, LHDN, or MCMC and is asking for a transfer, the verdict is forced to `STOP`.
- Requests for money, bank details, 6-digit OTP/TAC codes, or `.apk` installs are never labelled `SAFE`.
- Bank hotline numbers are checked against a built-in allowlist of real Malaysian hotlines, so the model can't invent one.
- Numbers or accounts flagged earlier on the device (stored in `localStorage`) force a `STOP` on the next check.

**Around the result**

- **Family share** — a two-sentence WhatsApp-ready summary, sendable to a saved trusted contact.
- **Emergency screen** — step-by-step rescue flows for three situations (money already transferred, `.apk` installed, OTP shared), plus a one-tap `tel:997` call to Malaysia's NSRC and direct dial buttons for Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank, and Bank Islam fraud lines.
- **Official-link shortcuts** — PDRM Semak Mule, Pos Laju and J&T tracking, BNM scam alerts.
- **Translate a result** in place without re-running the analysis.
- **Local history** of past checks, kept on the device.
- **Onboarding guide** for first-time users.

---

## Tech stack

- **Frontend** — React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, lucide-react
- **Backend** — Express 4 on Node, `multer` for uploads, Vite in middleware mode during development
- **AI** — `@google/genai` (Gemini) with a strict JSON response schema and retry-on-failure
- **External data** — PenipuMY API for phone scam reports (optional)

---

## Getting started

### Prerequisites

- Node 20+ (or Bun — a `bun.lock` is committed)
- A Gemini API key

### Install

```bash
git clone https://github.com/teohweibin/JagaCare.git
cd JagaCare
npm install
```

### Configure

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Gemini API calls. Without it, `/api/analyze` returns a 500. |
| `APP_URL` | No | Public URL of the deployment, for self-referential links |
| `PENIPUMY_KEY` | No | Live PenipuMY phone lookups. Without it, phone checks still run on the built-in rules. |
| `PORT` | No | Server port (default `3000`) |

### Run

```bash
npm run dev      # Express + Vite middleware, hot reload
npm run build    # production bundle to dist/
npm start        # serve dist/ via Express (set NODE_ENV=production)
npm run lint     # tsc --noEmit
```

Open http://localhost:3000.

> Set `DISABLE_HMR=true` to turn off file watching and HMR (used when an agent is editing files).

---

## API

| Method | Route | Body / query | Returns |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | `{ ok: true }` |
| `GET` | `/api/check-phone` | `?q=<phone>` | PenipuMY lookup summary |
| `POST` | `/api/analyze` | JSON or `multipart/form-data` | `AnalysisResult` |
| `POST` | `/api/translate-result` | `{ result, targetLanguage }` | Translated `AnalysisResult` |

`POST /api/analyze` accepts `text`, `phoneNumber`, `bankAccount`, `bankName`, `claimedIdentity`, `localFlagReason`, and `language`, plus optional `image` and `audio` file fields. `claimedIdentity` is one of `bank`, `police_gov`, `courier`, `family`, `seller`, `not_sure`.

A result looks like:

```json
{
  "verdict": "STOP",
  "headline": "This is a fake bank message",
  "scam_category": "Fake Bank Alert",
  "simple_summary": "Someone is pretending to be your bank to scare you into clicking a link.",
  "red_flags": [
    {
      "quoted_clue": "akaun anda akan disekat dalam 24 jam",
      "plain_explanation": "Real banks do not threaten to close your account by SMS."
    }
  ],
  "safe_check_steps": [
    "Do not click the link in the message.",
    "Call the number printed on the back of your bank card instead."
  ],
  "family_share_summary": "I got a message saying my bank account will be blocked. Can you check it with me before I do anything?"
}
```

---

## Project structure

```
server.ts                  Express server, Gemini prompt, safety rules, PenipuMY lookup
index.html                 Vite entry
src/
  App.tsx                  App state, screen routing, API calls
  types.ts                 Shared types (Verdict, AnalysisResult, HistoryEntry, …)
  i18n/translations.ts     en / ms / zh copy, hotlines, official links
  components/              HomeScreen, ResultsScreen, EmergencyScreen, FamilyModal,
                           OnboardingGuide, Header, StackedCard, illustrations
  utils/
    formatters.ts          Display formatting
    localFlags.ts          On-device scam flags + demo test numbers
```

### Demo values

`src/utils/localFlags.ts` ships built-in test entries so the STOP path can be demonstrated without a real scam — for example the phone numbers `011-5555 8888` (fake police / Macau Scam) and `018-999 4444` (fake parcel / LHDN).

---

## Limitations

- JagaCare is a **second opinion, not a verdict**. It can be wrong in both directions. Always verify with a bank's official hotline or a trusted family member before acting.
- A bank account check cannot confirm an account is safe — it can only warn.
- Phone intelligence depends on PenipuMY coverage; an unreported scam number will look unremarkable.
- History and flags live in `localStorage` on one device; nothing is synced.

If money has already moved, call **NSRC 997** (24/7) first.

---

## License

No license file is present. All rights reserved by the author unless one is added.
