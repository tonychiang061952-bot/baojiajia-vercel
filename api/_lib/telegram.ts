import { sql } from './neon.js';

type NotificationData = {
  type: 'questionnaire_submitted' | 'pdf_downloaded' | 'admin_pdf_downloaded' | 'contact_form_submitted' | 'review_submitted';
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  memberCity?: string;
  planType?: 'adult' | 'child';
  timestamp?: string | Date;
  adminUser?: string;
  questionnaireData?: Record<string, unknown>;
  contactFormData?: Record<string, string>;
  reviewData?: { rating?: number; content?: string; role?: string };
};

const OPTIONS_MAP: Record<string, Record<string, string>> = {
  insuranceKnowledge: {
    A: '完全清楚', B: '大概知道，但細節不清楚', C: '不太清楚，別人幫我規劃的', D: '完全不了解', E: '沒有規劃過保障',
  },
  policyCheckExpectations: {
    A: '降低保費，提高保障', B: '避免買到「地雷保單」', C: '避免您重複或過度投保', D: '審視保障內容符合您的個人需求',
  },
  monthlyBudget: { A: '3000 以下', B: '3000~5000 元', C: '5000~10000 元', D: '10000 以上' },
  gender: { male: '男', female: '女' },
  roomType: { single: '單人房', double: '雙人房', 'health-insurance': '健保房' },
  surgerySubsidy: {
    complete: '全額負擔 (30-40萬)', full: '全額負擔 (30-40萬)', recommended: '建議額度 (20-30萬)', partial: '基本額度 (10-20萬)', basic: '基本額度 (10-20萬)',
  },
};

const text = (value: unknown, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
};

const numberText = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString('zh-TW') : '0';
};

const label = (category: string, value: unknown) => text(OPTIONS_MAP[category]?.[String(value)] ?? value);

function formatQuestionnaireDetails(data?: Record<string, unknown>) {
  if (!data) return '';
  const expectations = Array.isArray(data.policyCheckExpectations)
    ? data.policyCheckExpectations.map((value) => label('policyCheckExpectations', value)).join('、')
    : '-';

  return `\n📋 <b>問卷詳細內容：</b>\n------------------\n<b>【基本資料】</b>\n• 性別：${label('gender', data.gender)}\n• 生日：${text(data.birthDate)}\n• 職業：${text(data.occupation)}\n\n<b>【醫療需求】</b>\n• 病房：${label('roomType', data.roomType)}\n• 日額：${numberText(data.hospitalDaily)} 元\n• 手術：${label('surgerySubsidy', data.surgerySubsidy)}\n\n<b>【重症與長照】</b>\n• 薪資損失：${Math.round(Number(data.salaryLoss) / 10000) || 0} 萬/月\n• 生活開銷：${Math.round(Number(data.livingExpense) * 12 / 10000) || 0} 萬/年\n• 治療費用：${Math.round(Number(data.treatmentCost) / 10000) || 0} 萬\n• 長照需求：${Math.round(Number(data.longTermCare) / 10000) || 0} 萬/月\n\n<b>【財務狀況】</b>\n• 家人照顧：${numberText(data.familyCare)} 元\n• 個人負債：${numberText(data.personalDebt)} 元\n• 月收入：${Math.round(Number(data.monthlyIncome) / 10000) || 0} 萬\n\n<b>【其他評估】</b>\n• 保險了解：${label('insuranceKnowledge', data.insuranceKnowledge)}\n• 健診期望：${expectations}\n• 每月預算：${label('monthlyBudget', data.monthlyBudget)}`;
}

export function formatTelegramMessage(data: NotificationData) {
  const timestamp = new Date(data.timestamp ?? Date.now()).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const planType = data.planType === 'child' ? '兒童版' : '成人版';

  switch (data.type) {
    case 'questionnaire_submitted':
      return `🆕 <b>新會員問卷提交</b>\n\n👤 <b>姓名：</b>${text(data.memberName)}\n📧 <b>Email：</b>${text(data.memberEmail)}\n📱 <b>電話：</b>${text(data.memberPhone, '未提供')}\n🏠 <b>居住地：</b>${text(data.memberCity, '未提供')}\n📋 <b>方案類型：</b>${planType}\n⏰ <b>提交時間：</b>${timestamp}${formatQuestionnaireDetails(data.questionnaireData)}\n\n💡 可至後台查看完整資料或下載 CSV。`;
    case 'pdf_downloaded':
      return `📄 <b>會員下載分析報告</b>\n\n👤 <b>姓名：</b>${text(data.memberName)}\n📧 <b>Email：</b>${text(data.memberEmail)}\n📱 <b>電話：</b>${text(data.memberPhone, '未提供')}\n🏠 <b>居住地：</b>${text(data.memberCity, '未提供')}\n📋 <b>方案類型：</b>${planType}\n⏰ <b>下載時間：</b>${timestamp}\n\n✅ 會員已成功下載保障需求分析報告 PDF。`;
    case 'admin_pdf_downloaded':
      return `🔧 <b>管理員下載會員報告</b>\n\n👤 <b>會員姓名：</b>${text(data.memberName)}\n📧 <b>會員 Email：</b>${text(data.memberEmail)}\n👨‍💼 <b>操作管理員：</b>${text(data.adminUser, '未知')}\n📋 <b>方案類型：</b>${planType}\n⏰ <b>下載時間：</b>${timestamp}\n\n📊 管理員已從後台下載會員的分析報告。`;
    case 'contact_form_submitted': {
      const contact = data.contactFormData;
      return `📞 <b>新聯絡諮詢單</b>\n\n👤 <b>姓名：</b>${text(data.memberName)}\n📱 <b>電話：</b>${text(data.memberPhone)}\n💬 <b>Line ID：</b>${text(contact?.lineId)}\n⏰ <b>提交時間：</b>${timestamp}\n\n<b>【諮詢詳情】</b>\n• 性別：${text(contact?.gender)}\n• 生日：${text(contact?.birthDate)}\n• 職業：${text(contact?.occupation)}\n• 年收：${text(contact?.annualIncome)}\n• 預算：${text(contact?.monthlyBudget)}\n• 需求：${text(contact?.consultationType)}\n\n📝 <b>留言內容：</b>\n${text(contact?.additionalMessage, '無')}`;
    }
    case 'review_submitted': {
      const review = data.reviewData;
      const rating = Math.min(5, Math.max(1, Number(review?.rating) || 5));
      const content = String(review?.content ?? '');
      const preview = `${content.slice(0, 80)}${content.length > 80 ? '…' : ''}`;
      return `⭐ <b>新評價待審核</b>\n\n👤 <b>姓名：</b>${text(data.memberName)}\n📧 <b>Email：</b>${text(data.memberEmail, '未提供')}\n💼 <b>身份：</b>${text(review?.role, '未填寫')}\n${'⭐'.repeat(rating)} (${rating} 星)\n⏰ <b>時間：</b>${timestamp}\n\n📝 <b>評價內容：</b>\n${text(preview)}\n\n💡 請至後台「真實評價」審核此評價。`;
    }
    default:
      return `📢 <b>系統通知</b>\n\n⏰ <b>時間：</b>${timestamp}`;
  }
}

async function getSettings() {
  const rows = await sql.query(
    `select data from app_records
     where collection = 'system_settings'
       and data->>'setting_key' = any($1::text[])`,
    [['telegram_bot_token', 'telegram_chat_id', 'telegram_notifications_enabled']],
  );
  const settings = Object.fromEntries(rows.map((row) => [row.data.setting_key, row.data.setting_value]));
  return {
    token: settings.telegram_bot_token,
    chatId: settings.telegram_chat_id,
    enabled: settings.telegram_notifications_enabled === 'true',
  };
}

export async function sendTelegramMessage(data: NotificationData) {
  const settings = await getSettings();
  if (!settings.enabled || !settings.token || !settings.chatId) return false;
  const response = await fetch(`https://api.telegram.org/bot${settings.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: settings.chatId,
      text: formatTelegramMessage(data),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  if (!response.ok) throw new Error('Telegram rejected notification');
  return true;
}
