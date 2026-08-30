import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { requiredEnv } from './env.js';

let client: NeonQueryFunction<false, false> | null = null;

// Created on first query rather than at import time: a missing or malformed
// DATABASE_URL would otherwise throw while the module loads, which Vercel
// reports as FUNCTION_INVOCATION_FAILED for every endpoint with no usable
// error. Deferring it lets each handler's catch turn it into a JSON 500.
function connection(): NeonQueryFunction<false, false> {
  if (!client) client = neon(requiredEnv('DATABASE_URL'));
  return client;
}

export const sql = {
  query(statement: string, params?: unknown[]) {
    return connection().query(statement, params);
  },
};
