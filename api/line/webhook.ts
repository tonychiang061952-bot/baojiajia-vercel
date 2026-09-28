import { createHmac, timingSafeEqual } from 'node:crypto';
import { requiredEnv } from '../_lib/env.js';
import { readReportToken } from '../_lib/lineReport.js';

// LINE 官方帳號的 Webhook：客人傳來「領取報告 <代碼>」，就回覆他的報告連結。
// 用的是 reply（回覆），不是 push（推播），不算官方帳號每月的訊息則數。

const CLAIM_PREFIX = '領取報告';

function readRawBody(request: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function validSignature(rawBody: Buffer, signature: string | undefined) {
  if (!signature) return false;
  const expected = Buffer.from(createHmac('sha256', requiredEnv('LINE_CHANNEL_SECRET')).update(rawBody).digest('base64'));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

async function reply(replyToken: string, text: string) {
  const result = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requiredEnv('LINE_CHANNEL_ACCESS_TOKEN')}`,
    },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
  });
  if (!result.ok) console.error('LINE reply failed', result.status, await result.text());
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') return response.status(200).send('ok');

  const rawBody = await readRawBody(request);
  if (!validSignature(rawBody, request.headers['x-line-signature'])) {
    return response.status(401).json({ error: 'Invalid signature' });
  }

  const events = JSON.parse(rawBody.toString() || '{}').events ?? [];
  const origin = `https://${request.headers['x-forwarded-host'] ?? request.headers.host}`;

  for (const event of events) {
    if (event.type !== 'message' || event.message?.type !== 'text' || !event.replyToken) continue;
    const text: string = event.message.text ?? '';
    if (!text.startsWith(CLAIM_PREFIX)) continue;

    const token = text.slice(CLAIM_PREFIX.length).trim();
    const payload = readReportToken(token);
    if (!payload) {
      await reply(event.replyToken, '這組領取代碼無法辨識或已經過期了。請回到網站重新產生報告，再按「傳送到 LINE」。');
      continue;
    }

    // openExternalBrowser=1：LINE 會改用手機預設的瀏覽器打開，LINE 內建瀏覽器常擋下載
    const link = `${origin}/analysis?report=${encodeURIComponent(token)}&openExternalBrowser=1`;
    await reply(
      event.replyToken,
      `${payload.contact.name} 你好，你的保障需求分析報告準備好了！\n\n點下面的連結就能下載：\n${link}\n\n看完有任何問題，直接在這裡問我就可以。`,
    );
  }

  return response.status(200).json({ ok: true });
}
