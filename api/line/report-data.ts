import { readReportToken } from '../_lib/lineReport.js';

// 報告連結打開時呼叫：驗證代碼的簽章，回傳問卷答案與聯絡資料。
// 解壓縮放在伺服器做，因為 LINE 內建瀏覽器不一定支援網頁端解壓縮。
export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const token = typeof request.body?.token === 'string' ? request.body.token : '';
  const payload = token ? readReportToken(token) : null;
  if (!payload) return response.status(400).json({ error: 'Invalid or expired report token' });

  return response.status(200).json({ data: payload.data, contact: payload.contact });
}
