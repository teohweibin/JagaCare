import type { HistoryEntry } from '../types';

export type ScamTrendKey =
  | 'impersonation'
  | 'phishing'
  | 'investment'
  | 'payment'
  | 'safe'
  | 'other';

export interface ScamTrendDatum {
  key: ScamTrendKey;
  label: string;
  count: number;
  percentage: number;
  riskyCount: number;
  color: string;
}

const TREND_COLORS: Record<ScamTrendKey, string> = {
  impersonation: '#8257E5',
  phishing: '#DC2626',
  investment: '#D97706',
  payment: '#2563EB',
  other: '#6D28D9',
  safe: '#16A34A',
};

export function classifyScamTrend(entry: HistoryEntry): ScamTrendKey {
  if (entry.result.verdict === 'SAFE') {
    return 'safe';
  }

  const combined = [
    entry.result.scam_category,
    entry.result.headline,
    entry.result.simple_summary,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // 1. Investment, Crypto, Task/Job & Easy Loan Scams
  if (
    /(invest|pelaburan|saham|forex|crypto|bitcoin|kripto|投资|股票|加密货币|外汇|理财|job|kerja|part[- ]?time|tugasan|vip task|兼职|刷单|任务|guaranteed profit|keuntungan|高回报|稳赚|pinjaman|loan|贷款|lottery|prize|hadiah|cabutan|中奖)/.test(
      combined
    )
  ) {
    return 'investment';
  }

  // 2. Phishing, Malicious Links, .APK & OTP/Account Hijack
  if (
    /(phish|pancingan|钓鱼|假网站|fake website|fake link|pautan palsu|suspicious link|可疑链接|malicious|\.apk|\bapk\b|恶意软件|安装应用|otp|\btac\b|verification code|kod pengesahan|验证码|hijack|takeover|godam|盗号|suspended|digantung|dibekukan|冻结|暂停)/.test(
      combined
    )
  ) {
    return 'phishing';
  }

  // 3. Impersonation (Authority, Bank, Police/PDRM, LHDN, MCMC, Courier/Parcel, Family)
  if (
    /(impersonat|penyamaran|menyamar|冒充|假冒|fake bank|bank palsu|假银行|police|polis|pdrm|court|mahkamah|警察|法庭|lhdn|hasil|kwsp|epf|mcmc|kkmm|税收|政府|authority|pihak berkuasa|官方|courier|parcel|poslaju|pos laju|j&t|dhl|ninjavan|kurier|bungkusan|customs|kastam|快递|包裹|海关|family|friend|keluarga|rakan|亲友|熟人)/.test(
      combined
    )
  ) {
    return 'impersonation';
  }

  // 4. Payment, Mule Bank Accounts & Online Seller / E-Commerce Fraud
  if (
    /(mule|keldai|人头|bank account|akaun bank|银行账号|账户|seller|penjual|pembeli|卖家|网购|e-?commerce|shopping|beli[- ]?belah|deposit|pendahuluan|transfer|pindah wang|转账|汇款|收款)/.test(
      combined
    )
  ) {
    return 'payment';
  }

  if (entry.inputType === 'phone') {
    return 'impersonation';
  }
  if (entry.inputType === 'bank') {
    return 'payment';
  }

  return 'other';
}

export function buildScamTrendData(
  history: HistoryEntry[],
  labels: Record<ScamTrendKey, string>
): ScamTrendDatum[] {
  if (history.length === 0) return [];

  const buckets = new Map<
    ScamTrendKey,
    { count: number; riskyCount: number }
  >();

  for (const entry of history) {
    const key = classifyScamTrend(entry);
    const current = buckets.get(key) ?? { count: 0, riskyCount: 0 };
    current.count += 1;
    if (entry.result.verdict === 'STOP' || entry.result.verdict === 'WAIT') {
      current.riskyCount += 1;
    }
    buckets.set(key, current);
  }

  const total = history.length;

  return Array.from(buckets.entries())
    .map(([key, stats]) => ({
      key,
      label: labels[key],
      count: stats.count,
      percentage: Math.round((stats.count / total) * 100),
      riskyCount: stats.riskyCount,
      color: TREND_COLORS[key],
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (a.key === 'safe') return 1;
      if (b.key === 'safe') return -1;
      return a.label.localeCompare(b.label);
    });
}
