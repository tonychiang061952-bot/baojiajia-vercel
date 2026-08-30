import { consumeRateLimit } from '../_lib/rateLimit';
import { readSession } from '../_lib/session';
import { sendTelegramMessage } from '../_lib/telegram';

const TYPES = new Set([
  'questionnaire_submitted', 'pdf_downloaded', 'admin_pdf_downloaded', 'review_submitted',
]);

function readBody(request: any) {
  if (typeof request.body === 'string') return JSON.parse(request.body || '{}');
  return request.body ?? {};
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await readSession(request);
    if (!session) return response.status(401).json({ error: 'Authentication required' });
    if (!await consumeRateLimit(request, `telegram:${session.id}`, 10, 10 * 60)) {
      return response.status(429).json({ error: 'Too many notifications. Please try again later.' });
    }

    const { data } = readBody(request);
    if (!data || !TYPES.has(data.type) || typeof data.memberName !== 'string' || data.memberName.length > 120) {
      return response.status(400).json({ error: 'Invalid notification' });
    }
    if (data.type === 'admin_pdf_downloaded' && session.role !== 'admin') {
      return response.status(403).json({ error: 'Admin access required' });
    }

    await sendTelegramMessage({
      ...data,
      memberEmail: session.role === 'admin' && data.type === 'admin_pdf_downloaded'
        ? data.memberEmail
        : session.email,
      adminUser: data.type === 'admin_pdf_downloaded' ? session.email : undefined,
    });
    return response.status(204).end();
  } catch (error) {
    console.error('Telegram notification failed:', error);
    return response.status(500).json({ error: 'Telegram notification failed' });
  }
}
