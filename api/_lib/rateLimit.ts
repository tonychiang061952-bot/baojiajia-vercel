import { createHash } from 'node:crypto';
import { sql } from './neon.js';

function clientIp(request: { headers?: Record<string, string | string[] | undefined> }) {
  const forwarded = request.headers?.['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || request.headers?.['x-real-ip'] || 'unknown';
}

export async function consumeRateLimit(
  request: { headers?: Record<string, string | string[] | undefined> },
  scope: string,
  limit: number,
  windowSeconds: number,
) {
  const fingerprint = createHash('sha256').update(`${scope}:${clientIp(request)}`).digest('hex');
  const rows = await sql.query(
    `insert into request_rate_limits (bucket, hits, expires_at)
     values ($1, 1, now() + ($3 * interval '1 second'))
     on conflict (bucket) do update
       set hits = case when request_rate_limits.expires_at <= now() then 1 else request_rate_limits.hits + 1 end,
           expires_at = case
             when request_rate_limits.expires_at <= now() then now() + ($3 * interval '1 second')
             else request_rate_limits.expires_at
           end
       where request_rate_limits.expires_at <= now() or request_rate_limits.hits < $2
     returning hits, expires_at`,
    [`${scope}:${fingerprint}`, limit, windowSeconds],
  );
  return rows.length > 0;
}
