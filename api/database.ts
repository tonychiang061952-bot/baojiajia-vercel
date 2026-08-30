import { sql } from './_lib/neon';
import { readSession } from './_lib/session';

const COLLECTIONS = new Set([
  'about_content', 'blog_categories', 'blog_posts', 'carousel_settings',
  'contact_info', 'contact_submissions', 'core_values', 'customer_reviews',
  'features', 'hero_carousel', 'homepage_content', 'member_submissions',
  'navigation_items', 'pdf_templates', 'service_details', 'service_items',
  'site_settings', 'statistics', 'system_settings', 'team_members',
  'testimonials', 'user_download_limits',
]);

const PUBLIC_READ_COLLECTIONS = new Set([
  'about_content', 'blog_categories', 'blog_posts', 'carousel_settings',
  'contact_info', 'core_values', 'customer_reviews', 'features',
  'hero_carousel', 'homepage_content', 'navigation_items', 'pdf_templates',
  'service_details', 'service_items', 'site_settings', 'statistics',
  'system_settings', 'team_members', 'testimonials',
]);

const PUBLIC_SYSTEM_SETTINGS = new Set([
  'analysis_adult_icon', 'analysis_child_icon', 'reviews_submission_enabled',
]);

const NUMERIC_ORDER_FIELDS = new Set([
  'display_order', 'sort_order', 'download_count', 'download_limit', 'rating',
]);

type Filter = {
  column: string;
  operator: 'eq' | 'neq' | 'ilike' | 'in' | 'is' | 'not' | 'or';
  value?: unknown;
  nestedOperator?: string;
};

type OrCondition = {
  column: string;
  operator: 'eq' | 'ilike';
  value: string;
};

function readBody(request: any) {
  if (typeof request.body === 'string') return JSON.parse(request.body || '{}');
  return request.body ?? {};
}

function validField(field: string) {
  return field === 'id' || field === 'created_at' || field === 'updated_at' || /^[a-z][a-z0-9_]*$/.test(field);
}

function expression(field: string, params: unknown[]) {
  if (!validField(field)) throw new Error('Invalid field');
  if (field === 'id') return 'id::text';
  if (field === 'created_at' || field === 'updated_at') return field;
  params.push(field);
  return `data ->> $${params.length}`;
}

function parseRecord(row: any) {
  return {
    ...(row.data ?? {}),
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function isDatabaseError(error: unknown): error is { code?: string; message?: string } {
  return typeof error === 'object' && error !== null;
}

function toErrorResponse(error: unknown) {
  if (isDatabaseError(error) && error.code === '23505') {
    return { status: 409, error: { message: 'A record with this unique value already exists', code: '23505' } };
  }

  const message = error instanceof Error ? error.message : 'Database request failed';
  const clientMessage = message === 'Not authorized'
    || message === 'Unknown collection'
    || message === 'Invalid database request'
    || message === 'Invalid field'
    || message === 'Invalid or filter'
    || message === 'Invalid in filter'
    || message === 'Unsupported filter'
    || message === 'Payload must be an object'
    || message === 'Upsert requires a valid conflict field'
    || message === 'Upsert conflict value is required'
    || message === 'Unsupported database operation';
  if (clientMessage) {
    return { status: message === 'Not authorized' ? 403 : 400, error: { message } };
  }

  console.error('Database request failed:', error);
  return { status: 500, error: { message: 'Database request failed' } };
}

function addFilters(filters: Filter[], params: unknown[]) {
  const clauses: string[] = [];
  for (const filter of filters) {
    if (filter.operator === 'or') {
      if (!Array.isArray(filter.value) || !filter.value.length) throw new Error('Invalid or filter');
      const orParts = filter.value.map((part): string => {
        if (!part || typeof part !== 'object') throw new Error('Invalid or filter');
        const { column, operator, value } = part as OrCondition;
        if (typeof column !== 'string' || (operator !== 'ilike' && operator !== 'eq') || typeof value !== 'string') {
          throw new Error('Invalid or filter');
        }
        const field = expression(column, params);
        params.push(value);
        return `${field} ${operator === 'ilike' ? 'ilike' : '='} $${params.length}`;
      });
      clauses.push(`(${orParts.join(' or ')})`);
      continue;
    }
    const field = expression(filter.column, params);
    if (filter.operator === 'eq') {
      if (filter.value === null) clauses.push(`${field} is null`);
      else {
        params.push(String(filter.value));
        clauses.push(`${field} = $${params.length}`);
      }
    } else if (filter.operator === 'neq') {
      params.push(String(filter.value));
      clauses.push(`${field} <> $${params.length}`);
    } else if (filter.operator === 'ilike') {
      params.push(String(filter.value));
      clauses.push(`${field} ilike $${params.length}`);
    } else if (filter.operator === 'in') {
      if (!Array.isArray(filter.value)) throw new Error('Invalid in filter');
      params.push(filter.value.map(String));
      clauses.push(`${field} = any($${params.length}::text[])`);
    } else if (filter.operator === 'is') {
      clauses.push(filter.value === null ? `${field} is null` : `${field} is not null`);
    } else if (filter.operator === 'not') {
      if (filter.nestedOperator !== 'is') throw new Error('Unsupported not filter');
      clauses.push(filter.value === null ? `${field} is not null` : `${field} is null`);
    } else {
      throw new Error('Unsupported filter');
    }
  }
  return clauses;
}

function sanitizePayload(payload: unknown) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be an object');
  }
  const clean = { ...(payload as Record<string, unknown>) };
  delete clean.id;
  delete clean.created_at;
  delete clean.updated_at;
  return clean;
}

function normalizePayload(payload: unknown, user: Awaited<ReturnType<typeof readSession>>, collection: string) {
  const clean = sanitizePayload(payload);
  if (user?.role === 'admin') return clean;
  if (!user) return clean;

  if (collection === 'customer_reviews') {
    return {
      ...clean,
      user_id: user.id,
      user_email: user.email,
      user_name: clean.user_name || user.name || user.email,
      avatar_url: clean.avatar_url || user.picture || null,
      is_approved: false,
      is_active: false,
    };
  }

  if (collection === 'member_submissions') {
    return { ...clean, user_id: user.id, email: user.email };
  }

  return clean;
}

function publicRestrictions(collection: string, filters: Filter[]) {
  if (collection === 'customer_reviews') {
    filters.push(
      { column: 'is_approved', operator: 'eq', value: true },
      { column: 'is_active', operator: 'eq', value: true },
    );
  }
  if (collection === 'system_settings') {
    filters.push({
      column: 'setting_key',
      operator: 'in',
      value: [...PUBLIC_SYSTEM_SETTINGS],
    });
  }
}

function ownedRestrictions(collection: string, user: NonNullable<Awaited<ReturnType<typeof readSession>>>, filters: Filter[]) {
  if (collection === 'member_submissions') {
    filters.push({ column: 'user_id', operator: 'eq', value: user.id });
  }
  if (collection === 'user_download_limits') {
    filters.push({ column: 'email', operator: 'eq', value: user.email });
  }
  if (collection === 'customer_reviews') {
    filters.push({ column: 'user_id', operator: 'eq', value: user.id });
  }
}

function authorize(collection: string, operation: string, user: Awaited<ReturnType<typeof readSession>>, filters: Filter[]) {
  if (!COLLECTIONS.has(collection)) throw new Error('Unknown collection');
  if (user?.role === 'admin') return;

  if (operation === 'select' && PUBLIC_READ_COLLECTIONS.has(collection)) {
    publicRestrictions(collection, filters);
    return;
  }

  if (user && ['customer_reviews', 'member_submissions'].includes(collection)) {
    if (operation === 'select' || operation === 'update') {
      ownedRestrictions(collection, user, filters);
    }
    if (operation === 'insert' || operation === 'update' || operation === 'upsert') return;
  }

  throw new Error('Not authorized');
}

async function selectRecords(collection: string, filters: Filter[], order: any[], limit?: number, range?: [number, number]) {
  const params: unknown[] = [collection];
  const where = ['collection = $1', ...addFilters(filters, params)];
  let statement = `select id, data, created_at, updated_at from app_records where ${where.join(' and ')}`;

  if (Array.isArray(order) && order.length) {
    const orderBy = order.map((item) => {
      if (!item || typeof item.column !== 'string' || !validField(item.column)) throw new Error('Invalid sort field');
      const direction = item.ascending === false ? 'desc' : 'asc';
      const raw = item.column === 'id' || item.column === 'created_at' || item.column === 'updated_at'
        ? item.column
        : `data ->> '${item.column}'`;
      const sortable = NUMERIC_ORDER_FIELDS.has(item.column)
        ? `nullif(${raw}, '')::numeric`
        : raw;
      return `${sortable} ${direction} nulls last`;
    });
    statement += ` order by ${orderBy.join(', ')}`;
  }

  const offset = range ? Math.max(0, Number(range[0])) : 0;
  const boundedLimit = range
    ? Math.min(1000, Math.max(1, Number(range[1]) - offset + 1))
    : Math.min(1000, Math.max(1, Number(limit ?? 1000)));
  params.push(boundedLimit, offset);
  statement += ` limit $${params.length - 1} offset $${params.length}`;
  return sql.query(statement, params);
}

async function insertRecords(collection: string, payload: unknown, user: Awaited<ReturnType<typeof readSession>>) {
  const rows = Array.isArray(payload) ? payload : [payload];
  const data = rows.map((item) => normalizePayload(item, user, collection));
  const inserted = await sql.query(
    `insert into app_records (collection, data)
     select $1, item from jsonb_array_elements($2::jsonb) as item
     returning id, data, created_at, updated_at`,
    [collection, JSON.stringify(data)],
  );
  const records = inserted.map(parseRecord);
  return Array.isArray(payload) ? records : records[0];
}

async function updateRecords(collection: string, payload: unknown, filters: Filter[], user: Awaited<ReturnType<typeof readSession>>) {
  const clean = normalizePayload(payload, user, collection);
  const params: unknown[] = [JSON.stringify(clean), collection];
  const where = ['collection = $2', ...addFilters(filters, params)];
  const rows = await sql.query(
    `update app_records set data = data || $1::jsonb, updated_at = now() where ${where.join(' and ')} returning id, data, created_at, updated_at`,
    params,
  );
  return rows.map(parseRecord);
}

async function deleteRecords(collection: string, filters: Filter[]) {
  const params: unknown[] = [collection];
  const where = ['collection = $1', ...addFilters(filters, params)];
  const rows = await sql.query(
    `delete from app_records where ${where.join(' and ')} returning id, data, created_at, updated_at`,
    params,
  );
  return rows.map(parseRecord);
}

async function upsertRecord(collection: string, payload: unknown, conflict: string | undefined, user: Awaited<ReturnType<typeof readSession>>) {
  if (!conflict || !validField(conflict)) throw new Error('Upsert requires a valid conflict field');
  const clean = normalizePayload(payload, user, collection);
  const value = clean[conflict];
  if (value === undefined || value === null) throw new Error('Upsert conflict value is required');
  const filters: Filter[] = [{ column: conflict, operator: 'eq', value }];
  if (user && user.role !== 'admin') ownedRestrictions(collection, user, filters);
  const matches = await selectRecords(collection, filters, [], 1);
  if (!matches.length) return insertRecords(collection, clean, user);
  return updateRecords(collection, clean, [{ column: 'id', operator: 'eq', value: matches[0].id }], user);
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const { collection, operation, filters = [], order = [], limit, range, payload, conflict, mode } = readBody(request);
    if (typeof collection !== 'string' || typeof operation !== 'string' || !Array.isArray(filters)) {
      throw new Error('Invalid database request');
    }

    const requestFilters = filters.map((filter: Filter) => ({ ...filter }));
    const user = await readSession(request);
    authorize(collection, operation, user, requestFilters);

    let data: any;
    if (operation === 'select') data = (await selectRecords(collection, requestFilters, order, limit, range)).map(parseRecord);
    else if (operation === 'insert') data = await insertRecords(collection, payload, user);
    else if (operation === 'update') data = await updateRecords(collection, payload, requestFilters, user);
    else if (operation === 'delete') data = await deleteRecords(collection, requestFilters);
    else if (operation === 'upsert') data = await upsertRecord(collection, payload, conflict, user);
    else throw new Error('Unsupported database operation');

    if (mode === 'single') {
      if (Array.isArray(data)) {
        if (!data.length) return response.status(404).json({ data: null, error: { message: 'Record not found' } });
        data = data[0];
      }
    }
    if (mode === 'maybeSingle' && Array.isArray(data)) data = data[0] ?? null;

    return response.status(200).json({ data, error: null });
  } catch (error) {
    const result = toErrorResponse(error);
    return response.status(result.status).json({ data: null, error: result.error });
  }
}
