import { neon } from '@neondatabase/serverless';
import { requiredEnv } from './env';

export const sql = neon(requiredEnv('DATABASE_URL'));
