create extension if not exists pgcrypto;

create table if not exists app_records (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in (
    'about_content', 'blog_categories', 'blog_posts', 'carousel_settings',
    'contact_info', 'contact_submissions', 'core_values', 'customer_reviews',
    'features', 'hero_carousel', 'homepage_content', 'member_submissions',
    'navigation_items', 'pdf_templates', 'service_details', 'service_items',
    'site_settings', 'statistics', 'system_settings', 'team_members',
    'testimonials', 'user_download_limits'
  )),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_records_collection_idx on app_records (collection);
create index if not exists app_records_collection_updated_at_idx on app_records (collection, updated_at desc);
create index if not exists app_records_data_idx on app_records using gin (data);

create table if not exists admin_users (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
