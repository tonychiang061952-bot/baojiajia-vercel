create unique index if not exists app_records_blog_slug_unique_idx
  on app_records (collection, lower(data->>'slug'))
  where collection = 'blog_posts'
    and coalesce(data->>'slug', '') <> '';

create unique index if not exists app_records_download_limit_email_unique_idx
  on app_records (collection, lower(data->>'email'))
  where collection = 'user_download_limits';

create table if not exists request_rate_limits (
  bucket text primary key,
  hits integer not null check (hits > 0),
  expires_at timestamptz not null
);

create index if not exists request_rate_limits_expires_at_idx
  on request_rate_limits (expires_at);
