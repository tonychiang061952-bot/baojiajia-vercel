type DbError = { message: string; code?: string; status?: number };
type DbResult<T> = { data: T | null; error: DbError | null };

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

type Order = { column: string; ascending?: boolean };

type Operation = 'select' | 'insert' | 'update' | 'delete' | 'upsert';

class QueryBuilder implements PromiseLike<DbResult<any>> {
  private operation: Operation = 'select';
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private payload: unknown;
  private conflict?: string;
  private limitValue?: number;
  private rangeValue?: [number, number];
  private responseMode?: 'single' | 'maybeSingle';

  private readonly collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  select(_columns = '*') {
    return this;
  }

  insert(payload: unknown) {
    this.operation = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: unknown) {
    this.operation = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  upsert(payload: unknown, options?: { onConflict?: string }) {
    this.operation = 'upsert';
    this.payload = payload;
    this.conflict = options?.onConflict;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  ilike(column: string, value: string) {
    this.filters.push({ column, operator: 'ilike', value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ column, operator: 'in', value });
    return this;
  }

  is(column: string, value: null) {
    this.filters.push({ column, operator: 'is', value });
    return this;
  }

  not(column: string, nestedOperator: string, value: unknown) {
    this.filters.push({ column, operator: 'not', nestedOperator, value });
    return this;
  }

  or(conditions: OrCondition[]) {
    this.filters.push({ column: '__or__', operator: 'or', value: conditions });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending });
    return this;
  }

  limit(value: number) {
    this.limitValue = value;
    return this;
  }

  range(from: number, to: number) {
    this.rangeValue = [from, to];
    return this;
  }

  single() {
    this.responseMode = 'single';
    return this;
  }

  maybeSingle() {
    this.responseMode = 'maybeSingle';
    return this;
  }

  async execute(): Promise<DbResult<any>> {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: this.collection,
          operation: this.operation,
          filters: this.filters,
          order: this.orders,
          payload: this.payload,
          conflict: this.conflict,
          limit: this.limitValue,
          range: this.rangeValue,
          mode: this.responseMode,
        }),
      });
      // Platform-level failures (a crashed function, a gateway error) answer with
      // plain text, so parsing unconditionally would throw and the catch below
      // would hide the status code behind a JSON syntax error.
      const body = await response.text();
      let payload: { data?: unknown; error?: DbError } | null = null;
      try {
        payload = body ? JSON.parse(body) : null;
      } catch {
        return {
          data: null,
          error: { message: `伺服器回應非 JSON (HTTP ${response.status})`, status: response.status },
        };
      }

      return {
        data: payload?.data ?? null,
        error: payload?.error ?? (response.ok ? null : { message: 'Database request failed', status: response.status }),
      };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Database request failed' } };
    }
  }

  then<TResult1 = DbResult<any>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<any>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const db = {
  from(collection: string) {
    return new QueryBuilder(collection);
  },
};
