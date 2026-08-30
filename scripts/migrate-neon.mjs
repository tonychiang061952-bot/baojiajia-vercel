import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing DATABASE_URL');

function splitStatements(source) {
  const statements = [];
  let statement = '';
  let quote = null;
  let dollarTag = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    statement += character;

    if (lineComment) {
      if (character === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        statement += next;
        index += 1;
        blockComment = false;
      }
      continue;
    }
    if (quote) {
      if (character === quote && source[index - 1] !== '\\') quote = null;
      continue;
    }
    if (dollarTag) {
      if (source.startsWith(dollarTag, index)) {
        statement += source.slice(index + 1, index + dollarTag.length);
        index += dollarTag.length - 1;
        dollarTag = null;
      }
      continue;
    }
    if (character === '-' && next === '-') {
      statement += next;
      index += 1;
      lineComment = true;
      continue;
    }
    if (character === '/' && next === '*') {
      statement += next;
      index += 1;
      blockComment = true;
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      continue;
    }
    if (character === '$') {
      const match = source.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
      if (match) {
        dollarTag = match[0];
        statement += match[0].slice(1);
        index += match[0].length - 1;
        continue;
      }
    }
    if (character === ';') {
      const trimmed = statement.slice(0, -1).trim();
      if (trimmed) statements.push(trimmed);
      statement = '';
    }
  }

  const trailing = statement.trim();
  if (trailing) statements.push(trailing);
  return statements;
}

const sql = neon(databaseUrl);
const migrationDir = resolve('db/migrations');
const migrationFiles = readdirSync(migrationDir).filter((file) => file.endsWith('.sql')).sort();

await sql.query(
  `create table if not exists schema_migrations (
     filename text primary key,
     applied_at timestamptz not null default now()
   )`,
);

for (const filename of migrationFiles) {
  const alreadyApplied = await sql.query('select 1 from schema_migrations where filename = $1', [filename]);
  if (alreadyApplied.length) continue;

  const source = readFileSync(resolve(migrationDir, filename), 'utf8');
  const statements = splitStatements(source);
  await sql.transaction((transaction) => [
    ...statements.map((statement) => transaction.query(statement)),
    transaction.query('insert into schema_migrations (filename) values ($1)', [filename]),
  ]);
  console.log(`Applied ${filename}.`);
}
