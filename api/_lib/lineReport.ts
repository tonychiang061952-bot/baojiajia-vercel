import { createHmac, timingSafeEqual } from 'node:crypto';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import { requiredEnv } from './env.js';

// 領取代碼＝問卷答案壓縮後加上簽章。資料全在代碼裡，不需要存進資料庫；
// 簽章用 LINE channel secret 算，別人改過內容或自己亂編，驗證就過不了。
// 代碼 30 天後失效。

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface ReportPayload {
  data: Record<string, unknown>;
  contact: { name: string; phone: string; city: string; lineId: string };
  issuedAt: number;
}

function base64url(buffer: Buffer) {
  return buffer.toString('base64url');
}

function sign(body: string) {
  return base64url(createHmac('sha256', requiredEnv('LINE_CHANNEL_SECRET')).update(body).digest()).slice(0, 22);
}

export function createReportToken(payload: ReportPayload) {
  const body = base64url(deflateRawSync(Buffer.from(JSON.stringify(payload))));
  return `${body}.${sign(body)}`;
}

export function readReportToken(token: string): ReportPayload | null {
  const [body, signature] = token.trim().split('.');
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const payload = JSON.parse(inflateRawSync(Buffer.from(body, 'base64url')).toString()) as ReportPayload;
    if (!payload?.data || !payload.contact || Date.now() - payload.issuedAt > MAX_AGE_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
