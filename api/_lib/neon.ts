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

// line-report-test 分支專用：預覽站和正式站共用同一個資料庫，
// 測試期間只准讀、不准寫，免得測試資料混進正式名單。這個分支不可合併進 main。
const READ_ONLY_STATEMENT = /^\s*(select|with)\b/i;
const WRITE_KEYWORD = /\b(insert|update|delete|merge|alter|drop|create|truncate|grant)\b/i;

export const sql = {
  query(statement: string, params?: unknown[]) {
    if (!READ_ONLY_STATEMENT.test(statement) || WRITE_KEYWORD.test(statement)) {
      return Promise.reject(new Error('line-report-test: database writes are disabled on this preview'));
    }
    return connection().query(statement, params);
  },
};
