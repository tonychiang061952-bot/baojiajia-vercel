import { sql } from './_lib/neon';
import { consumeRateLimit } from './_lib/rateLimit';
import { sendTelegramMessage } from './_lib/telegram';

function body(request: any) {
  if (typeof request.body === 'string') return JSON.parse(request.body || '{}');
  return request.body ?? {};
}

function field(value: unknown, maxLength: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : '';
  if ((required && !result) || result.length > maxLength) throw new Error('Invalid contact submission');
  return result || null;
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!await consumeRateLimit(request, 'contact-submission', 5, 15 * 60)) {
      return response.status(429).json({ error: 'Too many submissions. Please try again later.' });
    }

    const input = body(request);
    const contact = {
      name: field(input.name, 120, true),
      phone: field(input.phone, 40, true),
      line_id: field(input.lineId, 120),
      gender: field(input.gender, 20),
      birth_date: field(input.birthDate, 20),
      occupation: field(input.occupation, 160),
      annual_income: field(input.annualIncome, 80),
      monthly_budget: field(input.monthlyBudget, 80),
      consultation_type: field(input.consultationType, 240),
      additional_message: field(input.additionalMessage, 4000),
      contact_status: 'pending',
    };
    await sql.query(
      `insert into app_records (collection, data) values ('contact_submissions', $1::jsonb)`,
      [JSON.stringify(contact)],
    );

    try {
      await sendTelegramMessage({
        type: 'contact_form_submitted',
        memberName: contact.name ?? '-',
        memberPhone: contact.phone ?? '-',
        contactFormData: {
          lineId: contact.line_id ?? '', gender: contact.gender ?? '', birthDate: contact.birth_date ?? '',
          occupation: contact.occupation ?? '', annualIncome: contact.annual_income ?? '', monthlyBudget: contact.monthly_budget ?? '',
          consultationType: contact.consultation_type ?? '', additionalMessage: contact.additional_message ?? '',
        },
      });
    } catch (error) {
      console.error('Contact notification failed:', error);
    }

    return response.status(201).json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid contact submission') {
      return response.status(400).json({ error: error.message });
    }
    console.error('Contact submission failed:', error);
    return response.status(500).json({ error: 'Unable to submit contact request' });
  }
}
