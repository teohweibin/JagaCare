import type { AnalysisResult, ClaimedIdentity, Language, SubmittedInput, Verdict } from '../types';
import { getLocalScamFlag } from './localFlags';

type Copy = Omit<AnalysisResult, 'verdict' | 'extracted_phone_numbers'>;

const COPY: Record<Language, Record<'stop' | 'wait' | 'safe' | 'upload', Copy>> = {
  en: {
    stop: { headline: 'Stop — this looks like a scam', scam_category: 'Possible scam', simple_summary: 'This has signs of someone trying to rush or trick you. Do not reply, click, install anything, or send money.', red_flags: [{ quoted_clue: 'Urgent request or suspicious detail', plain_explanation: 'Real organisations do not pressure you to act immediately by message.' }], safe_check_steps: ['Do not use any link or phone number in the message.', 'Call the official number on your card or official website, or ask family to check with you.'], family_share_summary: 'I received something that may be a scam. Please look at it with me before I do anything.' },
    wait: { headline: 'Wait and check first', scam_category: 'Needs verification', simple_summary: 'There is not enough information to call this safe. Please verify it using an official contact before acting.', red_flags: [{ quoted_clue: 'Unfamiliar sender or request', plain_explanation: 'A message can look genuine even when it is not.' }], safe_check_steps: ['Do not send money, personal details, OTP or TAC codes.', 'Find the organisation’s official number yourself and call it.'], family_share_summary: 'Could you help me check this message before I respond or pay anything?' },
    safe: { headline: 'No clear scam sign found', scam_category: 'No obvious warning', simple_summary: 'This demo did not find a common warning sign. It cannot prove that a message or caller is safe.', red_flags: [{ quoted_clue: 'No common scam phrase found', plain_explanation: 'Scammers can use new wording, so it is still wise to be careful.' }], safe_check_steps: ['Never share OTP, TAC, passwords, or bank details.', 'If money is involved, verify independently with the official organisation.'], family_share_summary: 'I checked this in the JagaCare demo. It did not show an obvious warning, but please help me verify it if money is involved.' },
    upload: { headline: 'Demo preview: check the example', scam_category: 'Illustrative upload check', simple_summary: 'This free demo does not read uploaded photos or voice notes. It shows how JagaCare would guide a person to pause and verify.', red_flags: [{ quoted_clue: 'Uploaded file', plain_explanation: 'A live version would inspect the contents; this public demo deliberately does not send your file anywhere.' }], safe_check_steps: ['Do not act on instructions in the file until you verify them.', 'Use the message examples or enter a phone or bank test number to explore the full demo.'], family_share_summary: 'I used the JagaCare demo to see the safety steps. Please help me verify this file before I act.' },
  },
  ms: {
    stop: { headline: 'Berhenti — ini nampak seperti penipuan', scam_category: 'Kemungkinan penipuan', simple_summary: 'Ini ada tanda seseorang cuba mendesak atau memperdaya anda. Jangan balas, tekan pautan, pasang apa-apa, atau hantar wang.', red_flags: [{ quoted_clue: 'Permintaan segera atau butiran mencurigakan', plain_explanation: 'Organisasi sebenar tidak mendesak anda bertindak segera melalui mesej.' }], safe_check_steps: ['Jangan gunakan pautan atau nombor telefon dalam mesej itu.', 'Hubungi nombor rasmi pada kad atau laman web rasmi, atau minta keluarga semak bersama anda.'], family_share_summary: 'Saya menerima sesuatu yang mungkin penipuan. Tolong lihat bersama saya sebelum saya buat apa-apa.' },
    wait: { headline: 'Tunggu dan semak dahulu', scam_category: 'Perlu pengesahan', simple_summary: 'Maklumat belum cukup untuk menganggapnya selamat. Sahkan melalui saluran rasmi sebelum bertindak.', red_flags: [{ quoted_clue: 'Pengirim atau permintaan tidak dikenali', plain_explanation: 'Mesej boleh nampak asli walaupun sebenarnya tidak.' }], safe_check_steps: ['Jangan hantar wang, butiran peribadi, kod OTP atau TAC.', 'Cari nombor rasmi organisasi itu sendiri dan hubungi mereka.'], family_share_summary: 'Boleh tolong saya semak mesej ini sebelum saya membalas atau membuat bayaran?' },
    safe: { headline: 'Tiada tanda penipuan jelas ditemui', scam_category: 'Tiada amaran jelas', simple_summary: 'Demo ini tidak menemui tanda amaran biasa. Ia tidak boleh membuktikan mesej atau pemanggil itu selamat.', red_flags: [{ quoted_clue: 'Tiada frasa penipuan biasa ditemui', plain_explanation: 'Penipu boleh menggunakan ayat baru, jadi terus berhati-hati.' }], safe_check_steps: ['Jangan sesekali kongsi OTP, TAC, kata laluan atau butiran bank.', 'Jika melibatkan wang, sahkan sendiri dengan organisasi rasmi.'], family_share_summary: 'Saya menyemak ini dalam demo JagaCare. Tiada amaran jelas, tetapi tolong bantu saya sahkan jika melibatkan wang.' },
    upload: { headline: 'Pratonton demo: semak contoh', scam_category: 'Semakan muat naik contoh', simple_summary: 'Demo percuma ini tidak membaca foto atau nota suara yang dimuat naik. Ia menunjukkan cara JagaCare meminta anda berhenti dan mengesahkan.', red_flags: [{ quoted_clue: 'Fail dimuat naik', plain_explanation: 'Versi langsung akan memeriksa kandungan; demo awam ini tidak menghantar fail anda ke mana-mana.' }], safe_check_steps: ['Jangan ikut arahan dalam fail sebelum anda mengesahkannya.', 'Gunakan contoh mesej atau nombor ujian untuk meneroka demo penuh.'], family_share_summary: 'Saya menggunakan demo JagaCare untuk melihat langkah keselamatan. Tolong bantu saya sahkan fail ini sebelum bertindak.' },
  },
  zh: {
    stop: { headline: '停止——这看起来像骗局', scam_category: '可能的诈骗', simple_summary: '这里有催促或欺骗您的迹象。请不要回复、点击、安装任何东西或转账。', red_flags: [{ quoted_clue: '紧急要求或可疑细节', plain_explanation: '真正的机构不会通过短信催促您马上行动。' }], safe_check_steps: ['不要使用信息中的链接或电话号码。', '请自行找到卡片或官网上的官方号码，或请家人和您一起核实。'], family_share_summary: '我收到的内容可能是诈骗。请在我做任何事前和我一起看看。' },
    wait: { headline: '先等一等，再核实', scam_category: '需要核实', simple_summary: '资料不足，不能说它安全。请通过官方渠道核实后再行动。', red_flags: [{ quoted_clue: '不熟悉的发件人或要求', plain_explanation: '信息看起来真实，也可能并不是真的。' }], safe_check_steps: ['不要转账、提供个人资料、OTP 或 TAC 验证码。', '请自行寻找该机构的官方号码并致电。'], family_share_summary: '您能帮我核实这条信息吗？我回复或付款前想先确认。' },
    safe: { headline: '未发现明显诈骗迹象', scam_category: '没有明显警告', simple_summary: '此演示没有发现常见警告迹象，但不能证明信息或来电安全。', red_flags: [{ quoted_clue: '未发现常见诈骗用语', plain_explanation: '骗子会使用新说法，所以仍要小心。' }], safe_check_steps: ['绝不要分享 OTP、TAC、密码或银行资料。', '涉及金钱时，请自行向官方机构核实。'], family_share_summary: '我在 JagaCare 演示中检查了这项内容。它没有显示明显警告，但如果涉及钱，请帮我核实。' },
    upload: { headline: '演示预览：检查示例', scam_category: '示例上传检查', simple_summary: '这个免费演示不会读取上传的照片或语音。它会展示 JagaCare 如何引导用户暂停并核实。', red_flags: [{ quoted_clue: '已上传的文件', plain_explanation: '正式版本会检查内容；这个公开演示不会把您的文件发送到任何地方。' }], safe_check_steps: ['在核实之前，请不要遵照文件中的指示。', '请使用消息示例或输入测试号码，探索完整演示。'], family_share_summary: '我用 JagaCare 演示查看了安全步骤。请在我行动前帮我核实这个文件。' },
  },
};

const RISK_PATTERN = /\b(otp|tac|password|pin|verify|verification|blocked|suspended|urgent|immediately|click|link|transfer|payment|parcel|delivery|police|pdrm|lhdn|bank|apk|bitcoin|crypto|investment|refund|prize|winner)\b|https?:\/\/|\.apk/i;
const MONEY_PATTERN = /\b(transfer|payment|bank|otp|tac|apk|urgent|police|pdrm|lhdn)\b|https?:\/\/|\.apk/i;

function phoneNumbers(text: string) { return text.match(/(?:\+?60|0)1\d[-\s]?\d{3,4}[-\s]?\d{3,4}/g) ?? []; }

export function analyzeDemo(input: SubmittedInput, language: Language): AnalysisResult {
  if (input.type === 'image' || input.type === 'audio') return { verdict: 'WAIT', ...COPY[language].upload, extracted_phone_numbers: [] };
  if (input.type === 'phone') {
    const flag = getLocalScamFlag('phone', input.phoneNumber, language);
    const verdict: Verdict = flag || input.claimedIdentity === 'bank' || input.claimedIdentity === 'police_gov' ? 'STOP' : 'WAIT';
    const base = COPY[language][verdict === 'STOP' ? 'stop' : 'wait'];
    return { verdict, ...base, red_flags: flag ? [{ quoted_clue: input.phoneNumber ?? '', plain_explanation: flag.reason }] : base.red_flags, extracted_phone_numbers: input.phoneNumber ? [input.phoneNumber] : [] };
  }
  if (input.type === 'bank') {
    const flag = getLocalScamFlag('bank', input.bankAccount, language);
    const base = COPY[language][flag ? 'stop' : 'wait'];
    return { verdict: flag ? 'STOP' : 'WAIT', ...base, red_flags: flag ? [{ quoted_clue: input.bankAccount ?? '', plain_explanation: flag.reason }] : base.red_flags, extracted_phone_numbers: [] };
  }
  const text = input.text ?? '';
  const verdict: Verdict = MONEY_PATTERN.test(text) ? 'STOP' : RISK_PATTERN.test(text) ? 'WAIT' : 'SAFE';
  return { verdict, ...COPY[language][verdict.toLowerCase() as 'stop' | 'wait' | 'safe'], extracted_phone_numbers: phoneNumbers(text) };
}

export function translateDemo(result: AnalysisResult, language: Language): AnalysisResult {
  const key = result.verdict.toLowerCase() as 'stop' | 'wait' | 'safe';
  return { ...result, ...COPY[language][key] };
}
