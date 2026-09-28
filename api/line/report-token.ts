import { createReportToken } from '../_lib/lineReport.js';

// 需求分析做完、填好資料後呼叫：回傳一組領取代碼，前端把它放進「傳到 LINE」的訊息裡。
export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { data, contact } = request.body ?? {};
  if (!data || typeof data !== 'object' || !contact || typeof contact.name !== 'string' || !contact.name.trim()) {
    return response.status(400).json({ error: 'Missing questionnaire data or name' });
  }

  try {
    const token = createReportToken({
      data,
      contact: {
        name: String(contact.name).slice(0, 50),
        phone: String(contact.phone ?? '').slice(0, 20),
        city: String(contact.city ?? '').slice(0, 20),
        lineId: String(contact.lineId ?? '').slice(0, 50),
      },
      issuedAt: Date.now(),
    });
    return response.status(200).json({ token });
  } catch (error) {
    console.error('report-token failed', error);
    return response.status(500).json({ error: 'Unable to create report token' });
  }
}
